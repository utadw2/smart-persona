// Database types
export interface Profile {
  id: string
  email: string
  full_name: string
  role: "admin" | "user"
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  twitter?: string
  linkedin?: string
  github?: string
  created_at: string
  updated_at: string
}

export interface Persona {
  id: string
  user_id: string
  name: string
  description: string
  tone: string
  response_style: string
  personality_traits: Record<string, any>
  visibility: "published" | "private"
  is_active: boolean // Kept for backward compatibility, synced with visibility
  is_public: boolean // For community visibility
  views_count?: number
  career?: {
    title?: string
    experience_years?: number
    industry?: string
    specializations?: string[]
  }
  education?: {
    degree?: string
    field?: string
    institution?: string
    graduation_year?: number
  }
  projects?: Array<{
    title: string
    description: string
    technologies?: string[]
    link?: string
  }>
  job_preferences?: {
    remote?: boolean
    location?: string[]
    job_types?: string[]
    salary_range?: { min: number; max: number }
  }
  created_at: string
  updated_at: string
}

export interface Channel {
  id: string
  name: string
  type: string
  icon: string
  is_enabled: boolean
  config?: Record<string, any>
  created_at: string
}

export interface UserChannel {
  id: string
  user_id: string
  channel_id: string
  persona_id?: string
  is_connected: boolean
  credentials?: Record<string, any>
  created_at: string
  channels?: Channel
}

export interface Message {
  id: string
  user_id: string
  channel_id: string
  persona_id?: string
  content: string
  direction: "inbound" | "outbound"
  sender: string
  recipient: string
  status: "pending" | "sent" | "failed" | "delivered"
  ai_generated: boolean
  metadata?: Record<string, any>
  created_at: string
}

export interface AISettings {
  id: string
  user_id?: string
  model: string
  temperature: number
  max_tokens: number
  auto_reply: boolean
  response_delay: number
  custom_instructions?: string
  is_global: boolean
  created_at: string
  updated_at: string
}

export interface Analytics {
  id: string
  user_id?: string
  channel_id?: string
  date: string
  messages_sent: number
  messages_received: number
  ai_responses: number
  response_time_avg: number
  metadata?: Record<string, any>
  created_at: string
}

// Job and JobMatch types for job matching system
export interface Job {
  id: string
  title: string
  company: string
  description: string
  requirements: string[]
  skills: string[]
  location?: string
  remote: boolean
  job_type?: string
  salary_min?: number
  salary_max?: number
  industry?: string
  experience_required?: number
  posted_date: string
  application_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface JobMatch {
  id: string
  user_id: string
  persona_id: string
  job_id: string
  match_score?: number
  status: "interested" | "applied" | "rejected" | "saved"
  notes?: string
  created_at: string
  updated_at: string
  jobs?: Job
}

export interface JobWithMatch extends Job {
  match_score?: number
  match_status?: string
}

export interface UserPreferences {
  id: string
  user_id: string
  remember_me: boolean
  session_timeout_minutes: number
  auto_logout: boolean
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  email_notifications: boolean
  push_notifications: boolean
  notification_frequency: "instant" | "daily" | "weekly" | "never"
  profile_visibility: "public" | "private" | "connections_only"
  show_online_status: boolean
  allow_messages: boolean
  created_at: string
  updated_at: string
}

// Community post types
export interface CommunityPost {
  id: string
  user_id: string
  persona_id?: string
  title: string
  content: string
  post_type: "text" | "project" | "achievement" | "question"
  tags?: string[]
  likes_count: number
  comments_count: number
  views_count: number
  is_published: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  profiles?: Profile
  personas?: Persona
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  type:
    | "job_match"
    | "community_like"
    | "community_comment"
    | "persona_view"
    | "system"
    | "message"
    | "follow"
    | "endorsement"
  title: string
  message: string
  link?: string
  is_read: boolean
  metadata?: Record<string, any>
  created_at: string
}

// Analytics aggregation types
export interface AnalyticsSummary {
  totalMessages: number
  totalAIResponses: number
  totalUsers: number
  totalPersonas: number
  messagesChange: number
  aiResponsesChange: number
  usersChange: number
  personasChange: number
}

export interface PersonaAnalytics {
  persona_id: string
  persona_name: string
  views_count: number
  messages_sent: number
  ai_responses: number
  engagement_rate: number
}

// Follow type
export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

// Skill endorsement type
export interface SkillEndorsement {
  id: string
  persona_id: string
  skill: string
  endorser_id: string
  created_at: string
  profiles?: Profile
}

export interface SkillWithEndorsements {
  skill: string
  endorsement_count: number
  is_endorsed_by_current_user: boolean
}
