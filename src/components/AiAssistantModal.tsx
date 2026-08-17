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
import { getAuthHeaders } from '@/lib/api-client';

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

const MODAL_LEVEL_CONFIGS: Record<string, { placeholder: string; suggestions: string[] }> = {
  'İlkokul (1-4. Sınıf)': {
    placeholder: 'Örn: Doğal Sayılarla Toplama, Eş Anlamlı Kelimeler...',
    suggestions: ['Matematik: Çarpım Tablosu', 'Türkçe: Eş Anlamlı Kelimeler', 'Fen: Canlılar Dünyası'],
  },
  'Ortaokul / LGS (5-8. Sınıf)': {
    placeholder: 'Örn: Çarpanlar ve Katlar, Fiilimsiler, Fotosentez...',
    suggestions: ['Matematik: Çarpanlar (EBOB-EKOK)', 'Türkçe: Fiilimsiler', 'Fen: DNA ve Genetik Kod'],
  },
  'Lise / TYT-AYT (9-12. Sınıf)': {
    placeholder: 'Örn: Türev ve İntegral, Hücre Bölünmeleri...',
    suggestions: ['Matematik: Fonksiyonlar', 'Fizik: Hareket Yasaları', 'Biyoloji: Kalıtım'],
  },
  'Lisans / KPSS - ALES': {
    placeholder: 'Örn: Sözel Mantık, Türkiye Coğrafyası...',
    suggestions: ['Sözel & Sayısal Mantık', 'Tarih: Osmanlı Dağılma', 'Vatandaşlık: Temel Hukuk'],
  },
  'Genel / Konu Kavrama': {
    placeholder: 'Örn: Temel İngilizce Zamanlar, Hızlı Okuma...',
    suggestions: ['İngilizce: Present Continuous', 'Mantık: Kümeler', 'Genel Kültür'],
  },
};

export function AiAssistantModal({
  isOpen,
  onClose,
  onApplyGeneratedQuiz,
  onApplyGeneratedNote,
}: AiAssistantModalProps) {
  const { showToast, state, setActiveTab } = useEduFlow();

  const [activeMode, setActiveMode] = useState<'quiz' | 'note' | 'chat'>('quiz');

  // Quiz Gen State
  const [quizTopic, setQuizTopic] = useState('');
  const [quizCount, setQuizCount] = useState(3);
  const [quizGrade, setQuizGrade] = useState('Ortaokul / LGS (5-8. Sınıf)');
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
      text: 'Merhaba! Ben Deskio Yapay Zeka Eğitim Masası Asistanı. Ders planlaması, soru hazırlama veya anlamadığınız konular hakkında bana her şeyi sorabilirsiniz. 🎓✨',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) return showToast('Lütfen bir konu yazın.', 'warn');
    setIsQuizLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_quiz',
          topic: quizTopic,
          count: quizCount,
          gradeLevel: quizGrade,
        }),
      });
      const data = await res.json();
      if (data.success && data.quiz) {
        setGeneratedQuiz(data.quiz);
        showToast('Deskio AI test sorularını hazırladı! 🎯', 'success');
      } else {
        showToast(data.error || 'Soru üretimi başarısız oldu.', 'warn');
      }
    } catch (e) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleGenerateNote = async () => {
    if (!noteTopic.trim()) return showToast('Lütfen konu yazın.', 'warn');
    setIsNoteLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_note',
          topic: noteTopic,
        }),
      });
      const data = await res.json();
      if (data.success && data.note) {
        setGeneratedNote(data.note);
        showToast('Deskio AI ders notunu hazırladı! 📖', 'success');
      } else {
        showToast(data.error || 'Ders notu üretimi başarısız oldu.', 'warn');
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
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsChatLoading(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'chat',
          message: userText,
          history: chatMessages.slice(-6),
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', text: '⚠️ ' + (data.error || 'Yanıt alınırken hata oluştu.') },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '⚠️ Bağlantı hatası oluştu. Lütfen tekrar deneyin.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade">
      <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-3xl p-6 sm:p-7 relative shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                Deskio Yapay Zeka Laboratuvarı
              </div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-950">
                Deskio AI Masası
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setActiveMode('quiz')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeMode === 'quiz'
                ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            )}
          >
            <FileQuestion className="w-4 h-4" />
            <span>Soru & Test Üret</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('note')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeMode === 'note'
                ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span>Ders Notu Çıkar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('chat')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeMode === 'chat'
                ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
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
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Konu / Ünite Adı
                  </label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder={MODAL_LEVEL_CONFIGS[quizGrade]?.placeholder || 'Örn: Çarpanlar ve Katlar...'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-medium focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Eğitim Seviyesi
                  </label>
                  <select
                    value={quizGrade}
                    onChange={(e) => setQuizGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-bold focus:outline-none"
                  >
                    <option value="İlkokul (1-4. Sınıf)">İlkokul (1-4)</option>
                    <option value="Ortaokul / LGS (5-8. Sınıf)">Ortaokul (5-8)</option>
                    <option value="Lise / TYT-AYT (9-12. Sınıf)">Lise / TYT-AYT</option>
                    <option value="Lisans / KPSS - ALES">Lisans / KPSS</option>
                    <option value="Genel / Konu Kavrama">Genel</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Soru Sayısı
                  </label>
                  <select
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-bold focus:outline-none"
                  >
                    <option value={3}>3 Soru (Hızlı)</option>
                    <option value={5}>5 Soru (Standart)</option>
                    <option value={10}>10 Soru (Deneme)</option>
                  </select>
                </div>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {MODAL_LEVEL_CONFIGS[quizGrade]?.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuizTopic(s)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                      quizTopic === s
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-extrabold'
                        : 'bg-slate-50 border-slate-300 text-slate-800 hover:text-blue-800 hover:bg-blue-50'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={isQuizLoading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isQuizLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-200" />
                )}
                <span>{isQuizLoading ? 'Sorular Hazırlanıyor...' : 'Deskio AI ile Soruları Üret'}</span>
              </button>

              {/* Generated Quiz Result */}
              {generatedQuiz && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-950">
                        {generatedQuiz.title}
                      </h4>
                      <p className="text-xs text-blue-800 font-bold">
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
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Forma Aktar</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    {generatedQuiz.questions?.map((q: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm shadow-2xs">
                        <div className="font-bold text-slate-950">
                          <span className="text-blue-700 font-extrabold">{i + 1}.</span> {q.q}
                        </div>
                        <div className="text-emerald-800 font-extrabold mt-1">
                          Doğru Cevap: <span className="underline">{q.a}</span>
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
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Ders Notu Konusu
                </label>
                <input
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  placeholder="Örn: Newton'un Hareket Yasaları veya LGS Türkçe Fiilimsiler"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-medium focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateNote}
                disabled={isNoteLoading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isNoteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
                <span>{isNoteLoading ? 'Not Hazırlanıyor...' : 'Deskio AI ile Ders Notu Çıkar'}</span>
              </button>

              {generatedNote && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-950">
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
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Forma Aktar</span>
                      </button>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto shadow-2xs">
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
                      'p-3.5 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed shadow-2xs',
                      m.role === 'user'
                        ? 'ml-auto bg-blue-600 text-white font-medium'
                        : 'mr-auto bg-slate-50 border border-slate-300 text-slate-950 font-medium'
                    )}
                  >
                    {m.text}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="mr-auto p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Deskio AI yanıt yazıyor...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Bir soru veya konu sor..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
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
