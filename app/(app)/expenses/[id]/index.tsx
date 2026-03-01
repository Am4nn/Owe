import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
} from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useExpense, useDeleteExpense } from '@/features/expenses/hooks'
import { CATEGORIES } from '@/features/expenses/categories'
import {
  useReactions,
  useAddReaction,
  useRemoveReaction,
  useComments,
  useAddComment,
} from '@/features/activity/hooks'
import { supabase } from '@/lib/supabase'
import type { Reaction } from '@/features/activity/types'

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🙏', '💯']

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: expense, isLoading } = useExpense(id)
  const deleteExpense = useDeleteExpense()

  const { data: reactions = [] } = useReactions(id)
  const addReaction = useAddReaction()
  const removeReaction = useRemoveReaction()

  const { data: comments = [] } = useComments(id)
  const addComment = useAddComment()

  const [commentText, setCommentText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Fetch current user id once for reaction highlight logic
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })
  }, [])

  const category = expense?.category ? CATEGORIES.find(c => c.id === expense.category) : null

  // Find the current user's reaction (if any) — reactions store user_id (auth.uid, not member_id)
  const myReaction = reactions.find((r: Reaction) => r.user_id === currentUserId)

  function handleDelete() {
    Alert.alert(
      'Delete expense?',
      'This will permanently remove the expense from the group.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (!expense) return
            deleteExpense.mutate(
              { id: expense.id, group_id: expense.group_id },
              {
                onSuccess: () => {
                  router.canGoBack() ? router.back() : router.replace('/(app)')
                },
                onError: (err) => {
                  Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete expense')
                },
              }
            )
          },
        },
      ]
    )
  }

  function handleEmojiTap(emoji: string) {
    setShowEmojiPicker(false)
    addReaction.mutate({ expense_id: id, emoji })
  }

  function handleReactionChipTap(reaction: Reaction) {
    if (reaction.user_id === currentUserId) {
      // Own reaction — remove it
      removeReaction.mutate({ expense_id: id })
    }
  }

  function handleSendComment() {
    const trimmed = commentText.trim()
    if (!trimmed) return
    addComment.mutate(
      { expense_id: id, body: trimmed },
      {
        onSuccess: () => setCommentText(''),
        onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add comment'),
      }
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator color="#6C63FF" />
      </View>
    )
  }

  if (!expense) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <Text className="text-white/50">Expense not found</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-dark-bg">
      <Stack.Screen
        options={{
          title: 'Expense detail',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/(app)/expenses/${id}/edit` as Parameters<typeof router.push>[0])}
              className="mr-2"
            >
              <Text className="text-brand-primary font-semibold">Edit</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View className="px-4 pt-4 pb-8">
        {/* Expense header */}
        <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-5 mb-4">
          <Text className="text-white font-bold text-xl">{expense.description}</Text>
          <Text className="text-brand-primary font-bold text-2xl mt-1">
            {formatCents(expense.amount_cents)}
          </Text>

          <View className="mt-3 gap-1">
            <View className="flex-row">
              <Text className="text-white/40 text-sm w-24">Date</Text>
              <Text className="text-white/80 text-sm">{formatDate(expense.expense_date)}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-white/40 text-sm w-24">Split type</Text>
              <Text className="text-white/80 text-sm capitalize">{expense.split_type}</Text>
            </View>
            {category && (
              <View className="flex-row">
                <Text className="text-white/40 text-sm w-24">Category</Text>
                <Text className="text-white/80 text-sm">
                  {category.icon} {category.label}
                </Text>
              </View>
            )}
            <View className="flex-row">
              <Text className="text-white/40 text-sm w-24">Currency</Text>
              <Text className="text-white/80 text-sm">{expense.currency}</Text>
            </View>
          </View>
        </View>

        {/* Splits */}
        {expense.expense_splits && expense.expense_splits.length > 0 && (
          <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4 mb-4">
            <Text className="text-white/50 text-xs uppercase tracking-wide mb-3">Splits</Text>
            {expense.expense_splits.map(split => (
              <View
                key={split.id}
                className="flex-row justify-between py-2 border-b border-dark-border last:border-0"
              >
                <Text className="text-white/70 text-sm">{split.member_id}</Text>
                <Text className="text-white font-medium text-sm">
                  {formatCents(split.amount_cents)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Reactions */}
        <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4 mb-4">
          <Text className="text-white/50 text-xs uppercase tracking-wide mb-3">Reactions</Text>
          <View className="flex-row flex-wrap gap-2">
            {reactions.map((reaction: Reaction) => {
              const isOwn = reaction.user_id === currentUserId
              return (
                <TouchableOpacity
                  key={reaction.id}
                  onPress={() => handleReactionChipTap(reaction)}
                  className={`px-3 py-1.5 rounded-full border ${isOwn
                      ? 'bg-brand-primary/20 border-brand-primary'
                      : 'bg-dark-border border-dark-border'
                    }`}
                >
                  <Text className="text-base">{reaction.emoji}</Text>
                </TouchableOpacity>
              )
            })}
            {/* Add reaction button */}
            {!myReaction && (
              <TouchableOpacity
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                className="px-3 py-1.5 rounded-full border border-dark-border bg-dark-border"
              >
                <Text className="text-white/50 text-base">+</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <View className="flex-row flex-wrap gap-3 mt-3 pt-3 border-t border-dark-border">
              {EMOJI_OPTIONS.map(emoji => (
                <TouchableOpacity key={emoji} onPress={() => handleEmojiTap(emoji)}>
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Comments */}
        <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4 mb-4">
          <Text className="text-white/50 text-xs uppercase tracking-wide mb-3">Comments</Text>

          {comments.length === 0 ? (
            <Text className="text-white/30 text-sm mb-3">No comments yet</Text>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={c => c.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="mb-3">
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text className="text-brand-primary text-xs font-semibold">
                      {item.author_display_name ?? 'Member'}
                    </Text>
                    <Text className="text-white/30 text-xs">
                      {formatRelativeTime(item.created_at)}
                    </Text>
                  </View>
                  <Text className="text-white text-sm">{item.body}</Text>
                </View>
              )}
            />
          )}

          {/* Comment input */}
          <View className="flex-row items-center gap-2 mt-2 pt-3 border-t border-dark-border">
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="flex-1 text-white text-sm"
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleSendComment}
            />
            <TouchableOpacity
              onPress={handleSendComment}
              disabled={addComment.isPending || !commentText.trim()}
            >
              {addComment.isPending ? (
                <ActivityIndicator color="#6C63FF" size="small" />
              ) : (
                <Text className="text-brand-primary font-semibold text-sm">Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleteExpense.isPending}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl py-4 items-center mt-2"
        >
          {deleteExpense.isPending ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <Text className="text-red-400 font-semibold text-base">Delete expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
