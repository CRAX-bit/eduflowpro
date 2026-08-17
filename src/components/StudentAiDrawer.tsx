'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Question } from '@/types';
import {
  Sparkles,
  X,
  BrainCircuit,
  MessageSquare,
  Compass,
  Play,
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  HelpCircle,
  GraduationCap,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuthHeaders } from '@/lib/api-client';

interface StudentAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
  currentGradeLevel?: string;
  gradeLevel?: string;
  onStartFocusTest?: (quizData: {
    title: string;
    folder: string;
    questions: Question[];
    timeLimit: number;
  }) => void;
  onStartFocusPracticeQuiz?: (quizData: {
    title: string;
    folder: string;
    questions: Question[];
    timeLimit: number;
  }) => void;
  initialTab?: 'chat' | 'practice';
}

function getCurriculumTopics(grade?: string): string[] {
  const g = (grade || '').toLowerCase();
  if (g.includes('ortaokul') || g.includes('lgs')) {
    return [
      'Matematik: Çarpanlar ve Katlar (EBOB-EKOK)',
      'Türkçe: Fiilimsiler (Eylemsiler)',
      'Fen: DNA ve Genetik Kod',
      'İngilizce: Teen Life & Preferences',
      'İnkılap: Milli Mücadele Hazırlık',
    ];
  }
  if (g.includes('sayısal')) {
    return [
      'Matematik: Fonksiyonlar ve Parabol',
      'Fizik: Newton Hareket Yasaları',
      'Kimya: Kimyasal Türler Arası Etkileşim',
      'Biyoloji: Fotosentez ve Kloroplast',
      'Geometri: Üçgende Benzerlik',
    ];
  }
  if (g.includes('eşit') || g.includes('sözel')) {
    return [
      'Edebiyat: Divan Edebiyatı Nazım Şekilleri',
      'Tarih: Osmanlı Kuruluş Dönemi',
      'Coğrafya: Türkiye İklimi ve Yer Şekilleri',
      'Matematik: Parabol ve Fonksiyonlar',
      'Türkçe: Paragrafta Anlam ve Yapı',
    ];
  }
  if (g.includes('lise') || g.includes('yks')) {
    return [
      'Matematik: Fonksiyonlar ve Kümeler',
      'Türkçe: Paragraf ve Ana Düşünce',
      'Fizik: Kuvvet ve Hareket',
      'Kimya: Asitler ve Bazlar',
      'Biyoloji: Kalıtım Esasları',
    ];
  }
  if (g.includes('kpss') || g.includes('ales') || g.includes('lisans')) {
    return [
      'Genel Yetenek: Sayısal & Sözel Mantık',
      'Tarih: Osmanlı Dağılma Dönemi',
      'Coğrafya: Türkiye\'nin Yer Şekilleri',
      'Vatandaşlık: Temel Hukuk ve Anayasa',
    ];
  }
  return [
    'İngilizce: Present Continuous vs Simple Present',
    'Mantık: Önermeler ve Kümeler',
    'Genel Kültür: Dünya Coğrafyası',
    'Türkçe: Sözcükte Anlam',
  ];
}

function getCoachWelcomeMessage(grade?: string): string {
  const g = (grade || '').toLowerCase();
  if (g.includes('ortaokul') || g.includes('lgs')) {
    return 'Merhaba! Ben senin LGS çalışma ve özel ders koçunum. Anlamadığın yeni nesil soruları, formülleri, deneme analizini veya konu özetlerini bana sorabilirsin. Başarıya birlikte koşuyoruz! 🎯🚀';
  }
  if (g.includes('lise') || g.includes('yks')) {
    return 'Selam! Ben senin YKS & lise ders koçunum. TYT-AYT sınav taktikleri, formül mantığı ve ÖSYM odaklı sorularını buraya iletebilirsin. Hangi konuyu derinleştirelim? 📚✨';
  }
  if (g.includes('kpss') || g.includes('ales') || g.includes('lisans')) {
    return 'Merhaba! KPSS & ALES hazırlığında sözel/sayısal mantık, mevzuat ve pratik soru çözüm teknikleriyle 7/24 yanındayım. Ne üzerine çalışıyoruz? 📚✨';
  }
  return 'Merhaba! Derslerin, dil pratiğin ve takıldığın tüm konular için kişisel AI ders koçun hazır! 🎓✨';
}

