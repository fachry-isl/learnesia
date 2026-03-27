/**
 * Core data interfaces for Learnesia
 */

export interface Course {
  id: number | string;
  course_name: string;
  course_description?: string;
  course_learning_objectives?: string[];
  course_tags?: string[];
  status?: "draft" | "published" | "archived";
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: number | string;
  course: number | string;
  lesson_name: string;
  lesson_content?: string;
  order: number;
  created_at?: string;
}

export interface Quiz {
  id: number | string;
  lesson: number | string;
  quiz_title: string;
  quiz_description?: string;
  questions?: QuizQuestion[];
  created_at?: string;
}

export interface QuizQuestion {
  id: number | string;
  quiz: number | string;
  question_text: string;
  explanation?: string;
  order: number;
  options?: QuestionOption[];
  created_at?: string;
}

export interface QuestionOption {
  id: number | string;
  question: number | string;
  option_text: string;
  is_correct: boolean;
  order: number;
  created_at?: string;
}

export interface Reference {
  id: number | string;
  lesson: number | string;
  reference_title: string;
  reference_url: string;
  created_at?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}
