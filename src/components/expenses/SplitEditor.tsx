import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import type { GroupMember } from '@/features/groups/types'
import type { SplitType, SplitInput } from '@/features/expenses/types'
import {
  computeEqualSplits,
  computeExactSplits,
  computePercentageSplits,
  computeSharesSplits,
} from '@/features/expenses/splits'

interface SplitEditorProps {
  members: GroupMember[]
  totalCents: number
  splitType: SplitType
  onSplitTypeChange: (type: SplitType) => void
  onSplitsChange: (splits: SplitInput[]) => void
}

const SPLIT_TABS: { type: SplitType; label: string }[] = [
  { type: 'equal', label: 'Equal' },
  { type: 'exact', label: 'Exact' },
  { type: 'percentage', label: 'Percentage' },
  { type: 'shares', label: 'Shares' },
]

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function SplitEditor({
  members,
  totalCents,
  splitType,
  onSplitTypeChange,
  onSplitsChange,
}: SplitEditorProps) {
  // State for exact mode: member_id -> amount_cents string
  const [exactValues, setExactValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(members.map(m => [m.id, '']))
  )

  // State for percentage mode: member_id -> percentage string
  const [percentageValues, setPercentageValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(members.map(m => [m.id, '']))
  )

  // State for shares mode: member_id -> shares integer
  const [sharesValues, setSharesValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(members.map(m => [m.id, 1]))
  )

  // Recompute equal splits whenever totalCents or members change
  useEffect(() => {
    if (splitType === 'equal' && members.length > 0 && totalCents > 0) {
      try {
        const results = computeEqualSplits(totalCents, members.map(m => m.id))
        onSplitsChange(results.map(r => ({ member_id: r.member_id, amount_cents: r.amount_cents })))
      } catch {
        // ignore compute errors
      }
    }
  }, [splitType, totalCents, members]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recompute shares splits reactively
  useEffect(() => {
    if (splitType === 'shares' && members.length > 0 && totalCents > 0) {
      try {
        const memberSharesInput = members.map(m => ({
          member_id: m.id,
          shares: sharesValues[m.id] ?? 1,
        }))
        const results = computeSharesSplits(totalCents, memberSharesInput)
        onSplitsChange(results.map(r => ({ member_id: r.member_id, amount_cents: r.amount_cents })))
      } catch {
        // ignore compute errors
      }
    }
  }, [splitType, totalCents, sharesValues, members]) // eslint-disable-line react-hooks/exhaustive-deps

  const exactSum = Object.values(exactValues).reduce((s, v) => s + (parseInt(v, 10) || 0), 0)
  const percentageSum = Object.values(percentageValues).reduce((s, v) => s + (parseFloat(v) || 0), 0)
  const exactValid = exactSum === totalCents
  const percentageValid = Math.abs(percentageSum - 100) <= 0.01

  function handleExactChange(memberId: string, value: string) {
    const next = { ...exactValues, [memberId]: value }
    setExactValues(next)
    const sum = Object.values(next).reduce((s, v) => s + (parseInt(v, 10) || 0), 0)
    if (sum === totalCents) {
      try {
        const inputs = members.map(m => ({
          member_id: m.id,
          amount_cents: parseInt(next[m.id] ?? '0', 10) || 0,
        }))
        const results = computeExactSplits(totalCents, inputs)
        onSplitsChange(results.map(r => ({ member_id: r.member_id, amount_cents: r.amount_cents })))
      } catch {
        // invalid
      }
    }
  }

  function handlePercentageChange(memberId: string, value: string) {
    const next = { ...percentageValues, [memberId]: value }
    setPercentageValues(next)
    const sum = Object.values(next).reduce((s, v) => s + (parseFloat(v) || 0), 0)
    if (Math.abs(sum - 100) <= 0.01) {
      try {
        const inputs = members.map(m => ({
          member_id: m.id,
          percentage: parseFloat(next[m.id] ?? '0') || 0,
        }))
        const results = computePercentageSplits(totalCents, inputs)
        onSplitsChange(results.map(r => ({ member_id: r.member_id, amount_cents: r.amount_cents })))
      } catch {
        // invalid
      }
    }
  }

  function handleSharesChange(memberId: string, delta: number) {
    setSharesValues(prev => ({
      ...prev,
      [memberId]: Math.max(1, (prev[memberId] ?? 1) + delta),
    }))
  }

  return (
    <View className="mt-4">
      {/* Split type tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2">
          {SPLIT_TABS.map(tab => (
            <TouchableOpacity
              key={tab.type}
              onPress={() => onSplitTypeChange(tab.type)}
              className={`px-4 py-2 rounded-full ${
                splitType === tab.type ? 'bg-brand-primary' : 'bg-dark-surface'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  splitType === tab.type ? 'text-white' : 'text-white/60'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Equal mode */}
      {splitType === 'equal' && (
        <View>
          {members.map(member => {
            const amount = totalCents > 0
              ? computeEqualSplits(totalCents, members.map(m => m.id)).find(r => r.member_id === member.id)?.amount_cents ?? 0
              : 0
            return (
              <View key={member.id} className="flex-row items-center justify-between py-2 border-b border-dark-border">
                <Text className="text-white text-sm">{member.display_name}</Text>
                <Text className="text-white/50 text-sm">{formatCents(amount)}</Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Exact mode */}
      {splitType === 'exact' && (
        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/50 text-xs">Total entered</Text>
            <Text className={`text-xs font-medium ${exactValid ? 'text-green-400' : 'text-red-400'}`}>
              {formatCents(exactSum)} / {formatCents(totalCents)}
            </Text>
          </View>
          {members.map(member => (
            <View key={member.id} className="mb-3">
              <Text className="text-white/70 text-sm mb-1">{member.display_name}</Text>
              <TextInput
                value={exactValues[member.id] ?? ''}
                onChangeText={v => handleExactChange(member.id, v)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.3)"
                className={`bg-dark-surface rounded-xl px-4 py-3 text-white border ${
                  exactValid ? 'border-dark-border' : 'border-red-500'
                }`}
              />
              <Text className="text-white/30 text-xs mt-1">
                {formatCents(parseInt(exactValues[member.id] ?? '0', 10) || 0)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Percentage mode */}
      {splitType === 'percentage' && (
        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/50 text-xs">Total percentage</Text>
            <Text className={`text-xs font-medium ${percentageValid ? 'text-green-400' : 'text-red-400'}`}>
              {percentageSum.toFixed(1)}% / 100%
            </Text>
          </View>
          {members.map(member => {
            const pct = parseFloat(percentageValues[member.id] ?? '0') || 0
            const previewCents = totalCents > 0 ? Math.round((pct / 100) * totalCents) : 0
            return (
              <View key={member.id} className="mb-3">
                <Text className="text-white/70 text-sm mb-1">{member.display_name}</Text>
                <TextInput
                  value={percentageValues[member.id] ?? ''}
                  onChangeText={v => handlePercentageChange(member.id, v)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  className="bg-dark-surface rounded-xl px-4 py-3 text-white border border-dark-border"
                />
                <Text className="text-white/30 text-xs mt-1">
                  {formatCents(previewCents)}
                </Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Shares mode */}
      {splitType === 'shares' && (
        <View>
          {(() => {
            const totalSharesVal = members.reduce((s, m) => s + (sharesValues[m.id] ?? 1), 0)
            return members.map(member => {
              const shares = sharesValues[member.id] ?? 1
              const previewCents = totalCents > 0 && totalSharesVal > 0
                ? Math.floor((shares / totalSharesVal) * totalCents)
                : 0
              return (
                <View key={member.id} className="flex-row items-center justify-between py-2 border-b border-dark-border">
                  <View className="flex-1">
                    <Text className="text-white text-sm">{member.display_name}</Text>
                    <Text className="text-white/30 text-xs mt-0.5">{formatCents(previewCents)}</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => handleSharesChange(member.id, -1)}
                      className="w-8 h-8 bg-dark-surface rounded-full items-center justify-center"
                    >
                      <Text className="text-white text-lg">-</Text>
                    </TouchableOpacity>
                    <Text className="text-white font-semibold w-6 text-center">{shares}</Text>
                    <TouchableOpacity
                      onPress={() => handleSharesChange(member.id, 1)}
                      className="w-8 h-8 bg-brand-primary rounded-full items-center justify-center"
                    >
                      <Text className="text-white text-lg">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })
          })()}
        </View>
      )}
    </View>
  )
}
