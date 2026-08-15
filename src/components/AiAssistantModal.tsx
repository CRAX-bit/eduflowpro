'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  Sparkles,
  X,
  BrainCircuit,
  Bot,
  Send,
  Loader2,
  FileQuestion,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedQuiz?: (quizData: {
    title: string;
    folder: string;
    desc: string;
    timeLimit: number;
    questions: Array<{ q: string; a: string }>;
  }) => void;
  onApplyGeneratedNote?: (noteData: { title: string; folder: string; content: string }) => void;
}

export function AiAssistantModal({
  isOpen,
  onClose,
  onApplyGeneratedQuiz,
  onApplyGeneratedNote,
}: AiAssistantModalProps) {
  const { showToast, state, setActiveTab } = useEduFlow();

  const [activeMode, setActiveMode] = useState<'quiz' | 'note' | 'chat'>('quiz');

  // Quiz Gen State
  const [quizTopic, setQuizTopic] = useState('İngilizce Present Perfect Tense');
  const [quizCount, setQuizCount] = useState(3);
  const [quizGrade, setQuizGrade] = useState('Lise / Ortaokul');
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  // Note Gen State
  const [noteTopic, setNoteTopic] = useState('Mitoz ve Mayoz Bölünme Farkları');
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<any>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Merhaba! Ben EduFlow Pro Yapay Zeka Eğitim Asistanı. Ders planlaması, soru hazırlama veya anlamadığınız konular hakkında bana her şeyi sorabilirsiniz. 🎓✨',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) return showToast('Lütfen bir konu yazın.', 'warn');
    setIsQuizLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_quiz',
          topic: quizTopic,
          count: Number(quizCount),
          grade: quizGrade,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedQuiz(data.data);
        showToast('Gemini AI soruları başarıyla üretti! 🎉', 'success');
      } else {
        showToast('Test oluşturulamadı.', 'error');
      }
    } catch (e) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleGenerateNote = async () => {
    if (!noteTopic.trim()) return showToast('Lütfen bir konu yazın.', 'warn');
    setIsNoteLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_notes',
          topic: noteTopic,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedNote(data.data);
        showToast('Ders notu ve özeti oluşturuldu! 📝', 'success');
      } else {
        showToast('Ders notu oluşturulamadı.', 'error');
      }
    } catch (e) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsNoteLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_assistant',
          message: userText,
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'Üzgünüm, şu an yanıt üretirken bir sorun oluştu.' },
        ]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sunucuya bağlanırken bir hata meydana geldi.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade">
      <div className="w-full max-w-3xl bg-[#0d1424] border border-cyan-500/30 rounded-3xl p-6 relative shadow-[0_20px_60px_rgba(0,242,254,0.15)] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 p-[1px] shadow-[0_0_20px_rgba(0,242,254,0.3)]">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[11px] flex items-center justify-center text-cyan-300">
                <BrainCircuit className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-white">EduFlow Gemini AI Asistanı</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400">Öğretmen ve öğrenciler için yapay zeka eğitim gücü</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-2xl mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode('quiz')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all',
              activeMode === 'quiz'
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(157,78,221,0.3)]'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <FileQuestion className="w-4 h-4" />
            <span>AI Test Üretici</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('note')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all',
              activeMode === 'note'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span>AI Ders Notu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('chat')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all',
              activeMode === 'chat'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Soru & Sohbet</span>
          </button>
        </div>

        {/* Mode Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Mode 1: Quiz Generator */}
          {activeMode === 'quiz' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Konu / Ünite Adı
                  </label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="Örn: 8. Sınıf Üslü İfadeler veya Past Continuous"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Soru Sayısı
                  </label>
                  <select
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#0a0f1d] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value={2}>2 Soru (Hızlı)</option>
                    <option value={3}>3 Soru (Standart)</option>
                    <option value={5}>5 Soru (Kapsamlı)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={isQuizLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isQuizLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                )}
                <span>{isQuizLoading ? 'Sorular Hazırlanıyor...' : 'Yapay Zeka ile Soruları Üret'}</span>
              </button>

              {/* Generated Quiz Result */}
              {generatedQuiz && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-cyan-300">
                        {generatedQuiz.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {generatedQuiz.questions?.length} soru · Süre: {Math.round(generatedQuiz.timeLimit / 60)} dk
                      </p>
                    </div>

                    {onApplyGeneratedQuiz && (
                      <button
                        onClick={() => {
                          onApplyGeneratedQuiz(generatedQuiz);
                          onClose();
                          setActiveTab('teacher');
                          showToast('Üretilen test forma aktarıldı!', 'success');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Forma Aktar</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    {generatedQuiz.questions?.map((q: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs">
                        <div className="font-medium text-slate-200">
                          <span className="text-cyan-400 font-bold">{i + 1}.</span> {q.q}
                        </div>
                        <div className="text-emerald-400 font-semibold mt-1">
                          Doğru Cevap: <span className="text-white underline">{q.a}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Note Generator */}
          {activeMode === 'note' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ders Notu Konusu
                </label>
                <input
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  placeholder="Örn: Newton'un Hareket Yasaları veya LGS Türkçe Fiilimsiler"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateNote}
                disabled={isNoteLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isNoteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
                <span>{isNoteLoading ? 'Not Hazırlanıyor...' : 'Yapay Zeka ile Ders Notu Çıkar'}</span>
              </button>

              {generatedNote && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-sm text-emerald-300">
                      {generatedNote.title}
                    </h4>

                    {onApplyGeneratedNote && (
                      <button
                        onClick={() => {
                          onApplyGeneratedNote(generatedNote);
                          onClose();
                          setActiveTab('teacher');
                          showToast('Ders notu forma aktarıldı!', 'success');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Forma Aktar</span>
                      </button>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {generatedNote.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Chat */}
          {activeMode === 'chat' && (
            <div className="flex flex-col h-[340px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed',
                      m.role === 'user'
                        ? 'ml-auto bg-blue-600/30 border border-blue-500/40 text-blue-100'
                        : 'mr-auto bg-white/[0.04] border border-white/10 text-slate-200'
                    )}
                  >
                    {m.text}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="mr-auto p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-400 text-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Gemini yanıt yazıyor...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Bir soru veya konu sor..."
                  className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-xl text-white text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gönder</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
