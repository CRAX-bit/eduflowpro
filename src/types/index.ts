export type Role = 'teacher' | 'student';

export interface Student {
  id: string;
  name: string;
  color: string;
  username: string;
  password?: string;
}

export type AssignmentType = 'note' | 'test' | 'book';

export interface Question {
  q: string;
  a: string;
  options?: string[]; // Optional multiple choice or hints
  explanation?: string;
}

export interface StudentAnswer {
  given: string;
  ok: boolean;
}

export interface Submission {
  answers?: StudentAnswer[];
  correct?: number;
  total?: number;
  percent?: number;
  photo?: string;
  feedback?: string;
  at: number;
  timedOut?: boolean;
}

export interface Assignment {
  id: string;
  type: AssignmentType;
  title: string;
  folder: string;
  target: string; // 'all' or studentId
  desc?: string;
  fileName?: string | null;
  fileData?: string | null;
  timeLimit?: number; // seconds
  questions?: Question[];
  createdAt: number;
  submissions: Record<string, Submission>; // key is studentId
  teacherId?: string;
}

export interface UserSession {
  role: Role;
  studentId?: string;
  email?: string;
  name?: string;
  supabaseId?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: Role;
  email?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface EduFlowState {
  students: Student[];
  assignments: Assignment[];
  session: UserSession | null;
  currentStudentId: string | null;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warn' | 'info' | 'error';
}
