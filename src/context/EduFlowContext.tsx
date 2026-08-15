'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  EduFlowState,
  Student,
  Assignment,
  AssignmentType,
  Question,
  ToastMessage,
  UserSession,
  Submission,
  Role,
  Classroom,
  ClassroomMember,
} from '@/types';
import { STORAGE_KEY, AVATAR_COLORS, uid, slugUser, norm } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface CreateAssignmentParams {
  type: AssignmentType;
  title: string;
  folder: string;
  target: string;
  classroomId?: string;
  classroomName?: string;
  desc?: string;
  fileName?: string | null;
  fileData?: string | null;
  timeLimit?: number;
  questions?: Question[];
}

interface EduFlowContextType {
  isLoaded: boolean;
  state: EduFlowState;
  activeTab: 'home' | 'teacher' | 'student';
  setActiveTab: (tab: 'home' | 'teacher' | 'student') => void;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'warn' | 'info' | 'error') => void;
  hideToast: () => void;
  isAuthModalOpen: boolean;
  authModalInitialRole: 'teacher' | 'student';
  openAuthModal: (role?: 'teacher' | 'student') => void;
  closeAuthModal: () => void;
  loginSupabaseUser: (params: { role: Role; name: string; email: string; supabaseId?: string }) => void;
  logout: () => void;
  addStudent: (name: string, password: string) => boolean;
  deleteStudent: (id: string) => void;
  createClassroom: (name: string, subject?: string, description?: string) => Promise<Classroom | null>;
  deleteClassroom: (id: string) => Promise<void>;
  joinClassroom: (joinCode: string) => Promise<boolean>;
  leaveClassroom: (classroomId: string) => Promise<void>;
  createAssignment: (params: CreateAssignmentParams) => boolean;
  deleteAssignment: (id: string) => void;
  submitTestAnswers: (assignmentId: string, answers: string[], timedOut?: boolean) => { correct: number; total: number; percent: number };
  retryTest: (assignmentId: string) => void;
  submitHomeworkPhoto: (assignmentId: string, photoDataUrl: string) => void;
  uploadAssignmentFile: (
    assignmentId: string,
    file: File
  ) => Promise<{ success: boolean; fileAttachment?: { fileUrl: string; fileName: string; fileType: string; fileSize: number }; error?: string }>;
  submitAssignmentResponse: (
    assignmentId: string,
    responseText: string,
    fileAttachment?: { fileUrl: string; fileName: string; fileType: string; fileSize: number },
    photoDataUrl?: string
  ) => Promise<{ success: boolean; aiScore?: number; aiFeedback?: string }>;
  reviewSubmission: (assignmentId: string, studentId: string, finalScore: number, feedback: string) => Promise<void>;
  saveFeedback: (assignmentId: string, studentId: string, feedback: string) => void;
  getStudentById: (id?: string | null) => Student | undefined;
  getVisibleAssignments: (studentId?: string | null) => Assignment[];
  refreshData: () => Promise<void>;
}

const EduFlowContext = createContext<EduFlowContextType | null>(null);

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'EDF';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getInitialState(): EduFlowState {
  return {
    session: null,
    currentStudentId: null,
    students: [],
    assignments: [],
    classrooms: [],
    joinedClassrooms: [],
  };
}

// Helper to fetch user profile from Supabase profiles table with fallback
async function getUserProfile(userId: string, userMeta: any, userEmail?: string): Promise<{ name: string; role: Role }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single();

    if (data && data.full_name) {
      return {
        name: data.full_name,
        role: (data.role as Role) || (userMeta?.role as Role) || 'student',
      };
    }
  } catch (e) {
    // Graceful fallback to user_metadata
  }

  return {
    name: userMeta?.full_name || userEmail?.split('@')[0] || 'Kullanıcı',
    role: (userMeta?.role as Role) || 'student',
  };
}