export function StudentAiDrawer({
  isOpen,
  onClose,
  onToggle,
  currentGradeLevel,
  gradeLevel,
  onStartFocusTest,
  onStartFocusPracticeQuiz,
  initialTab = 'chat',
}: StudentAiDrawerProps) {
  const { showToast, state } = useEduFlow();
  const activeLevel = gradeLevel || currentGradeLevel || 'Ortaokul (5-8. Sınıf / LGS Hazırlık)';

  // Drawer Tabs: 'chat' | 'practice'
  const [activeTab, setActiveTab] = useState<'chat' | 'practice'>(initialTab);

  // Sync initial tab when changed externally
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Dynamic practice and prompt chips
  const practiceChips = useMemo(() => getCurriculumTopics(activeLevel), [activeLevel]);

  // --- Student Coach Chat State ---
  const [coachMessages, setCoachMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: getCoachWelcomeMessage(activeLevel),
    },
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Smart Practice Test State ---
  const [practiceTopic, setPracticeTopic] = useState('');
  const [practiceCount, setPracticeCount] = useState<number>(5);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Reset practice topic when chips change
  useEffect(() => {
    if (practiceChips.length > 0 && !practiceTopic) {
      setPracticeTopic(practiceChips[0]);
    }
  }, [practiceChips]);

  // Auto scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [coachMessages, activeTab]);

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

  // --- Chat Handler ---
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || coachInput).trim();
    if (!textToSend || isCoachLoading) return;

    setCoachMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    if (!customText) setCoachInput('');
    setIsCoachLoading(true);

    try {
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'chat_assistant',
          message: textToSend,
          role: 'student',
          grade: activeLevel,
          history: coachMessages.slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setCoachMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setCoachMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.error || 'Yanıt hazırlanırken bir sorun oluştu. Lütfen tekrar sorunuz.' },
        ]);
      }
    } catch (err) {
      setCoachMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Bağlantı hatası oluştu. Lütfen internet bağlantını kontrol et.' },
      ]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  // --- Practice Test Generator Handler ---
  const handleGeneratePractice = async () => {
    const topicToUse = practiceTopic.trim();
    if (!topicToUse) {
      showToast('Lütfen pratik yapmak istediğin konu başlığını seç veya yaz.', 'warn');
      return;
    }

    setIsPracticeLoading(true);
    try {
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_quiz',
          topic: topicToUse,
          count: practiceCount,
          grade: activeLevel,
        }),
      });

      const data = await res.json();
      if (data.success && data.data && data.data.questions?.length > 0) {
        showToast(`${practiceCount} soruluk pratik testi hazırlandı! Başlatılıyor...`, 'success');
        onClose();
        const startHandler = onStartFocusPracticeQuiz || onStartFocusTest;
        if (startHandler) {
          startHandler({
            title: data.data.title || `${topicToUse} Pratik Testi`,
            folder: topicToUse,
            questions: data.data.questions,
            timeLimit: practiceCount * 60,
          });
        }
      } else {
        showToast(data.error || 'Sorular oluşturulamadı. Lütfen tekrar deneyiniz.', 'error');
      }
    } catch (err) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsPracticeLoading(false);
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
          title="AI Özel Ders Koçunu Aç"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="font-heading tracking-wide">✨ AI Özel Ders Koçu</span>
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
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base text-slate-900">
                  AI Özel Ders Koçu
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 border border-blue-200 text-blue-700">
                  Öğrenci
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                {activeLevel} • 7/24 Soru Çözümü & Pratik
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
              <span>Konu & Soru Danışmanı</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                activeTab === 'practice'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Akıllı Test Oluşturucu</span>
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* ============================================================ */}
          {/* TAB 1: CHAT ASİSTANI & DANIŞMAN                              */}
          {/* ============================================================ */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full space-y-4">
              {/* Quick Prompt Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  Hızlı Soru Önerileri:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {practiceChips.slice(0, 4).map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(`${chip} konusunda temel mantığı 3 maddede açıklar mısın?`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium transition-all text-left cursor-pointer"
                    >
                      {chip.split(':')[1] || chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 space-y-3 min-h-[260px] max-h-[460px] overflow-y-auto pr-1">
                {coachMessages.map((m, idx) => (
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
                      <span>{m.role === 'user' ? 'Sen' : 'AI Özel Ders Koçu'}</span>
                      {m.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.text, `coach-${idx}`)}
                          className="hover:text-blue-600 transition-colors cursor-pointer"
                          title="Yanıtı Kopyala"
                        >
                          {copiedId === `coach-${idx}` ? (
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

                {isCoachLoading && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2 w-fit shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Ders koçun soruyu inceliyor ve çözüyor...</span>
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
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  placeholder="Takıldığın soruyu veya konuyu sor (örn: Mitoz ve Mayoz farkı nedir?)..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!coachInput.trim() || isCoachLoading}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs shadow-blue-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Sor</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: AKILLI TEST OLUŞTURUCU                                */}
          {/* ============================================================ */}
          {activeTab === 'practice' && (
            <div className="space-y-5 animate-fade">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1 shadow-xs">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Kişiselleştirilmiş Alıştırma Testi</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Hedef seviyene ({activeLevel}) uygun interaktif sorular üretilir. Testi çözdükten sonra yanlışlarını detaylı analiz edebilirsin.
                </p>
              </div>

              {/* Topic Selector / Custom Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pratik Yapmak İstediğin Konu
                </label>
                <input
                  type="text"
                  value={practiceTopic}
                  onChange={(e) => setPracticeTopic(e.target.value)}
                  placeholder="Örn: Fotosentez Işık Reaksiyonları"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
                />

                {/* Suggestions Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Önerilen Müfredat Konuları:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {practiceChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPracticeTopic(chip)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer text-left',
                          practiceTopic === chip
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700'
                        )}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Soru Sayısı Seçimi */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Soru Sayısı: <b className="text-blue-600 font-mono">{practiceCount} Soru</b>
                </label>
                <div className="flex items-center gap-2">
                  {[3, 5, 8, 10].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setPracticeCount(cnt)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        practiceCount === cnt
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      )}
                    >
                      {cnt} Soru
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Practice Test Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGeneratePractice}
                  disabled={isPracticeLoading || !practiceTopic.trim()}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPracticeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sorular Hazırlanıyor...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Testi Hazırla & Başlat</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
