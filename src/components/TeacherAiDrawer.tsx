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
      text: 'Merhaba Hocam! Ben EduFlow Öğretmen Copilot asistanınızım. MEB müfredat kazanımları, ders planlama, çoktan seçmeli veya açık uçlu soru hazırlama ve pedagojik analizler için hazırım. Size nasıl yardımcı olabilirim? ✨',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentLevelConfig = LEVEL_CONFIGS[quizGrade] || LEVEL_CONFIGS['Ortaokul / LGS (5-8. Sınıf)'];

  // --- Chat Handler ---
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || chatInput).trim();
    if (!textToSend || isChatLoading) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    if (!customText) setChatInput('');
    setIsChatLoading(true);

    try {
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'chat_assistant',
          message: textToSend,
          role: 'teacher',
          history: chatMessages.slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.error || 'Yanıt üretilirken bir sorun oluştu. Lütfen tekrar deneyiniz.' },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol ediniz.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Quiz Generator Handler ---
  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) {
      showToast('Lütfen soru konusu veya kazanım başlığı giriniz.', 'warn');
      return;
    }
    setIsQuizLoading(true);
    setGeneratedQuiz(null);

    try {
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_quiz',
          topic: quizTopic.trim(),
          count: quizCount,
          grade: quizGrade,
        }),
      });

      const data = await res.json();
      if (data.success && data.data && data.data.questions?.length > 0) {
        setGeneratedQuiz(data.data);
        showToast(`${quizCount} soruluk test başarıyla oluşturuldu!`, 'success');
      } else {
        showToast(data.error || 'Soru oluşturulamadı. Lütfen tekrar deneyiniz.', 'error');
      }
    } catch (err) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsQuizLoading(false);
    }
  };

  // --- Note Generator Handler ---
  const handleGenerateNote = async () => {
    if (!noteTopic.trim()) {
      showToast('Lütfen ders notu konusu giriniz.', 'warn');
      return;
    }
    setIsNoteLoading(true);
    setGeneratedNote(null);

    try {
      const headers = await getAuthHeaders(state.session);
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
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={onToggle || (() => {})}
          className="group relative flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 border border-blue-400/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xl"
          title="EduFlow AI Araçlarını Aç"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="font-heading tracking-wide">✨ EduFlow AI Araçları</span>
        </button>
      </div>

      {/* 2. Slide-Over Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 print:hidden"
        />
      )}

      {/* 3. Slide-Over Drawer Container (Clean EdTech Light Theme) */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] md:w-[580px] bg-white border-l border-slate-200/90 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out print:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base text-slate-900">
                  EduFlow AI Copilot
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 border border-blue-200 text-blue-700">
                  Öğretmen
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Gemini 2.5 Pro • Müfredat, Soru & Planlama Asistanı
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
            title="Çekmeceyi Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Asistanı</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                activeTab === 'generator'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sınav & İçerik Üretici</span>
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* ============================================================ */}
          {/* TAB 1: CHAT ASİSTANI                                         */}
          {/* ============================================================ */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full space-y-4">
              {/* Prompt Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  Hızlı Öneri İstekleri:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TEACHER_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium transition-all text-left cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 space-y-3 min-h-[260px] max-h-[460px] overflow-y-auto pr-1">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] space-y-1.5 shadow-xs',
                      m.role === 'user'
                        ? 'ml-auto bg-blue-600 text-white font-medium'
                        : 'bg-slate-50 border border-slate-200 text-slate-800'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/40 pb-1 text-[10px] opacity-75">
                      <span>{m.role === 'user' ? 'Siz' : 'EduFlow AI Öğretmen Asistanı'}</span>
                      {m.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.text, `chat-${idx}`)}
                          className="hover:text-blue-600 transition-colors cursor-pointer"
                          title="Yanıtı Kopyala"
                        >
                          {copiedId === `chat-${idx}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2 w-fit shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Öğretmen asistanı yanıt hazırlıyor...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="pt-2 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Sorunuzu veya talebinizi yazın (örn: 8. sınıf fotosentez için 3 soru hazırla)..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs shadow-blue-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gönder</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: SINAV & İÇERİK YAPILANDIRICI                          */}
          {/* ============================================================ */}
          {activeTab === 'generator' && (
            <div className="space-y-5 animate-fade">
              {/* Generator SubMode Switch */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setGeneratorMode('quiz')}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                    generatorMode === 'quiz'
                      ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <FileQuestion className="w-3.5 h-3.5 text-blue-600" />
                  <span>Soru & Test Üretici</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGeneratorMode('note')}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                    generatorMode === 'note'
                      ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ders Özeti & Not Üretici</span>
                </button>
              </div>

              {/* MODE 1: QUIZ GENERATOR */}
              {generatorMode === 'quiz' && (
                <div className="space-y-4">
                  {/* Grade Level Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Hedef Eğitim Seviyesi
                    </label>
                    <select
                      value={quizGrade}
                      onChange={(e) => setQuizGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs focus:outline-none"
                    >
                      {Object.keys(LEVEL_CONFIGS).map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Kazanım / Konu Başlığı
                    </label>
                    <input
                      type="text"
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      placeholder={currentLevelConfig.placeholder}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Suggestions Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Önerilen Konu Başlıkları:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentLevelConfig.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuizTopic(sug)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] transition-all cursor-pointer text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Soru Sayısı */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Soru Sayısı: <b className="text-blue-600 font-mono">{quizCount} Soru</b>
                    </label>
                    <div className="flex items-center gap-2">
                      {[3, 5, 8, 10].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setQuizCount(cnt)}
                          className={cn(
                            'flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                            quizCount === cnt
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                          )}
                        >
                          {cnt} Soru
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerateQuiz}
                    disabled={isQuizLoading || !quizTopic.trim()}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isQuizLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>MEB Müfredatına Uygun Soru Üretiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Yapay Zeka ile Soruları Hazırla</span>
                      </>
                    )}
                  </button>

                  {/* Generated Quiz Result Area */}
                  {generatedQuiz && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-blue-200 space-y-3.5 animate-fade shadow-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div>
                          <h4 className="font-heading font-bold text-sm text-slate-900">
                            {generatedQuiz.title || quizTopic}
                          </h4>
                          <span className="text-[11px] text-blue-600 font-semibold">
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
                              desc: generatedQuiz.desc || `${quizTopic} konusu için AI tarafından oluşturulan test.`,
                              timeLimit: (generatedQuiz.questions?.length || 3) * 60,
                              questions: generatedQuiz.questions,
                            });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Ödev Olarak Yayınla</span>
                        </button>
                      </div>

                      {/* Question Preview List */}
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {generatedQuiz.questions?.map((q: Question, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs"
                          >
                            <div className="font-semibold text-slate-900">
                              Soru {i + 1}: {q.q}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded w-fit">
                              Doğru Cevap: {q.a}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: NOTE GENERATOR */}
              {generatorMode === 'note' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Ders / Konu Başlığı
                    </label>
                    <input
                      type="text"
                      value={noteTopic}
                      onChange={(e) => setNoteTopic(e.target.value)}
                      placeholder="Örn: 9. Sınıf Fotosentez ve Solunum Özeti"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateNote}
                    disabled={isNoteLoading || !noteTopic.trim()}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isNoteLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Ders Notu Hazırlanıyor...</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>Ders Notu ve Özeti Oluştur</span>
                      </>
                    )}
                  </button>

                  {generatedNote && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-blue-200 space-y-3 animate-fade shadow-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h4 className="font-heading font-bold text-sm text-slate-900 truncate max-w-[240px]">
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
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Materyal Olarak Yayınla</span>
                        </button>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
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
