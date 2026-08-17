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
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
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
        showToast(data.error || 'Test oluşturulamadı.', 'error');
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
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
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
        showToast(data.error || 'Ders notu oluşturulamadı.', 'error');
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
    const updatedMessages = [...chatMessages, { role: 'user' as const, text: userText }];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'chat_assistant',
          message: userText,
          history: updatedMessages,
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.error || 'Üzgünüm, şu an yanıt üretirken bir sorun oluştu.' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade">
      <div className="w-full max-w-3xl bg-white border border-slate-200/90 rounded-3xl p-6 relative shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-slate-900">EduFlow Gemini AI Asistanı</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500">Öğretmen ve öğrenciler için yapay zeka eğitim gücü</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 border border-slate-200 rounded-2xl mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode('quiz')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              activeMode === 'quiz'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <FileQuestion className="w-4 h-4" />
            <span>AI Test Üretici</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('note')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              activeMode === 'note'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span>AI Ders Notu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('chat')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              activeMode === 'chat'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Konu / Ünite Adı
                  </label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder={MODAL_LEVEL_CONFIGS[quizGrade]?.placeholder || 'Örn: Çarpanlar ve Katlar...'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Eğitim Seviyesi
                  </label>
                  <select
                    value={quizGrade}
                    onChange={(e) => setQuizGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
                  >
                    <option value="İlkokul (1-4. Sınıf)">İlkokul (1-4)</option>
                    <option value="Ortaokul / LGS (5-8. Sınıf)">Ortaokul (5-8)</option>
                    <option value="Lise / TYT-AYT (9-12. Sınıf)">Lise / TYT-AYT</option>
                    <option value="Lisans / KPSS - ALES">Lisans / KPSS</option>
                    <option value="Genel / Konu Kavrama">Genel</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Soru Sayısı
                  </label>
                  <select
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
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
                      'px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer',
                      quizTopic === s
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-blue-50'
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
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isQuizLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-200" />
                )}
                <span>{isQuizLoading ? 'Sorular Hazırlanıyor...' : 'Yapay Zeka ile Soruları Üret'}</span>
              </button>

              {/* Generated Quiz Result */}
              {generatedQuiz && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-blue-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900">
                        {generatedQuiz.title}
                      </h4>
                      <p className="text-[11px] text-blue-600 font-semibold">
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
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                        <div className="font-semibold text-slate-900">
                          <span className="text-blue-600 font-bold">{i + 1}.</span> {q.q}
                        </div>
                        <div className="text-emerald-700 font-semibold mt-1">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ders Notu Konusu
                </label>
                <input
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  placeholder="Örn: Newton'un Hareket Yasaları veya LGS Türkçe Fiilimsiler"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateNote}
                disabled={isNoteLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isNoteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
                <span>{isNoteLoading ? 'Not Hazırlanıyor...' : 'Yapay Zeka ile Ders Notu Çıkar'}</span>
              </button>

              {generatedNote && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-blue-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-heading font-bold text-sm text-slate-900">
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

                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto shadow-2xs">
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
                      'p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-2xs',
                      m.role === 'user'
                        ? 'ml-auto bg-blue-600 text-white font-medium'
                        : 'mr-auto bg-slate-50 border border-slate-200 text-slate-800'
                    )}
                  >
                    {m.text}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="mr-auto p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
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
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
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
