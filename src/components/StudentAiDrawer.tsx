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
    return 'Merhaba! Ben senin Deskio LGS çalışma ve özel ders koçunum. Anlamadığın yeni nesil soruları, formülleri, deneme analizini veya konu özetlerini bana sorabilirsin. Başarıya birlikte koşuyoruz! 🎯🚀';
  }
  if (g.includes('lise') || g.includes('yks')) {
    return 'Selam! Ben senin Deskio YKS & lise ders koçunum. TYT-AYT sınav taktikleri, formül mantığı ve ÖSYM odaklı sorularını buraya iletebilirsin. Hangi konuyu derinleştirelim? 📚✨';
  }
  if (g.includes('kpss') || g.includes('ales') || g.includes('lisans')) {
    return 'Merhaba! KPSS & ALES hazırlığında sözel/sayısal mantık, mevzuat ve pratik soru çözüm teknikleriyle 7/24 yanındayım. Ne üzerine çalışıyoruz? 📚✨';
  }
  return 'Merhaba! Derslerin, dil pratiğin ve takıldığın tüm konular için Deskio kişisel AI ders masası hazır! 🎓✨';
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

  // --- Chat State ---
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: getCoachWelcomeMessage(activeLevel),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Practice State ---
  const [customPracticeTopic, setCustomPracticeTopic] = useState('');
  const [practiceCount, setPracticeCount] = useState(3);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);

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
          role: 'student',
          gradeLevel: activeLevel,
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

  const handleLaunchPracticeTest = async (topic?: string) => {
    const topicToUse = (topic || customPracticeTopic).trim();
    if (!topicToUse) {
      showToast('Lütfen bir konu başlığı seçiniz veya yazınız.', 'warn');
      return;
    }

    setIsPracticeLoading(true);
    try {
      const headers = await getAuthHeaders();
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
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={onToggle || (() => {})}
          className="group relative flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 border border-blue-400/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xl min-h-[48px]"
          title="Deskio AI Özel Ders Masasını Aç"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="font-heading tracking-wide">✨ Deskio AI Özel Ders Masası</span>
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
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-950 truncate">
                  Deskio Öğrenci AI Asistanı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
                  7/24 Koç
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium truncate">
                {activeLevel}
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

        {/* Tab Switcher (Chat vs Practice) */}
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
              <span>Soru Danışmanı (Chat)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] active:scale-95',
                activeTab === 'practice'
                  ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/50'
              )}
            >
              <Zap className="w-4 h-4" />
              <span>Akıllı Test Çöz</span>
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 touch-scroll">
          {/* TAB 1: STUDENT CHAT / QUESTION COACH */}
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
                      <span>{m.role === 'user' ? 'Sen' : 'Deskio Koç'}</span>
                      {m.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.text, `student-chat-${idx}`)}
                          className="hover:text-blue-600 transition-colors cursor-pointer p-1"
                          title="Kopyala"
                        >
                          {copiedId === `student-chat-${idx}` ? (
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
                    <span>Deskio Koç yanıt hazırlıyor...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Fast Suggested Questions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700">Taktik ve Konu Soruları:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    'Yeni nesil soruları nasıl daha hızlı çözebilirim?',
                    'Mitoz ve mayoz bölünme arasındaki farkları özetle',
                    'Paragraf sorularında zaman kazanma taktiği ver',
                    'Bu hafta için verimli bir çalışma planı hazırla',
                  ].map((p, i) => (
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
                  placeholder="Anlamadığın bir soruyu, formülü veya konuyu sor..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-medium placeholder:text-slate-500 focus:outline-none min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[44px] active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Sor</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SMART PRACTICE ENGINE */}
          {activeTab === 'practice' && (
            <div className="space-y-5 animate-fade">
              {/* Info Banner */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 leading-relaxed font-medium space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-800">
                  <Zap className="w-4 h-4" />
                  <span>Yapay Zeka Odak Sınav Modu</span>
                </div>
                <p>
                  Müfredat seviyenize ({activeLevel}) göre saniyeler içinde 4 şıklı kazanım soruları oluşturulur ve anında süre sınırlı sınav modunda başlatılır.
                </p>
              </div>

              {/* Custom Topic Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Özel Konu Başlığı Girin
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPracticeTopic}
                    onChange={(e) => setCustomPracticeTopic(e.target.value)}
                    placeholder="Örn: Asitler ve Bazlar veya Fiilimsiler..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none min-h-[44px]"
                  />
                  <select
                    value={practiceCount}
                    onChange={(e) => setPracticeCount(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-950 text-xs sm:text-sm font-bold focus:outline-none min-h-[44px]"
                  >
                    <option value={3}>3 Soru</option>
                    <option value={5}>5 Soru</option>
                    <option value={8}>8 Soru</option>
                  </select>
                </div>

                {customPracticeTopic.trim() && (
                  <button
                    type="button"
                    onClick={() => handleLaunchPracticeTest()}
                    disabled={isPracticeLoading}
                    className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 min-h-[44px] active:scale-95"
                  >
                    {isPracticeLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sorular Hazırlanıyor...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>&quot;{customPracticeTopic}&quot; Testini Başlat</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Ready Curriculum Topic Cards */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-800">Müfredatına Uygun Hazır Testler:</span>
                <div className="space-y-2">
                  {practiceChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLaunchPracticeTest(chip)}
                      disabled={isPracticeLoading}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group min-h-[48px] active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-blue-600 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-950 group-hover:text-blue-800">
                          {chip}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold shrink-0">
                        <span>Çöz</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
