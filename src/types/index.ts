export type Role = 'teacher' | 'student';

export interface Student {
  id: string;
  name: string;
  color: string;
  username: string;
  password?: string;
  gradeLevel?: string;
  /** 6 haneli otomatik öğrenci numarası (profiles.student_no) */
  studentNo?: string;
  /** Öğrenci ekleme isteğinin id'si (student_requests.id) */
  requestId?: string;
  email?: string;
}

export type StudentRequestStatus = 'pending' | 'accepted' | 'rejected';

/** Öğretmen tarafında görünen istek/öğrenci kaydı */
export interface TeacherStudentRequest {
  requestId: string;
  studentId: string;
  studentNo: string;
  /** pending ise maskeli ("Z*** Ç***"), accepted ise tam ad */
  displayName: string;
  isMasked: boolean;
  gradeLevel?: string | null;
  email?: string | null;
  status: StudentRequestStatus;
  createdAt: number;
  respondedAt?: number | null;
}

/** Öğrenci tarafında görünen gelen istek */
export interface IncomingStudentRequest {
  requestId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string | null;
  branch?: string | null;
  status: StudentRequestStatus;
  createdAt: number;
}

/** Numara sorgusu sonucu (isim maskeli döner) */
export interface StudentLookupResult {
  studentId: string;
  maskedName: string;
  gradeLevel?: string | null;
  alreadySent: boolean;
  requestStatus?: StudentRequestStatus | null;
}

export type AssignmentType = 'note' | 'test' | 'book';

export interface Question {
  q: string;
  a: string;
  question?: string;
  correctAnswer?: string;
  options?: string[]; // Optional multiple choice or hints
  o?: string[]; // Alias for options
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
  responseText?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileAttachment?: {
    fileUrl: string;
    fileName: string;
    fileType?: string;
    fileSize?: number;
  };
  feedback?: string;
  finalScore?: number;
  aiScore?: number;
  aiFeedback?: string;
  aiStrengths?: string[];
  aiImprovements?: string[];
  status?: 'pending' | 'graded_by_ai' | 'reviewed';
  note?: string; // Öğrencinin "Yapamadım" notu
  at: number;
  timedOut?: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  subject?: string;
  description?: string;
  joinCode: string;
  teacherId: string;
  teacherName?: string;
  createdAt: number;
  memberCount?: number;
}

export interface ClassroomMember {
  id: string;
  classroomId: string;
  studentId: string;
  studentName?: string;
  joinedAt: number;
}

export interface Assignment {
  id: string;
  type: AssignmentType;
  title: string;
  folder: string;
  target: string; // 'all' or studentId
  targetMode?: 'all' | 'individual'; // Atama modu toggle'ı
  classroomId?: string; // Target classroom id
  classroomName?: string;
  desc?: string;
  fileName?: string | null;
  fileData?: string | null;
  timeLimit?: number; // seconds
  deadline?: number; // Unix ms timestamp — son teslim tarihi
  questions?: Question[];
  createdAt: number;
  submissions: Record<string, Submission>; // key is studentId
  teacherId?: string;
}

export interface UserSession {
  role: Role;
  studentId?: string;
  /** Öğrenci hesabının 6 haneli numarası */
  studentNo?: string;
  email?: string;
  name?: string;
  supabaseId?: string;
  gradeLevel?: string;
  branch?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: Role;
  email?: string;
  student_no?: string;
  avatar_url?: string;
  grade_level?: string;
  branch?: string;
  created_at?: string;
}

export interface EduFlowState {
  students: Student[];
  assignments: Assignment[];
  classrooms: Classroom[];
  joinedClassrooms: Classroom[];
  session: UserSession | null;
  currentStudentId: string | null;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warn' | 'info' | 'error';
}

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}
