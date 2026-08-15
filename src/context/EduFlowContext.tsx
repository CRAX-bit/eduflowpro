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
} from '@/types';
import { STORAGE_KEY, AVATAR_COLORS, uid, slugUser, norm } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface CreateAssignmentParams {
  type: AssignmentType;
  title: string;
  folder: string;
  target: string;
  desc?: string;
  fileName?: string | null;
  fileData?: string | null;
  timeLimit?: number;
  questions?: Question[];
}

interface EduFlowContextType {
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
  createAssignment: (params: CreateAssignmentParams) => boolean;
  deleteAssignment: (id: string) => void;
  submitTestAnswers: (assignmentId: string, answers: string[], timedOut?: boolean) => { correct: number; total: number; percent: number };
  retryTest: (assignmentId: string) => void;
  submitHomeworkPhoto: (assignmentId: string, photoDataUrl: string) => void;
  saveFeedback: (assignmentId: string, studentId: string, feedback: string) => void;
  getStudentById: (id?: string | null) => Student | undefined;
  getVisibleAssignments: (studentId?: string | null) => Assignment[];
  refreshData: () => Promise<void>;
}

const EduFlowContext = createContext<EduFlowContextType | null>(null);

function getInitialState(): EduFlowState {
  return {
    session: null,
    currentStudentId: null,
    students: [],
    assignments: [],
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

      // Fetch assignments from Supabase DB
      loadSupabaseAssignments(role, session.user.id);
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
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadSupabaseAssignments]);

  const refreshData = useCallback(async () => {
    if (state.session?.supabaseId && state.session?.role) {
      await loadSupabaseAssignments(state.session.role, state.session.supabaseId);
    }
  }, [state.session, loadSupabaseAssignments]);

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
        showToast(`Hoş geldiniz, ${name}! 👋`, 'success');
      } else {
        setActiveTab('student');
        showToast(`Hoş geldin, ${name.split(' ')[0]}! 🎓`, 'success');
      }

      if (supabaseId) {
        loadSupabaseAssignments(role, supabaseId);
      }
    },
    [showToast, loadSupabaseAssignments]
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

  const createAssignment = useCallback((params: CreateAssignmentParams): boolean => {
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

    // Async sync with Supabase
    if (teacherId) {
      supabase
        .from('assignments')
        .insert({
          id: newAssignment.id,
          type: newAssignment.type,
          title: newAssignment.title,
          folder: newAssignment.folder,
          target: newAssignment.target,
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
  }, [state.session, showToast]);

  const deleteAssignment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));

    supabase.from('assignments').delete().eq('id', id).then(() => {});
    showToast('İçerik silindi.', 'info');
  }, [showToast]);

  const submitTestAnswers = useCallback((assignmentId: string, answersList: string[], timedOut = false) => {
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

    // Supabase update
    supabase
      .from('assignments')
      .update({ submissions: updatedSubmissions })
      .eq('id', assignmentId)
      .then(() => {});

    if (timedOut) {
      showToast(`Süre doldu! Otomatik teslim edildi. Başarı: %${percent}`, 'warn');
    } else {
      showToast(`Test gönderildi! Başarı: %${percent} (${correct}/${total})`, percent >= 70 ? 'success' : 'warn');
    }

    return { correct, total, percent };
  }, [state.currentStudentId, state.assignments, showToast]);

  const retryTest = useCallback((assignmentId: string) => {
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
  }, [state.currentStudentId, showToast]);

  const submitHomeworkPhoto = useCallback((assignmentId: string, photoDataUrl: string) => {
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
  }, [state.currentStudentId, showToast]);

  const saveFeedback = useCallback((assignmentId: string, studentId: string, feedback: string) => {
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
  }, [showToast]);

  const getStudentById = useCallback((id?: string | null): Student | undefined => {
    if (!id) return undefined;
    return state.students.find((s) => s.id === id);
  }, [state.students]);

  const getVisibleAssignments = useCallback((studentId?: string | null): Assignment[] => {
    if (!studentId) return [];
    return state.assignments.filter((a) => a.target === 'all' || a.target === studentId);
  }, [state.assignments]);

  return (
    <EduFlowContext.Provider
      value={{
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
        createAssignment,
        deleteAssignment,
        submitTestAnswers,
        retryTest,
        submitHomeworkPhoto,
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

