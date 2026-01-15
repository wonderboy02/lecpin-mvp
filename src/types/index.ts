// ============================================
// Database Types (Supabase Tables)
// ============================================

// 지원 언어
export type Language = 'ko' | 'en'

// 언어 설정 관련
export interface LanguageConfig {
  code: Language
  label: string
  flag: string
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
]

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  github_username: string | null
  github_token: string | null
  preferred_language: Language
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Lecture {
  id: string
  user_id: string
  title: string
  youtube_url: string
  youtube_id: string
  thumbnail_url: string | null
  language: string | null
  duration_seconds: number | null
  transcript: string | null
  status: 'pending' | 'extracting' | 'analyzing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface LectureWithCompetencies extends Lecture {
  competencies: Competency[]
}

export interface Competency {
  id: string
  lecture_id: string
  name: string
  description: string
  order_index: number
  created_at: string
}

export interface Task {
  id: string
  lecture_id: string
  title: string
  description: string
  reason: string
  estimated_time: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tech_stack: string[]
  steps: TaskStep[]
  success_criteria: string[]
  github_repo_url: string | null
  created_at: string
  updated_at: string
}

export interface TaskStep {
  order: number
  title?: string
  content: string
}

export interface Submission {
  id: string
  task_id: string
  user_id: string
  submission_type: 'github' | 'upload'
  github_repo_url: string | null
  file_path: string | null
  description: string | null
  status: 'pending' | 'reviewing' | 'completed' | 'failed'
  attempt_number: number
  created_at: string
  updated_at: string
}

export interface SubmissionWithFeedback extends Submission {
  feedback: Feedback | null
}

export interface Feedback {
  id: string
  submission_id: string
  overall_score: number
  grade: 'Poor' | 'Fair' | 'Good' | 'Excellent'
  summary: string
  code_quality: CodeQuality
  strengths: FeedbackItem[]
  improvements: ImprovementItem[]
  next_steps: string[]
  created_at: string
}

export interface CodeQuality {
  readability: number
  maintainability: number
  correctness: number
  best_practices: number
}

export interface FeedbackItem {
  title: string
  detail: string
  file?: string
}

export interface ImprovementItem extends FeedbackItem {
  severity: 'critical' | 'major' | 'minor' | 'suggestion'
  suggestion: string
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ============================================
// UI State Types
// ============================================

export type Step = 'input' | 'summary' | 'task' | 'submit' | 'feedback' | 'completed'

export interface AppState {
  currentStep: Step
  lecture: LectureWithCompetencies | null
  task: Task | null
  submission: Submission | null
  feedback: Feedback | null
  isLoading: boolean
  error: string | null
}

// ============================================
// User Task Types (Dashboard)
// ============================================

export type UserTaskStatus = 'in_progress' | 'completed' | 'abandoned'

export interface UserTask {
  id: string
  user_id: string
  lecture_id: string
  task_id: string | null
  submission_id: string | null
  feedback_id: string | null
  current_step: Step
  status: UserTaskStatus
  created_at: string
  updated_at: string
}

export interface UserTaskWithRelations extends UserTask {
  lecture: LectureWithCompetencies
  task?: Task
  submission?: Submission
  feedback?: Feedback
}
