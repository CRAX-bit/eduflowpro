'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Question } from '@/types';
import {
  Sparkles,
  X,
  BrainCircuit,
  MessageSquare,
  FileQuestion,
  BookOpen,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Copy,
  Check,
  Compass,
  RotateCcw,
  Zap,
  HelpCircle,
  FileText,
  Sliders,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuthHeaders } from '@/lib/api-client';

interface TeacherAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateAssignmentModal: (prefill: any) => void;
  onToggle?: () => void;
}

// Seviyeye Göre Konu ve Öneri Haritası
const LEVEL_CONFIGS: Record<
  string,
  {
    placeholder: string;
    suggestions: string[];
  }
> = {
  'İlkokul (1-4. Sınıf)': {
    placeholder: 'Örn: Doğal Sayılarla Toplama, Eş Anlamlı Kelimeler, Hayat Bilgisi...',
    suggestions: [
      'Matematik: Çarpım Tablosu ve Bölme',
      'Türkçe: Eş ve Zıt Anlamlı Sözcükler',
      'Fen: Canlılar Dünyasını Tanıyalım',
      'Hayat Bilgisi: Sağlıklı Yaşam Kuralları',
    ],
  },
  'Ortaokul / LGS (5-8. Sınıf)': {
    placeholder: 'Örn: Çarpanlar ve Katlar, Fiilimsiler, Fotosentez...',
    suggestions: [
      'Matematik: Çarpanlar ve Katlar (EBOB-EKOK)',
      'Türkçe: Fiilimsiler (Eylemsiler)',
      'Fen: DNA ve Genetik Kod',
      'İngilizce: Teen Life & Preferences',
      'İnkılap: Milli Mücadele Hazırlık',
    ],
  },
  'Lise / TYT-AYT (9-12. Sınıf)': {
    placeholder: 'Örn: Fonksiyonlar, Newton Hareket Yasaları, Hücre Bölünmeleri...',
    suggestions: [
      'Matematik: Fonksiyonlar ve Parabol',
      'Fizik: Newton\'ın Hareket Yasaları',
      'Kimya: Kimyasal Türler Arası Etkileşimler',
      'Biyoloji: Kalıtım ve Genetik',
      'Edebiyat: Divan Edebiyatı Nazım Şekilleri',
    ],
  },
  'Lisans / KPSS - ALES': {
    placeholder: 'Örn: Sözel Mantık, Türkiye Coğrafyası, Anayasa Hukuku...',
    suggestions: [
      'Genel Yetenek: Sayısal & Sözel Mantık',
      'Tarih: Osmanlı Dağılma Dönemi',
      'Coğrafya: Türkiye\'nin İklimi ve Yer Şekilleri',
      'Vatandaşlık: Temel Hukuk ve Anayasa',
    ],
  },
  'Genel / Konu Kavrama': {
    placeholder: 'Örn: Temel İngilizce Zamanlar, Hızlı Okuma, Mantık Yürütme...',
    suggestions: [
      'İngilizce: Present Continuous vs Simple Present',
      'Mantık: Önermeler ve Kümeler',
      'Genel Kültür: Dünya Başkentleri ve Coğrafya',
    ],
  },
};

const TEACHER_PROMPTS = [
  'MEB müfredatına uygun 1 haftalık ders planı hazırla',
  'Öğrenciler için 5 maddelik puanlama rubriği oluştur',
  'Yeni nesil beceri temelli soru hazırlama taktikleri neler?',
  'Derste dikkati dağılan öğrenciler için motivasyon stratejileri',
];

