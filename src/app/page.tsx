'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Navbar } from '@/components/Navbar';
import { HomeView } from '@/components/HomeView';
import { TeacherView } from '@/components/TeacherView';
import { StudentView } from '@/components/StudentView';
import { AiAssistantModal } from '@/components/AiAssistantModal';

export default function App() {
  const { activeTab, state, openAuthModal } = useEduFlow();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [generatedQuizData, setGeneratedQuizData] = useState<any>(null);
  const [generatedNoteData, setGeneratedNoteData] = useState<any>(null);

  // If a user navigates to a protected tab without a session, show login
  React.useEffect(() => {
    if (activeTab === 'teacher' && state.session?.role !== 'teacher') {
      openAuthModal('teacher');
    } else if (activeTab === 'student' && state.session?.role !== 'student') {
      openAuthModal('student');
    }
  }, [activeTab, state.session, openAuthModal]);

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar onOpenAiAssistant={() => setIsAiModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
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

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#0a0f1d]/90 py-8 px-4 text-center text-xs text-slate-500 relative z-10 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-slate-300">EduFlow Pro</span>
            <span>© {new Date().getFullYear()}</span>
            <span>·</span>
            <span className="text-cyan-400">Google Gemini Pro Destekli</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Öğrenci & Öğretmen Başarı Platformu</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Vercel & Next.js App Router Ready
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
