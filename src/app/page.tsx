'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Navbar } from '@/components/Navbar';
import { HomeView } from '@/components/HomeView';
import { TeacherView } from '@/components/TeacherView';
import { StudentView } from '@/components/StudentView';
import { AiAssistantModal } from '@/components/AiAssistantModal';
import { Sparkles, GraduationCap } from 'lucide-react';

export default function App() {
  const { activeTab, setActiveTab, state, openAuthModal } = useEduFlow();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [generatedQuizData, setGeneratedQuizData] = useState<any>(null);
  const [generatedNoteData, setGeneratedNoteData] = useState<any>(null);

  // Pathname synchronization
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('teacher-dashboard') || path.includes('teacher')) {
        setActiveTab('teacher');
      } else if (path.includes('student-dashboard') || path.includes('student')) {
        setActiveTab('student');
      }
    }
  }, [setActiveTab]);

  // If a user navigates to a protected tab without a session, show login
  React.useEffect(() => {
    if (activeTab === 'teacher' && state.session?.role !== 'teacher') {
      openAuthModal('teacher');
    } else if (activeTab === 'student' && state.session?.role !== 'student') {
      openAuthModal('student');
    }
  }, [activeTab, state.session, openAuthModal]);

  return (
    <div className="min-h-screen flex flex-col relative z-10 bg-slate-50">
      <Navbar onOpenAiAssistant={() => setIsAiModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'teacher' && (
          <TeacherView
            onOpenAiAssistant={() => setIsAiModalOpen(true)}
            externalGeneratedQuiz={generatedQuizData}
            externalGeneratedNote={generatedNoteData}
          />
        )}
        {activeTab === 'student' && <StudentView />}
      </main>

      {/* Clean EdTech Footer with Deskio Branding */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-700 relative z-10 print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-heading font-bold text-slate-950 text-sm">Deskio</span>
            <span className="text-slate-700 font-semibold">© {new Date().getFullYear()}</span>
            <span className="text-slate-400">·</span>
            <span className="text-blue-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Akıllı Ödev & Sınıf Masası
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-700 font-semibold">
            <a
              href="/gizlilik-politikasi"
              className="hover:text-blue-600 transition-colors underline-offset-4 hover:underline"
            >
              Gizlilik & KVKK Politikası
            </a>
            <span className="text-slate-400">·</span>
            <a
              href="/kullanim-kosullari"
              className="hover:text-blue-600 transition-colors underline-offset-4 hover:underline"
            >
              Kullanım Koşulları
            </a>
          </div>

          <div className="text-xs text-slate-600 font-mono font-medium">
            Deskio v2.5 Kurumsal Sürüm
          </div>
        </div>
      </footer>

      {/* Global AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyGeneratedQuiz={(quiz) => setGeneratedQuizData(quiz)}
        onApplyGeneratedNote={(note) => setGeneratedNoteData(note)}
      />
    </div>
  );
}
