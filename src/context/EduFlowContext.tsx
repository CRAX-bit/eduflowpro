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
  loginTeacher: (u: string, p: string) => boolean;
  loginStudent: (u: string, p: string) => boolean;
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
  resetAllData: () => void;
  getStudentById: (id?: string | null) => Student | undefined;
  getVisibleAssignments: (studentId?: string | null) => Assignment[];
}

const EduFlowContext = createContext<EduFlowContextType | null>(null);

function getSeedData(): EduFlowState {
  const s1 = uid();
  const s2 = uid();
  const s3 = uid();

  return {
    session: null,
    currentStudentId: null,
    auth: {
      teacherUser: 'ogretmen',
      teacherPass: '1234',
    },
    students: [
      { id: s1, name: 'Ayşe Yılmaz', color: '#3b82f6', username: 'ayse', password: 'ayse123' },
      { id: s2, name: 'Mehmet Demir', color: '#10b981', username: 'mehmet', password: 'mehmet123' },
      { id: s3, name: 'Zeynep Kaya', color: '#9d4edd', username: 'zeynep', password: 'zeynep123' },
    ],
    assignments: [
      {
        id: uid(),
        type: 'note',
        title: 'Past Simple Tense — Konu Anlatımı',
        folder: 'Past Simple Tense',
        target: 'all',
        desc: 'Geçmiş zaman (Past Simple) yapısı: Düzenli fiiller -ed takısı alır, düzensiz fiillerin 2. halleri (V2) kullanılır. Olumsuzda "did not + V1", soruda "Did + özne + V1" kalıbı kullanılır.\n\nÖrnekler:\n- I played football yesterday.\n- She visited her grandparents.\n- They did not come to the party.',
        fileName: 'past_simple_ders_notu.pdf',
        fileData: null,
        createdAt: Date.now() - 86400000,
        submissions: {},
      },
      {
        id: uid(),
        type: 'note',
        title: 'Haftalık Duyuru',
        folder: 'Genel',
        target: 'all',
        desc: 'Sevgili öğrenciler, bu hafta Present Perfect testini mutlaka çözün. Sorularınız için mesaj atabilirsiniz. Başarılar! 📚',
        fileName: null,
        fileData: null,
        createdAt: Date.now() - 70000000,
        submissions: {},
      },
      {
        id: uid(),
        type: 'test',
        title: 'Present Perfect Alıştırması',
        folder: 'Present Perfect Tense',
        target: 'all',
        timeLimit: 120, // 2 minutes
        desc: 'Aşağıdaki boşlukları have/has ile doldurun.',
        questions: [
          { q: "'I ___ never been to Paris.' boşluğa gelen?", a: 'have' },
          { q: "'She ___ just finished her homework.' boşluğa gelen?", a: 'has' },
          { q: "'They ___ lived here since 2010.' boşluğa gelen?", a: 'have' },
        ],
        createdAt: Date.now() - 43200000,
        submissions: {},
      },
      {
        id: uid(),
        type: 'book',
        title: 'Test Kitabı Sayfa 42',
        folder: 'Vocabulary Unit 3',
        target: s1,
        desc: 'Kitabın 42. sayfasındaki tüm kelime sorularını çözüp sayfanın fotoğrafını yükleyin.',
        createdAt: Date.now() - 3600000,
        submissions: {},
      },
    ],
  };
}