export function TeacherAiDrawer({
  isOpen,
  onClose,
  onOpenCreateAssignmentModal,
  onToggle,
}: TeacherAiDrawerProps) {
  const { showToast, state } = useEduFlow();

  // Drawer Tabs: 'chat' | 'generator'
  const [activeTab, setActiveTab] = useState<'chat' | 'generator'>('chat');

  // Generator SubMode: 'quiz' | 'note'
  const [generatorMode, setGeneratorMode] = useState<'quiz' | 'note'>('quiz');

  // --- Quiz Generator State ---
  const [quizTopic, setQuizTopic] = useState('');
  const [quizCount, setQuizCount] = useState(3);
  const [quizGrade, setQuizGrade] = useState('Ortaokul / LGS (5-8. Sınıf)');
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  // --- Note Generator State ---
  const [noteTopic, setNoteTopic] = useState('');
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<any>(null);

  // --- Chat Assistant State ---
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Merhaba Hocam! Ben Deskio Öğretmen Copilot asistanınızım. MEB müfredat kazanımları, ders planlama, çoktan seçmeli veya açık uçlu soru hazırlama ve pedagojik analizler için hazırım. Size nasıl yardımcı olabilirim? ✨',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, activeTab, isOpen]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentLevelConfig =
    LEVEL_CONFIGS[quizGrade] || LEVEL_CONFIGS['Ortaokul / LGS (5-8. Sınıf)'];

  // --- Handlers ---
  const handleSendChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || chatInput).trim();
    if (!textToSend || isChatLoading) return;

    const userMsg = { role: 'user' as const, text: textToSend };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'chat_assistant',
          message: textToSend,
          history: updated.slice(-6),
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: '⚠️ ' + (data.error || 'Yanıt üretilirken bir sorun oluştu. Lütfen tekrar deneyiniz.'),
          },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: '⚠️ Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol ediniz.',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateQuiz = async (topicToUse?: string) => {
    const topic = (topicToUse || quizTopic).trim();
    if (!topic) {
      showToast('Lütfen bir konu başlığı giriniz veya önerilenlerden seçiniz.', 'warn');
      return;
    }
    setQuizTopic(topic);
    setIsQuizLoading(true);
    setGeneratedQuiz(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_quiz',
          topic,
          count: Number(quizCount),
          grade: quizGrade,
        }),
      });

      const data = await res.json();
      if (data.success && data.data && data.data.questions?.length > 0) {
        setGeneratedQuiz(data.data);
        showToast(`${quizCount} soruluk test başarıyla oluşturuldu!`, 'success');
      } else {
        showToast(data.error || 'Test oluşturulamadı. Lütfen tekrar deneyiniz.', 'error');
      }
    } catch (err) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleGenerateNote = async (topicToUse?: string) => {
    const topic = (topicToUse || noteTopic).trim();
    if (!topic) {
      showToast('Lütfen ders notu konusu giriniz.', 'warn');
      return;
    }
    setNoteTopic(topic);
    setIsNoteLoading(true);
    setGeneratedNote(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_note',
          topic: noteTopic.trim(),
          grade: quizGrade,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedNote(data.data);
        showToast('Ders notu özeti başarıyla oluşturuldu!', 'success');
      } else {
        showToast(data.error || 'Ders notu oluşturulamadı.', 'error');
      }
    } catch (err) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsNoteLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Panoya kopyalandı!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* 1. Fixed Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={onToggle || (() => {})}
          className="group relative flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 border border-blue-400/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xl min-h-[48px]"
          title="Deskio AI Araçlarını Aç"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="font-heading tracking-wide">✨ Deskio AI Araçları</span>
        </button>
      </div>

      {/* 2. Slide-Over Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 print:hidden"
        />
      )}

      {/* 3. Slide-Over Drawer Container (Full-screen on Mobile, Sheet on Desktop) */}
      <div
        className={cn(
          'fixed inset-0 sm:inset-y-0 sm:left-auto sm:right-0 z-50 w-full sm:w-[540px] md:w-[580px] bg-white sm:border-l border-slate-300 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out print:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-950 truncate">
                  Deskio Öğretmen AI Copilot
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
                  Öğretmen
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium truncate">
                Gemini 2.5 Pro • Müfredat, Soru & Planlama Asistanı
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-xs min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 shrink-0"
            title="Çekmeceyi Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Chat vs Generator) */}
        <div className="p-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] active:scale-95',
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/50'
              )}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Copilot Sohbet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] active:scale-95',
                activeTab === 'generator'
                  ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/50'
              )}
            >
              <FileQuestion className="w-4 h-4" />
              <span>Sınav & Soru Üretici</span>
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 touch-scroll">
          {/* TAB 1: COPILOT CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-4 flex flex-col h-full justify-between">
              {/* Messages Feed */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[90%] space-y-1.5 shadow-2xs animate-fade',
                      m.role === 'user'
                        ? 'ml-auto bg-blue-600 text-white font-medium'
                        : 'bg-slate-50 border border-slate-300 text-slate-950 font-medium'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/40 pb-1 text-[11px] font-bold opacity-80">
                      <span>{m.role === 'user' ? 'Siz' : 'Deskio Copilot'}</span>
                      {m.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.text, `chat-${idx}`)}
                          className="hover:text-blue-600 transition-colors cursor-pointer p-1"
                          title="Kopyala"
                        >
                          {copiedId === `chat-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap font-sans leading-relaxed">{m.text}</div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm flex items-center gap-2 font-medium w-fit animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Deskio Copilot yanıt hazırlıyor...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Fast Prompt Suggestions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700">Hızlı Sorular:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {TEACHER_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendChat(undefined, p)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-left text-xs font-semibold text-slate-800 hover:text-blue-800 transition-all cursor-pointer line-clamp-1 min-h-[40px] flex items-center active:scale-[0.98]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={(e) => handleSendChat(e)} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Müfredat, soru veya ders planı hakkında sor..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-medium placeholder:text-slate-500 focus:outline-none min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[44px] active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Gönder</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: EXAM & QUESTION GENERATOR */}
          {activeTab === 'generator' && (
            <div className="space-y-5 animate-fade">
              {/* Sub Mode Pill (Quiz vs Note) */}
              <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGeneratorMode('quiz')}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[40px] active:scale-95',
                    generatorMode === 'quiz'
                      ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  )}
                >
                  📝 Çoktan Seçmeli Test
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratorMode('note')}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[40px] active:scale-95',
                    generatorMode === 'note'
                      ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  )}
                >
                  📖 Ders Notu & Özeti
                </button>
              </div>

              {/* Form 1: Quiz Generator */}
              {generatorMode === 'quiz' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Kazanım / Konu Başlığı
                    </label>
                    <input
                      type="text"
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      placeholder={currentLevelConfig.placeholder}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Eğitim Seviyesi
                      </label>
                      <select
                        value={quizGrade}
                        onChange={(e) => setQuizGrade(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-bold focus:outline-none min-h-[44px]"
                      >
                        {Object.keys(LEVEL_CONFIGS).map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Soru Adedi
                      </label>
                      <select
                        value={quizCount}
                        onChange={(e) => setQuizCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-bold focus:outline-none min-h-[44px]"
                      >
                        <option value={3}>3 Soru (Hızlı Tarama)</option>
                        <option value={5}>5 Soru (Standart Test)</option>
                        <option value={8}>8 Soru (Pekiştirme)</option>
                        <option value={10}>10 Soru (Deneme)</option>
                      </select>
                    </div>
                  </div>

                  {/* Suggestions Chips */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800">Önerilen Konu Başlıkları:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentLevelConfig.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuizTopic(s)}
                          className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-slate-800 hover:text-blue-800 text-xs font-semibold transition-all cursor-pointer min-h-[38px] active:scale-95"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateQuiz()}
                    disabled={isQuizLoading || !quizTopic.trim()}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[48px] active:scale-95"
                  >
                    {isQuizLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sorular Hazırlanıyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Deskio AI ile Soruları Hazırla</span>
                      </>
                    )}
                  </button>

                  {/* Generated Quiz Result */}
                  {generatedQuiz && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2">
                        <div>
                          <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-950">
                            {generatedQuiz.title || quizTopic}
                          </h4>
                          <span className="text-xs text-blue-800 font-bold">
                            {generatedQuiz.questions?.length || 0} Soru Hazırlandı
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCreateAssignmentModal({
                              type: 'test',
                              title: generatedQuiz.title || quizTopic,
                              folder: generatedQuiz.folder || quizTopic,
                              desc: generatedQuiz.desc || '',
                              timeLimit: (generatedQuiz.questions?.length || 3) * 60,
                              questions: generatedQuiz.questions,
                            });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[40px] active:scale-95 shrink-0"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Ödev Olarak Yayınla</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {generatedQuiz.questions?.map((q: Question, i: number) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm space-y-1.5 shadow-2xs font-medium"
                          >
                            <div className="font-bold text-slate-950">
                              Soru {i + 1}: {q.q}
                            </div>
                            <div className="text-xs text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-1 rounded w-fit border border-emerald-200">
                              Doğru Cevap: {q.a}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form 2: Note Generator */}
              {generatorMode === 'note' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Ders / Konu Başlığı
                    </label>
                    <input
                      type="text"
                      value={noteTopic}
                      onChange={(e) => setNoteTopic(e.target.value)}
                      placeholder="Örn: 9. Sınıf Fotosentez ve Hücresel Solunum Özeti"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateNote()}
                    disabled={isNoteLoading || !noteTopic.trim()}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[48px] active:scale-95"
                  >
                    {isNoteLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Ders Notu Hazırlanıyor...</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>Deskio AI ile Ders Notu ve Özeti Oluştur</span>
                      </>
                    )}
                  </button>

                  {generatedNote && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2">
                        <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-950">
                          {generatedNote.title || noteTopic}
                        </h4>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCreateAssignmentModal({
                              type: 'note',
                              title: generatedNote.title || noteTopic,
                              folder: generatedNote.folder || noteTopic,
                              desc: generatedNote.content || '',
                            });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[40px] active:scale-95 shrink-0"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Ders Notu Olarak Yayınla</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto shadow-2xs">
                        {generatedNote.content}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
