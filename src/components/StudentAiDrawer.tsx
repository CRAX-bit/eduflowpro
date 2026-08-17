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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuthHeaders } from '@/lib/api-client';

interface StudentAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
  currentGradeLevel: string;
  onStartFocusTest: (quizData: {
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
      'Matematik: Fonksiyonlar ve Türev',
      'Fizik: Newton Hareket Yasaları',
      'Kimya: Kimyasal Denge ve Hız',
      'Biyoloji: Hücresel Solunum ve ATP',
      'Geometri: Üçgende Benzerlik',
    ];
  }
  if (g.includes('eşit') || g.includes('sözel')) {
    return [
      'Edebiyat: Divan Edebiyatı Nazım Şekilleri',
      'Tarih: İlk Türk İslam Devletleri',
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
    return 'Merhaba! Ben senin LGS çalışma ve özel ders koçunum. Anlamadığın yeni nesil soruları, formülleri, deneme analizi veya konu özetlerini bana dilediğin gibi sorabilirsin. Başarıya birlikte koşuyoruz! 🚀🎯';
  }
  if (g.includes('lise') || g.includes('yks')) {
    return 'Selam! Ben senin YKS & lise ders koçunum. TYT-AYT sınav taktikleri, formül ispatları ve ÖSYM mantığı odaklı sorularını buraya iletebilirsin. Hangi konuyu derinleştirelim? 🎯📚';
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
  onStartFocusTest,
  initialTab = 'chat',
}: StudentAiDrawerProps) {
  const { showToast, state } = useEduFlow();

  // Drawer Tabs: 'chat' | 'practice'
  const [activeTab, setActiveTab] = useState<'chat' | 'practice'>(initialTab);

  // Sync initial tab when changed externally
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Dynamic practice and prompt chips
  const practiceChips = useMemo(() => getCurriculumTopics(currentGradeLevel), [currentGradeLevel]);

  // --- Student Coach Chat State ---
  const [coachMessages, setCoachMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: getCoachWelcomeMessage(currentGradeLevel),
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
  }, [practiceChips, practiceTopic]);

  // Update welcome message on level change
  useEffect(() => {
    const welcome = getCoachWelcomeMessage(currentGradeLevel);
    setCoachMessages([{ role: 'assistant', text: welcome }]);
  }, [currentGradeLevel]);

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

  // --- Send Coach Message Handler ---
  const handleSendCoachMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || coachInput).trim();
    if (!textToSend || isCoachLoading) return;

    setCoachMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    if (!customPrompt) setCoachInput('');
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
          gradeLevel: currentGradeLevel,
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
          { role: 'assistant', text: data.error || 'Yanıt hazırlanırken bir sorun oluştu. Lütfen tekrar iletin.' },
        ]);
      }
    } catch (err) {
      setCoachMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol ediniz.' },
      ]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  // --- Generate Smart Quizlet Practice Test Handler ---
  const handleGeneratePracticeQuiz = async (topicToUse?: string) => {
    const topic = (topicToUse || practiceTopic).trim();
    if (!topic) {
      showToast('Lütfen test konusu giriniz.', 'warn');
      return;
    }
    setPracticeTopic(topic);
    setIsPracticeLoading(true);

    try {
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_quiz',
          topic,
          count: practiceCount,
          grade: currentGradeLevel,
        }),
      });

      const data = await res.json();
      if (data.success && data.data && data.data.questions?.length > 0) {
        onClose(); // Close drawer to focus on quizlet study mode
        onStartFocusTest({
          title: data.data.title || `${topic} — Pratik Test`,
          folder: topic,
          questions: data.data.questions,
          timeLimit: (data.data.questions.length || 5) * 60,
        });
        showToast(`${topic} için ${data.data.questions.length} soruluk odak çalışma modu başlatıldı!`, 'success');
      } else {
        showToast(data.error || 'Alıştırma testi oluşturulamadı. Lütfen tekrar deneyin.', 'error');
      }
    } catch (e) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsPracticeLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Panoya kopyalandı!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const studentPrompts = [
    'Bu konuyu 3 maddede özetler misin?',
    'Örnek bir soru sor ve cevabımı kontrol et',
    'Bu konudaki en önemli formüller nelerdir?',
    'Sınavda çıkabilecek kritik ipuçlarını listele',
  ];

  return (
    <>
      {/* 1. Fixed Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={onToggle || (() => {})}
          className="group relative flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-extrabold text-xs sm:text-sm shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 border border-emerald-400/40 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xl"
          title="AI Özel Ders Koçunu Aç"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-950 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-300" />
          </div>
          <span className="font-heading tracking-wide">✨ AI Özel Ders Koçu</span>
        </button>
      </div>

      {/* 2. Slide-Over Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 print:hidden"
        />
      )}

      {/* 3. Slide-Over Drawer Container */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] md:w-[580px] bg-[#0c0d12] border-l border-zinc-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out print:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base text-white">
                  AI Özel Ders Koçu
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 truncate max-w-[140px]">
                  {currentGradeLevel.split('(')[0] || 'Öğrenci'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                7/24 Birebir Soru Çözümü & Akıllı Quizlet Testleri
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Çekmeceyi Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === 'chat'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kişisel Konu Danışmanı</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === 'practice'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
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
          {/* TAB 1: KİŞİSEL KONU DANIŞMANI (STUDENT COACH CHAT)           */}
          {/* ============================================================ */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full space-y-4">
              {/* Quick Prompt Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400">
                  Hızlı Çalışma Soruları:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {studentPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendCoachMessage(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 hover:border-emerald-500/40 text-zinc-300 text-[11px] font-medium transition-all text-left cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 space-y-3 min-h-[260px] max-h-[460px] overflow-y-auto pr-1">
                {coachMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] space-y-1.5',
                      m.role === 'user'
                        ? 'ml-auto bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
                        : 'bg-zinc-950 border border-zinc-800/90 text-zinc-200 shadow-sm'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 text-[10px] opacity-75">
                      <span>{m.role === 'user' ? 'Sen' : 'Özel Ders Koçun'}</span>
                      {m.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.text, `student-chat-${idx}`)}
                          className="hover:text-white transition-colors cursor-pointer"
                          title="Yanıtı Kopyala"
                        >
                          {copiedId === `student-chat-${idx}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                ))}

                {isCoachLoading && (
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Ders koçun yanıt hazırlıyor...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCoachMessage();
                }}
                className="pt-2 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  placeholder="Sorunu buraya yaz (örn: Fotosentezin ışığa bağımlı evresini açıklar mısın?)..."
                  className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!coachInput.trim() || isCoachLoading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Sor</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: AKILLI TEST OLUŞTURUCU (AI QUIZLET PRACTICE)         */}
          {/* ============================================================ */}
          {activeTab === 'practice' && (
            <div className="space-y-5 animate-fade">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Quizlet Odak Çalışma Modu</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Hedef seviyene uygun konuyu seç ya da yaz, Gemini AI senin için çoktan seçmeli interaktif bir test oluştursun ve anında tam ekran çalışma moduna geç!
                </p>
              </div>

              {/* Quick Curriculum Chips */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300">
                  🎯 Seviyene Uygun Örnek Konular:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {practiceChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPracticeTopic(chip)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left',
                        practiceTopic === chip
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Topic Input */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Alıştırma Konusu
                  </label>
                  <input
                    type="text"
                    value={practiceTopic}
                    onChange={(e) => setPracticeTopic(e.target.value)}
                    placeholder="Örn: 10. Sınıf Mitoz Bölünme Evreleri..."
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Soru Sayısı
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { count: 3, label: '3 Soru (Hızlı)' },
                      { count: 5, label: '5 Soru (Standart)' },
                      { count: 10, label: '10 Soru (Kapsamlı)' },
                    ].map((opt) => (
                      <button
                        key={opt.count}
                        type="button"
                        onClick={() => setPracticeCount(opt.count)}
                        className={cn(
                          'py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center',
                          practiceCount === opt.count
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPracticeLoading || !practiceTopic.trim()}
                  onClick={() => handleGeneratePracticeQuiz()}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xl shadow-emerald-500/20"
                >
                  {isPracticeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Sorular Hazırlanıyor, Odak Modu Başlatılıyor...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-zinc-950" />
                      <span>🚀 Testi Başlat (Quizlet Odak Modu)</span>
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