export function EduFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EduFlowState>(() => getSeedData());
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

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.students && parsed.auth) {
          setState(parsed);
          if (parsed.session?.role === 'teacher') {
            setActiveTab('teacher');
          } else if (parsed.session?.role === 'student') {
            setActiveTab('student');
          }
        }
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
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

        // Clean URL cleanly without reload
        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
      }
    } catch (e) {
      console.error('Error handling auth callback from URL', e);
    }
  }, [showToast]);

  // Sync Supabase Auth Session & Optimize Re-renders
  useEffect(() => {
    let isMounted = true;

    // Fast initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted || !session?.user) return;

      const metadata = session.user.user_metadata || {};
      const role = (metadata.role as Role) || 'student';
      const name = metadata.full_name || session.user.email?.split('@')[0] || 'Kullanıcı';
      const email = session.user.email || '';

      setState((prev) => {
        // If already in sync with this Supabase user, skip re-render
        if (prev.session?.supabaseId === session.user.id && prev.session?.role === role) {
          return prev;
        }

        let studentId: string | undefined = undefined;
        let nextStudents = [...prev.students];

        if (role === 'student') {
          let foundStudent = nextStudents.find(
            (s) => s.name.toLowerCase() === name.toLowerCase()
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
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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
          const metadata = session.user.user_metadata || {};
          const role = (metadata.role as Role) || 'student';
          const name = metadata.full_name || session.user.email?.split('@')[0] || 'Kullanıcı';
          const email = session.user.email || '';

          setState((prev) => {
            if (prev.session?.supabaseId === session.user.id && prev.session?.role === role) {
              return prev;
            }

            let studentId: string | undefined = undefined;
            let nextStudents = [...prev.students];

            if (role === 'student') {
              let foundStudent = nextStudents.find(
                (s) => s.name.toLowerCase() === name.toLowerCase()
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
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback((role: 'teacher' | 'student' = 'teacher') => {
    setAuthModalInitialRole(role);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const loginTeacher = useCallback((u: string, p: string): boolean => {
    if (u === state.auth.teacherUser && p === state.auth.teacherPass) {
      setState((prev) => ({
        ...prev,
        session: { role: 'teacher', name: 'Öğretmen' },
        currentStudentId: null,
      }));
      setIsAuthModalOpen(false);
      setActiveTab('teacher');
      showToast('Hoş geldiniz, öğretmenim! 👋', 'success');
      return true;
    }
    showToast('Öğretmen kullanıcı adı veya şifre hatalı.', 'warn');
    return false;
  }, [state.auth, showToast]);

  const loginStudent = useCallback((u: string, p: string): boolean => {
    const student = state.students.find((s) => s.username.toLowerCase() === u.toLowerCase().trim() && s.password === p);
    if (student) {
      setState((prev) => ({
        ...prev,
        session: { role: 'student', studentId: student.id, name: student.name },
        currentStudentId: student.id,
      }));
      setIsAuthModalOpen(false);
      setActiveTab('student');
      showToast(`Hoş geldin, ${student.name.split(' ')[0]}! 🎓`, 'success');
      return true;
    }
    showToast('Öğrenci kullanıcı adı veya şifre hatalı.', 'warn');
    return false;
  }, [state.students, showToast]);

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
              (s.username && s.username.toLowerCase() === slugUser(name, []).toLowerCase()) ||
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
    },
    [showToast]
  );

  const logout = useCallback(() => {
    try {
      supabase.auth.signOut();
    } catch (e) {}
    setState((prev) => ({
      ...prev,
      session: null,
      currentStudentId: null,
    }));
    setActiveTab('home');
    showToast('Çıkış yapıldı.', 'info');
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
    };

    if (params.type === 'book' && !newAssignment.desc) {
      newAssignment.desc = 'Belirtilen sayfayı çözüp fotoğrafını yükleyin.';
    }

    setState((prev) => ({
      ...prev,
      assignments: [newAssignment, ...prev.assignments],
    }));

    showToast('İçerik başarıyla yayınlandı! 🎉', 'success');
    return true;
  }, [showToast]);

  const deleteAssignment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
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

    setState((prev) => {
      const nextAssignments = prev.assignments.map((a) => {
        if (a.id !== assignmentId) return a;
        const prevFb = a.submissions[sid]?.feedback || '';
        return {
          ...a,
          submissions: {
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
          },
        };
      });
      return { ...prev, assignments: nextAssignments };
    });

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

    setState((prev) => {
      const nextAssignments = prev.assignments.map((a) => {
        if (a.id !== assignmentId) return a;
        const nextSubs = { ...a.submissions };
        delete nextSubs[sid];
        return { ...a, submissions: nextSubs };
      });
      return { ...prev, assignments: nextAssignments };
    });

    showToast('Test sıfırlandı, yeniden çözebilirsiniz.', 'info');
  }, [state.currentStudentId, showToast]);

  const submitHomeworkPhoto = useCallback((assignmentId: string, photoDataUrl: string) => {
    const sid = state.currentStudentId;
    if (!sid) return;

    setState((prev) => {
      const nextAssignments = prev.assignments.map((a) => {
        if (a.id !== assignmentId) return a;
        const prevFb = a.submissions[sid]?.feedback || '';
        return {
          ...a,
          submissions: {
            ...a.submissions,
            [sid]: {
              photo: photoDataUrl,
              at: Date.now(),
              feedback: prevFb,
            },
          },
        };
      });
      return { ...prev, assignments: nextAssignments };
    });

    showToast('Ödev fotoğrafınız öğretmeninize iletildi! 📸', 'success');
  }, [state.currentStudentId, showToast]);

  const saveFeedback = useCallback((assignmentId: string, studentId: string, feedback: string) => {
    setState((prev) => {
      const nextAssignments = prev.assignments.map((a) => {
        if (a.id !== assignmentId) return a;
        const existingSub = a.submissions[studentId] || { at: Date.now() };
        return {
          ...a,
          submissions: {
            ...a.submissions,
            [studentId]: {
              ...existingSub,
              feedback: feedback.trim(),
            },
          },
        };
      });
      return { ...prev, assignments: nextAssignments };
    });

    showToast('Geri bildirim başarıyla kaydedildi! 💬', 'success');
  }, [showToast]);

  const resetAllData = useCallback(() => {
    const seed = getSeedData();
    setState(seed);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setActiveTab('home');
    showToast('Tüm demo verileri ve hesaplar sıfırlandı.', 'info');
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
        loginTeacher,
        loginStudent,
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
        resetAllData,
        getStudentById,
        getVisibleAssignments,
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
