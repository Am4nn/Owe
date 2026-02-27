export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  push_token: string | null
  created_at: string
  updated_at: string
}

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
  displayName: string
}

export interface UpdateProfileInput {
  display_name?: string
  avatar_url?: string
}