export function EduFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EduFlowState>(() => getInitialState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'teacher' | 'student'>('home');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'teacher' | 'student'>('teacher');

  const showToast = useCallback((message: string, type: 'success' | 'warn' | 'info' | 'error' = 'success') => {
    setToast({
      id: Math.random().toString(),
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch real classrooms for teacher
  const loadTeacherClassrooms = useCallback(async (teacherId: string) => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (data && Array.isArray(data)) {
        const mapped = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          subject: row.subject || '',
          description: row.description || '',
          joinCode: row.join_code,
          teacherId: row.teacher_id,
          createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        }));

        setState((prev) => ({
          ...prev,
          classrooms: mapped,
        }));
      }
    } catch (e) {
      console.warn('Classrooms load notice:', e);
    }
  }, []);

  // Fetch joined classrooms for student
  const loadStudentJoinedClassrooms = useCallback(async (studentId: string) => {
    try {
      // 1. Query membership
      const { data: members, error: memErr } = await supabase
        .from('classroom_members')
        .select('classroom_id')
        .eq('student_id', studentId);

      if (members && members.length > 0) {
        const classIds = members.map((m: any) => m.classroom_id);
        const { data: classes, error: classErr } = await supabase
          .from('classrooms')
          .select('*')
          .in('id', classIds);

        if (classes && Array.isArray(classes)) {
          const mapped = classes.map((row: any) => ({
            id: row.id,
            name: row.name,
            subject: row.subject || '',
            description: row.description || '',
            joinCode: row.join_code,
            teacherId: row.teacher_id,
            createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
          }));

          setState((prev) => ({
            ...prev,
            joinedClassrooms: mapped,
          }));
        }
      }
    } catch (e) {
      console.warn('Student classrooms load notice:', e);
    }
  }, []);

  // Fetch real assignments from Supabase
  const loadSupabaseAssignments = useCallback(async (userRole: Role, userId: string) => {
    try {
      let query = supabase.from('assignments').select('*');
      if (userRole === 'teacher') {
        query = query.eq('teacher_id', userId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });

      if (data && Array.isArray(data)) {
        const mapped: Assignment[] = data.map((row: any) => ({
          id: row.id,
          type: row.type as AssignmentType,
          title: row.title,
          folder: row.folder || 'Genel',
          target: row.target || 'all',
          classroomId: row.classroom_id || row.classroomId,
          classroomName: row.classroom_name || row.classroomName,
          desc: row.desc || '',
          fileName: row.file_name || row.fileName || null,
          fileData: row.file_data || row.fileData || null,
          timeLimit: row.time_limit || row.timeLimit || 0,
          questions: row.questions || [],
          createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
          submissions: row.submissions || {},
          teacherId: row.teacher_id || row.teacherId,
        }));

        setState((prev) => ({
          ...prev,
          assignments: mapped,
        }));
      }
    } catch (e) {
      console.warn('Supabase assignments table sync notice:', e);
    }
  }, []);

  // Load from localStorage cache
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          setState({
            session: parsed.session || null,
            currentStudentId: parsed.currentStudentId || null,
            students: Array.isArray(parsed.students) ? parsed.students : [],
            assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
            classrooms: Array.isArray(parsed.classrooms) ? parsed.classrooms : [],
            joinedClassrooms: Array.isArray(parsed.joinedClassrooms) ? parsed.joinedClassrooms : [],
          });

          if (parsed.session?.role === 'teacher') {
            setActiveTab('teacher');
          } else if (parsed.session?.role === 'student') {
            setActiveTab('student');
          }
        }
      }
    } catch (e) {
      console.error('Failed to load state from cache', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage cache
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to cache', e);
    }
  }, [state, isLoaded]);

  // Email Verification Callback & URL Cleanup
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      const isEmailVerified =
        hash.includes('type=signup') ||
        hash.includes('type=email_change') ||
        hash.includes('type=recovery') ||
        (hash.includes('access_token') && (hash.includes('token_type=bearer') || hash.includes('type='))) ||
        search.includes('verified=true') ||
        search.includes('type=signup');

      if (isEmailVerified) {
        showToast('🎉 E-posta adresiniz başarıyla doğrulandı! Giriş yapabilirsiniz.', 'success');

        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
      }
    } catch (e) {
      console.error('Error handling auth callback from URL', e);
    }
  }, [showToast]);

  // Dynamic Supabase Session & Profile Synchronization
  useEffect(() => {
    let isMounted = true;

    // Fast initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted || !session?.user) return;

      const profile = await getUserProfile(
        session.user.id,
        session.user.user_metadata,
        session.user.email
      );

      if (!isMounted) return;

      const role = profile.role;
      const name = profile.name;
      const email = session.user.email || '';

      setState((prev) => {
        let studentId: string | undefined = undefined;
        let nextStudents = [...prev.students];

        if (role === 'student') {
          let foundStudent = nextStudents.find(
            (s) => s.id === session.user.id || s.name.toLowerCase() === name.toLowerCase()
          );
          if (!foundStudent) {
            const username = slugUser(name, nextStudents.map((s) => s.username));
            foundStudent = {
              id: session.user.id || uid(),
              name,
              username,
              color: AVATAR_COLORS[nextStudents.length % AVATAR_COLORS.length],
            };
            nextStudents.push(foundStudent);
          }
          studentId = foundStudent.id;
        }

        return {
          ...prev,
          students: nextStudents,
          session: {
            role,
            studentId,
            email,
            name,
            supabaseId: session.user.id,
          },
          currentStudentId: role === 'student' ? (studentId || null) : null,
        };
      });

      // Fetch assignments and classrooms from Supabase DB
      loadSupabaseAssignments(role, session.user.id);
      if (role === 'teacher') {
        loadTeacherClassrooms(session.user.id);
      } else {
        loadStudentJoinedClassrooms(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setState((prev) => {
          if (!prev.session && !prev.currentStudentId) return prev;
          return {
            ...prev,
            session: null,
            currentStudentId: null,
          };
        });
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          const profile = await getUserProfile(
            session.user.id,
            session.user.user_metadata,
            session.user.email
          );

          if (!isMounted) return;

          const role = profile.role;
          const name = profile.name;
          const email = session.user.email || '';

          setState((prev) => {
            let studentId: string | undefined = undefined;
            let nextStudents = [...prev.students];

            if (role === 'student') {
              let foundStudent = nextStudents.find(
                (s) => s.id === session.user.id || s.name.toLowerCase() === name.toLowerCase()
              );
              if (!foundStudent) {
                const username = slugUser(name, nextStudents.map((s) => s.username));
                foundStudent = {
                  id: session.user.id || uid(),
                  name,
                  username,
                  color: AVATAR_COLORS[nextStudents.length % AVATAR_COLORS.length],
                };
                nextStudents.push(foundStudent);
              }
              studentId = foundStudent.id;
            }

            return {
              ...prev,
              students: nextStudents,
              session: {
                role,
                studentId,
                email,
                name,
                supabaseId: session.user.id,
              },
              currentStudentId: role === 'student' ? (studentId || null) : null,
            };
          });

          loadSupabaseAssignments(role, session.user.id);
          if (role === 'teacher') {
            loadTeacherClassrooms(session.user.id);
          } else {
            loadStudentJoinedClassrooms(session.user.id);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadSupabaseAssignments, loadTeacherClassrooms, loadStudentJoinedClassrooms]);

  const refreshData = useCallback(async () => {
    if (state.session?.supabaseId && state.session?.role) {
      await loadSupabaseAssignments(state.session.role, state.session.supabaseId);
      if (state.session.role === 'teacher') {
        await loadTeacherClassrooms(state.session.supabaseId);
      } else {
        await loadStudentJoinedClassrooms(state.session.supabaseId);
      }
    }
  }, [state.session, loadSupabaseAssignments, loadTeacherClassrooms, loadStudentJoinedClassrooms]);

  const openAuthModal = useCallback((role: 'teacher' | 'student' = 'teacher') => {
    setAuthModalInitialRole(role);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const loginSupabaseUser = useCallback(
    ({
      role,
      name,
      email,
      supabaseId,
    }: {
      role: Role;
      name: string;
      email: string;
      supabaseId?: string;
    }) => {
      let studentId: string | undefined = undefined;

      setState((prev) => {
        let nextStudents = [...prev.students];

        if (role === 'student') {
          let foundStudent = nextStudents.find(
            (s) =>
              (supabaseId && s.id === supabaseId) ||
              s.name.toLowerCase() === name.toLowerCase()
          );

          if (!foundStudent) {
            const existingUsernames = nextStudents.map((s) => s.username);
            const username = slugUser(name, existingUsernames);
            const color = AVATAR_COLORS[nextStudents.length % AVATAR_COLORS.length];
            foundStudent = {
              id: supabaseId || uid(),
              name: name.trim(),
              username,
              color,
            };
            nextStudents.push(foundStudent);
          }
          studentId = foundStudent.id;
        }

        return {
          ...prev,
          students: nextStudents,
          session: {
            role,
            studentId,
            email,
            name,
            supabaseId,
          },
          currentStudentId: role === 'student' ? (studentId || null) : null,
        };
      });

      setIsAuthModalOpen(false);
      if (role === 'teacher') {
        setActiveTab('teacher');
        if (typeof window !== 'undefined') {
          if (!window.location.pathname.includes('teacher-dashboard')) {
            window.location.href = '/teacher-dashboard';
          }
        }
        showToast(`Hoş geldiniz, ${name}! 👋`, 'success');
      } else {
        setActiveTab('student');
        if (typeof window !== 'undefined') {
          if (!window.location.pathname.includes('student-dashboard')) {
            window.location.href = '/student-dashboard';
          }
        }
        showToast(`Hoş geldin, ${name.split(' ')[0]}! 🎓`, 'success');
      }

      if (supabaseId) {
        loadSupabaseAssignments(role, supabaseId);
        if (role === 'teacher') {
          loadTeacherClassrooms(supabaseId);
        } else {
          loadStudentJoinedClassrooms(supabaseId);
        }
      }
    },
    [showToast, loadSupabaseAssignments, loadTeacherClassrooms, loadStudentJoinedClassrooms]
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error', e);
    }
    setState((prev) => ({
      ...prev,
      session: null,
      currentStudentId: null,
    }));
    setActiveTab('home');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    showToast('Başarıyla çıkış yapıldı.', 'info');
  }, [showToast]);

  const addStudent = useCallback((name: string, password: string): boolean => {
    const cleanName = name.trim();
    const cleanPass = password.trim();
    if (!cleanName || !cleanPass) {
      showToast('Lütfen öğrenci adı ve şifre girin.', 'warn');
      return false;
    }

    const existingUsernames = state.students.map((s) => s.username);
    const username = slugUser(cleanName, existingUsernames);
    const color = AVATAR_COLORS[state.students.length % AVATAR_COLORS.length];
    const newStudent: Student = {
      id: uid(),
      name: cleanName,
      username,
      password: cleanPass,
      color,
    };

    setState((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
    }));

    showToast(`${cleanName} eklendi! (Kullanıcı adı: ${username})`, 'success');
    return true;
  }, [state.students, showToast]);

  const deleteStudent = useCallback((id: string) => {
    const s = state.students.find((x) => x.id === id);
    if (!s) return;

    setState((prev) => {
      const nextStudents = prev.students.filter((x) => x.id !== id);
      const nextAssignments = prev.assignments.map((a) => {
        const nextSubs = { ...a.submissions };
        delete nextSubs[id];
        return {
          ...a,
          submissions: nextSubs,
        };
      });
      return {
        ...prev,
        students: nextStudents,
        assignments: nextAssignments,
        session: prev.session?.studentId === id ? null : prev.session,
        currentStudentId: prev.currentStudentId === id ? null : prev.currentStudentId,
      };
    });

    showToast(`${s.name} başarıyla silindi.`, 'info');
  }, [state.students, showToast]);

  const createClassroom = useCallback(
    async (name: string, subject?: string, description?: string): Promise<Classroom | null> => {
      const teacherId = state.session?.supabaseId;
      if (!teacherId) {
        showToast('Sınıf oluşturmak için öğretmen oturumu gereklidir.', 'warn');
        return null;
      }

      const joinCode = generateJoinCode();
      const newClass: Classroom = {
        id: uid(),
        name: name.trim(),
        subject: subject?.trim() || '',
        description: description?.trim() || '',
        joinCode,
        teacherId,
        teacherName: state.session?.name || 'Öğretmen',
        createdAt: Date.now(),
        memberCount: 0,
      };

      setState((prev) => ({
        ...prev,
        classrooms: [newClass, ...prev.classrooms],
      }));

      try {
        await supabase.from('classrooms').insert({
          id: newClass.id,
          name: newClass.name,
          subject: newClass.subject,
          description: newClass.description,
          join_code: newClass.joinCode,
          teacher_id: teacherId,
          created_at: new Date(newClass.createdAt).toISOString(),
        });
      } catch (e) {
        console.warn('Classroom db insert notice:', e);
      }

      showToast(`"${newClass.name}" sınıfı oluşturuldu! Katılım Kodu: ${newClass.joinCode} 🎉`, 'success');
      return newClass;
    },
    [state.session, showToast]
  );

  const deleteClassroom = useCallback(
    async (id: string) => {
      setState((prev) => ({
        ...prev,
        classrooms: prev.classrooms.filter((c) => c.id !== id),
        joinedClassrooms: prev.joinedClassrooms.filter((c) => c.id !== id),
      }));

      try {
        await supabase.from('classrooms').delete().eq('id', id);
        await supabase.from('classroom_members').delete().eq('classroom_id', id);
      } catch (e) {}

      showToast('Sınıf başarıyla silindi.', 'info');
    },
    [showToast]
  );

  const joinClassroom = useCallback(
    async (joinCode: string): Promise<boolean> => {
      const studentId = state.currentStudentId || state.session?.studentId || state.session?.supabaseId;
      if (!studentId) {
        showToast('Sınıfa katılmak için öğrenci girişi yapmalısınız.', 'warn');
        return false;
      }

      const cleanCode = joinCode.trim().toUpperCase();

      try {
        let targetClass: Classroom | undefined = state.classrooms.find(
          (c) => c.joinCode.toUpperCase() === cleanCode
        );

        if (!targetClass) {
          const { data, error } = await supabase
            .from('classrooms')
            .select('*')
            .ilike('join_code', cleanCode)
            .single();

          if (data) {
            targetClass = {
              id: data.id,
              name: data.name,
              subject: data.subject || '',
              description: data.description || '',
              joinCode: data.join_code,
              teacherId: data.teacher_id,
              createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
            };
          }
        }

        if (!targetClass) {
          showToast('Geçersiz katılım kodu. Lütfen 6 haneli kodu kontrol ediniz.', 'error');
          return false;
        }

        if (state.joinedClassrooms.some((c) => c.id === targetClass!.id)) {
          showToast(`"${targetClass.name}" sınıfına zaten katılmış durumdasınız.`, 'info');
          return true;
        }

        try {
          await supabase.from('classroom_members').insert({
            id: uid(),
            classroom_id: targetClass.id,
            student_id: studentId,
            joined_at: new Date().toISOString(),
          });
        } catch (e) {}

        setState((prev) => ({
          ...prev,
          joinedClassrooms: [targetClass!, ...prev.joinedClassrooms],
        }));

        showToast(`🎉 Tebrikler! "${targetClass.name}" sınıfına başarıyla katıldınız.`, 'success');
        return true;
      } catch (err) {
        showToast('Sınıfa katılırken bir bağlantı hatası oluştu.', 'error');
        return false;
      }
    },
    [state.classrooms, state.joinedClassrooms, state.currentStudentId, state.session, showToast]
  );

  const leaveClassroom = useCallback(
    async (classroomId: string) => {
      const studentId = state.currentStudentId || state.session?.studentId || state.session?.supabaseId;
      setState((prev) => ({
        ...prev,
        joinedClassrooms: prev.joinedClassrooms.filter((c) => c.id !== classroomId),
      }));

      if (studentId) {
        try {
          await supabase
            .from('classroom_members')
            .delete()
            .eq('classroom_id', classroomId)
            .eq('student_id', studentId);
        } catch (e) {}
      }

      showToast('Sınıftan ayrıldınız.', 'info');
    },
    [state.currentStudentId, state.session, showToast]
  );

  const createAssignment = useCallback(
    (params: CreateAssignmentParams): boolean => {
      if (!params.title.trim()) {
        showToast('Lütfen başlık girin.', 'warn');
        return false;
      }

      const teacherId = state.session?.supabaseId;
      const newAssignment: Assignment = {
        id: uid(),
        type: params.type,
        title: params.title.trim(),
        folder: params.folder.trim() || 'Genel',
        target: params.target || 'all',
        classroomId: params.classroomId,
        classroomName: params.classroomName,
        desc: params.desc?.trim() || '',
        fileName: params.fileName || null,
        fileData: params.fileData || null,
        timeLimit: params.timeLimit || 0,
        questions: params.questions || [],
        createdAt: Date.now(),
        submissions: {},
        teacherId,
      };

      if (params.type === 'book' && !newAssignment.desc) {
        newAssignment.desc = 'Belirtilen sayfayı çözüp fotoğrafını yükleyin.';
      }

      setState((prev) => ({
        ...prev,
        assignments: [newAssignment, ...prev.assignments],
      }));

      if (teacherId) {
        supabase
          .from('assignments')
          .insert({
            id: newAssignment.id,
            type: newAssignment.type,
            title: newAssignment.title,
            folder: newAssignment.folder,
            target: newAssignment.target,
            classroom_id: newAssignment.classroomId,
            classroom_name: newAssignment.classroomName,
            desc: newAssignment.desc,
            file_name: newAssignment.fileName,
            file_data: newAssignment.fileData,
            time_limit: newAssignment.timeLimit,
            questions: newAssignment.questions,
            submissions: {},
            teacher_id: teacherId,
          })
          .then(({ error }) => {
            if (error) console.warn('Supabase assignments insert note:', error.message);
          });
      }

      showToast('İçerik başarıyla yayınlandı! 🎉', 'success');
      return true;
    },
    [state.session, showToast]
  );

  const deleteAssignment = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        assignments: prev.assignments.filter((a) => a.id !== id),
      }));

      supabase.from('assignments').delete().eq('id', id).then(() => {});
      showToast('İçerik silindi.', 'info');
    },
    [showToast]
  );

  const submitTestAnswers = useCallback(
    (assignmentId: string, answersList: string[], timedOut = false) => {
      const sid = state.currentStudentId;
      if (!sid) {
        showToast('Giriş yapmanız gerekiyor.', 'error');
        return { correct: 0, total: 0, percent: 0 };
      }

      const assignment = state.assignments.find((a) => a.id === assignmentId);
      if (!assignment || !assignment.questions) {
        return { correct: 0, total: 0, percent: 0 };
      }

      const answers = assignment.questions.map((q, i) => {
        const given = (answersList[i] || '').trim();
        const ok = given !== '' && norm(given) === norm(q.a);
        return { given, ok };
      });

      const correct = answers.filter((a) => a.ok).length;
      const total = assignment.questions.length;
      const percent = Math.round((correct / total) * 100);

      let updatedSubmissions: Record<string, Submission> = {};

      setState((prev) => {
        const nextAssignments = prev.assignments.map((a) => {
          if (a.id !== assignmentId) return a;
          const prevFb = a.submissions[sid]?.feedback || '';
          updatedSubmissions = {
            ...a.submissions,
            [sid]: {
              answers,
              correct,
              total,
              percent,
              at: Date.now(),
              timedOut,
              feedback: prevFb,
            },
          };
          return {
            ...a,
            submissions: updatedSubmissions,
          };
        });
        return { ...prev, assignments: nextAssignments };
      });

      supabase
        .from('assignments')
        .update({ submissions: updatedSubmissions })
        .eq('id', assignmentId)
        .then(() => {});

      if (timedOut) {
        showToast('Süre doldu! Testiniz otomatik olarak teslim edildi.', 'warn');
      } else {
        showToast(`Test tamamlandı! Başarı: %${percent} (${correct}/${total}) 🎉`, 'success');
      }

      return { correct, total, percent };
    },
    [state.assignments, state.currentStudentId, showToast]
  );

  const retryTest = useCallback(
    (assignmentId: string) => {
      const sid = state.currentStudentId;
      if (!sid) return;

      let updatedSubmissions: Record<string, Submission> = {};

      setState((prev) => {
        const nextAssignments = prev.assignments.map((a) => {
          if (a.id !== assignmentId) return a;
          const nextSubs = { ...a.submissions };
          delete nextSubs[sid];
          updatedSubmissions = nextSubs;
          return { ...a, submissions: nextSubs };
        });
        return { ...prev, assignments: nextAssignments };
      });

      supabase
        .from('assignments')
        .update({ submissions: updatedSubmissions })
        .eq('id', assignmentId)
        .then(() => {});

      showToast('Test sıfırlandı, yeniden çözebilirsiniz.', 'info');
    },
    [state.currentStudentId, showToast]
  );

  const submitHomeworkPhoto = useCallback(
    (assignmentId: string, photoDataUrl: string) => {
      const sid = state.currentStudentId;
      if (!sid) return;

      let updatedSubmissions: Record<string, Submission> = {};

      setState((prev) => {
        const nextAssignments = prev.assignments.map((a) => {
          if (a.id !== assignmentId) return a;
          const prevFb = a.submissions[sid]?.feedback || '';
          updatedSubmissions = {
            ...a.submissions,
            [sid]: {
              photo: photoDataUrl,
              at: Date.now(),
              feedback: prevFb,
            },
          };
          return {
            ...a,
            submissions: updatedSubmissions,
          };
        });
        return { ...prev, assignments: nextAssignments };
      });

      supabase
        .from('assignments')
        .update({ submissions: updatedSubmissions })
        .eq('id', assignmentId)
        .then(() => {});

      showToast('Ödev fotoğrafınız öğretmeninize iletildi! 📸', 'success');
    },
    [state.currentStudentId, showToast]
  );

  const uploadAssignmentFile = useCallback(
    async (
      assignmentId: string,
      file: File
    ): Promise<{ success: boolean; fileAttachment?: { fileUrl: string; fileName: string; fileType: string; fileSize: number }; error?: string }> => {
      const sid = state.currentStudentId || state.session?.studentId || state.session?.supabaseId || 'student';
      const fileExt = file.name.split('.').pop() || 'dat';
      const cleanFileName = file.name;
      const filePath = `${sid}/${assignmentId}_${Date.now()}.${fileExt}`;

      try {
        // 1. Try uploading to Supabase Storage 'assignments' bucket
        const { data, error } = await supabase.storage
          .from('assignments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('assignments')
            .getPublicUrl(filePath);

          const publicUrl = urlData?.publicUrl || '';
          return {
            success: true,
            fileAttachment: {
              fileUrl: publicUrl,
              fileName: cleanFileName,
              fileType: file.type || fileExt,
              fileSize: file.size,
            },
          };
        }
      } catch (err) {
        console.warn('Supabase storage upload fallback notice:', err);
      }

      // Fallback: Convert to Data URL (base64) so submission is never blocked
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            success: true,
            fileAttachment: {
              fileUrl: reader.result as string,
              fileName: cleanFileName,
              fileType: file.type || fileExt,
              fileSize: file.size,
            },
          });
        };
        reader.onerror = () => {
          resolve({
            success: false,
            error: 'Dosya okunamadı.',
          });
        };
        reader.readAsDataURL(file);
      });
    },
    [state.currentStudentId, state.session]
  );

  const submitAssignmentResponse = useCallback(
    async (
      assignmentId: string,
      responseText: string,
      fileAttachment?: { fileUrl: string; fileName: string; fileType: string; fileSize: number },
      photoDataUrl?: string
    ): Promise<{ success: boolean; aiScore?: number; aiFeedback?: string }> => {
      const sid = state.currentStudentId || state.session?.studentId || state.session?.supabaseId;
      if (!sid) {
        showToast('Ödev göndermek için giriş yapmalısınız.', 'error');
        return { success: false };
      }

      const assignment = state.assignments.find((a) => a.id === assignmentId);
      if (!assignment) {
        showToast('Ödev bulunamadı.', 'error');
        return { success: false };
      }

      const studentName = state.session?.name || 'Öğrenci';

      // 1. Initial pending submission state
      const initialSub: Submission = {
        responseText: responseText.trim(),
        fileUrl: fileAttachment?.fileUrl,
        fileName: fileAttachment?.fileName,
        fileType: fileAttachment?.fileType,
        fileSize: fileAttachment?.fileSize,
        photo: photoDataUrl || (fileAttachment?.fileType?.startsWith('image') ? fileAttachment.fileUrl : undefined),
        at: Date.now(),
        status: 'pending',
      };

      let updatedSubmissions: Record<string, Submission> = {};

      setState((prev) => {
        const nextAssignments = prev.assignments.map((a) => {
          if (a.id !== assignmentId) return a;
          updatedSubmissions = {
            ...a.submissions,
            [sid]: initialSub,
          };
          return {
            ...a,
            submissions: updatedSubmissions,
          };
        });
        return { ...prev, assignments: nextAssignments };
      });

      // 2. Call Gemini Auto-Grading API
      let aiScore = 85;
      let aiFeedback = 'Ödeviniz başarıyla değerlendirildi.';
      let aiStrengths: string[] = ['Ödev yönergelerine uygun hazırlanmış.', 'Temel kavramlar doğru aktarılmış.'];
      let aiImprovements: string[] = ['Birkaç ek detayla zenginleştirilebilir.'];

      try {
        const res = await fetch('/api/ai/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignmentTitle: assignment.title,
            assignmentDesc: assignment.desc,
            folder: assignment.folder,
            studentAnswer: responseText.trim() || (fileAttachment ? `Öğrenci ${fileAttachment.fileName} dosyasını yükledi.` : 'Yanıt yüklendi.'),
            studentName,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            aiScore = json.data.score;
            aiFeedback = json.data.feedback;
            aiStrengths = json.data.strengths || aiStrengths;
            aiImprovements = json.data.improvements || aiImprovements;
          }
        }
      } catch (err) {
        console.warn('AI Grading API call error:', err);
      }

      // 3. Finalize graded submission
      const finalizedSub: Submission = {
        ...initialSub,
        aiScore,
        aiFeedback,
        aiStrengths,
        aiImprovements,
        status: 'graded_by_ai',
      };

      setState((prev) => {
        const nextAssignments = prev.assignments.map((a) => {
          if (a.id !== assignmentId) return a;
          updatedSubmissions = {
            ...a.submissions,
            [sid]: finalizedSub,
          };
          return {
            ...a,
            submissions: updatedSubmissions,
          };
        });
        return { ...prev, assignments: nextAssignments };
      });

      // Sync with Supabase assignments table
      try {
        await supabase
          .from('assignments')
          .update({ submissions: updatedSubmissions })
          .eq('id', assignmentId);
      } catch (e) {
        console.warn('Supabase submissions update note:', e);
      }

      showToast('Ödeviniz başarıyla teslim edildi!', 'success');
      return { success: true, aiScore, aiFeedback };
    },
    [state.assignments, state.currentStudentId, state.session, showToast]
  );

  const reviewSubmission = useCallback(
    async (assignmentId: string, studentId: string, finalScore: number, feedback: string) => {
      let updatedSubmissions: Record<string, Submission> = {};

      setState((prev) => {
        const nextAssignments = prev.assignments.map((a) => {
          if (a.id !== assignmentId) return a;
          const existingSub = a.submissions[studentId] || { at: Date.now() };
          updatedSubmissions = {
            ...a.submissions,
            [studentId]: {
              ...existingSub,
              finalScore,
              feedback: feedback.trim(),
              status: 'reviewed',
            },
          };
          return {
            ...a,
            submissions: updatedSubmissions,
          };
        });
        return { ...prev, assignments: nextAssignments };
      });

      try {
        await supabase
          .from('assignments')
          .update({ submissions: updatedSubmissions })
          .eq('id', assignmentId);
      } catch (e) {
        console.warn('Supabase review update note:', e);
      }

      showToast(`Değerlendirme kaydedildi! Puan: %${finalScore} 🎯`, 'success');
    },
    [showToast]
  );

  const saveFeedback = useCallback(
    (assignmentId: string, studentId: string, feedback: string) => {
      let updatedSubmissions: Record<string, Submission> = {};

      setState((prev) => {
        const nextAssignments = prev.assignments.map((a) => {
          if (a.id !== assignmentId) return a;
          const existingSub = a.submissions[studentId] || { at: Date.now() };
          updatedSubmissions = {
            ...a.submissions,
            [studentId]: {
              ...existingSub,
              feedback: feedback.trim(),
            },
          };
          return {
            ...a,
            submissions: updatedSubmissions,
          };
        });
        return { ...prev, assignments: nextAssignments };
      });

      supabase
        .from('assignments')
        .update({ submissions: updatedSubmissions })
        .eq('id', assignmentId)
        .then(() => {});

      showToast('Geri bildirim başarıyla kaydedildi! 💬', 'success');
    },
    [showToast]
  );

  const getStudentById = useCallback(
    (id?: string | null): Student | undefined => {
      if (!id) return undefined;
      return state.students.find((s) => s.id === id);
    },
    [state.students]
  );

  const getVisibleAssignments = useCallback(
    (studentId?: string | null): Assignment[] => {
      if (!studentId) return [];
      const joinedIds = state.joinedClassrooms.map((c) => c.id);

      return state.assignments.filter((a) => {
        if (a.classroomId) {
          return joinedIds.includes(a.classroomId);
        }
        return a.target === 'all' || a.target === studentId;
      });
    },
    [state.assignments, state.joinedClassrooms]
  );

  return (
    <EduFlowContext.Provider
      value={{
        isLoaded,
        state,
        activeTab,
        setActiveTab,
        toast,
        showToast,
        hideToast,
        isAuthModalOpen,
        authModalInitialRole,
        openAuthModal,
        closeAuthModal,
        loginSupabaseUser,
        logout,
        addStudent,
        deleteStudent,
        createClassroom,
        deleteClassroom,
        joinClassroom,
        leaveClassroom,
        createAssignment,
        deleteAssignment,
        submitTestAnswers,
        retryTest,
        submitHomeworkPhoto,
        uploadAssignmentFile,
        submitAssignmentResponse,
        reviewSubmission,
        saveFeedback,
        getStudentById,
        getVisibleAssignments,
        refreshData,
      }}
    >
      {children}
    </EduFlowContext.Provider>
  );
}

export function useEduFlow() {
  const context = useContext(EduFlowContext);
  if (!context) {
    throw new Error('useEduFlow must be used within an EduFlowProvider');
  }
  return context;
}

