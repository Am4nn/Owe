import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import type { Expense } from '@/features/expenses/types'

export async function exportGroupCsv(groupId: string, expenses: Expense[]): Promise<void> {
  const BOM = '\uFEFF'  // UTF-8 BOM for Excel/Numbers compatibility
  const header = 'Date,Description,Amount,Currency,Base Amount,Base Currency,Split Type,Category\n'

  const rows = expenses.map((e) => {
    const desc = `"${(e.description ?? '').replace(/"/g, '""')}"`
    const cat = `"${(e.category ?? '').replace(/"/g, '""')}"`
    return [
      e.expense_date,
      desc,
      (e.amount_cents / 100).toFixed(2),
      e.currency,
      (e.amount_base_cents / 100).toFixed(2),
      e.base_currency,
      e.split_type,
      cat,
    ].join(',')
  })

  const csv = BOM + header + rows.join('\n')

  // expo-file-system v2 API: use File + Paths.cache
  const file = new File(Paths.cache, `expenses-${groupId}-${Date.now()}.csv`)
  file.write(csv)

  const isAvailable = await Sharing.isAvailableAsync()
  if (isAvailable) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Expenses',
      UTI: 'public.comma-separated-values-text',  // iOS UTI for CSV
    })
  }
}
