// Types for the engagement layer — push notifications and smart reminders (Phase 03-01)

export interface ReminderConfig {
  id: string
  user_id: string
  group_id: string
  enabled: boolean
  delay_days: number
  created_at: string
  updated_at: string
}

export interface UpsertReminderConfigInput {
  group_id: string
  enabled: boolean
  delay_days: number
}
