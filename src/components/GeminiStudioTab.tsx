'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import {
  Sparkles,
  BrainCircuit,
  FileQuestion,
  BookOpen,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Zap,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeminiStudioTabProps {
  onOpenCreateAssignmentModal: (prefill: any) => void;
}

export function GeminiStudioTab({ onOpenCreateAssignmentModal }: GeminiStudioTabProps) {
  const { showToast } = useEduFlow();

  const [activeSubTab, setActiveSubTab] = useState<'quiz' | 'note' | 'chat'>('quiz');

  // Quiz Generation State
  const [quizTopic, setQuizTopic] = useState('');
  const [quizCount, setQuizCount] = useState(3);
  const [quizGrade, setQuizGrade] = useState('Lise / Ortaokul');
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  // Note Generation State
  const [noteTopic, setNoteTopic] = useState('');
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<any>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Merhaba Hocam! Ben EduFlow Pro Yapay Zeka Eğitim Asistanı. Soru hazırlama, müfredat planlama, ders notu özetleri ve pedagojik tavsiyeler için 7/24 hizmetinizdeyim. Nasıl yardımcı olabilirim? 🎓✨',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quizSuggestions = [
    'İngilizce Present Perfect Tense',
    'Matematik Üslü ve Köklü İfadeler',
    'Biyoloji Hücre ve Organeller',
    'Türkçe Paragrafta Anlam ve Ana Fikir',
    'Fizik Kuvvet ve Hareket Yasaları',
    'Kimya Asitler, Bazlar ve Tuzlar',
  ];

  const noteSuggestions = [
    'Mitoz ve Mayoz Bölünme Karşılaştırması',
    'Past Simple vs Past Continuous Kullanımı',
    'Newton Hareket Yasaları ve Örnekleri',
    'Trigonometri Temel Özdeşlikler ve Formüller',
  ];

  const handleGenerateQuiz = async (topicToUse?: string) => {
    const topic = (topicToUse || quizTopic).trim();
    if (!topic) {
      showToast('Lütfen bir sınav konusu yazın veya önerilerden seçin.', 'warn');
      return;
    }
    setQuizTopic(topic);
    setIsQuizLoading(true);
    setGeneratedQuiz(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_quiz',
          topic,
          count: Number(quizCount),
          grade: quizGrade,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedQuiz(data.data);
        showToast('Gemini AI soruları başarıyla üretti! 🎉', 'success');
      } else {
        showToast('Test oluşturulamadı. Lütfen tekrar deneyin.', 'error');
      }
    } catch (e) {
      showToast('Bağlantı hatası oluştu.', 'error');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleGenerateNote = async (topicToUse?: string) => {
    const topic = (topicToUse || noteTopic).trim();
    if (!topic) {
      showToast('Lütfen bir konu başlığı girin veya önerilerden seçin.', 'warn');
      return;
    }
    setNoteTopic(topic);
    setIsNoteLoading(true);
    setGeneratedNote(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_notes',
          topic,
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
        { role: 'assistant', text: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Panoya kopyalandı! 📋', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Studio Subtabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827]/80 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('quiz')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              activeSubTab === 'quiz'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            )}
          >
            <FileQuestion className="w-4 h-4 text-purple-300" />
            <span>🤖 AI Sınav & Test Üretici</span>
          </button>

          <button
            onClick={() => setActiveSubTab('note')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              activeSubTab === 'note'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            )}
          >
            <BookOpen className="w-4 h-4 text-cyan-300" />
            <span>📝 AI Ders Notu & Özet</span>
          </button>

          <button
            onClick={() => setActiveSubTab('chat')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              activeSubTab === 'chat'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            )}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>💡 Pedagoji & Asistan Chat</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gemini Pro v1.5 Engine Active</span>
        </div>
      </div>

      {/* Subtab 1: AI Quiz Generator */}
      {activeSubTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#111827]/80 border border-slate-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Sınav Yapılandırıcı</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Konu / Ünite Başlığı
                </label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="Örn: İngilizce Present Perfect Tense"
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-purple-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Popüler Konu Örnekleri:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quizSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleGenerateQuiz(s)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-400 text-[11px] text-slate-300 hover:text-purple-300 transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Soru Sayısı
                  </label>
                  <select
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 focus:border-purple-400 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value={3}>3 Soru (Hızlı Test)</option>
                    <option value={5}>5 Soru (Standart)</option>
                    <option value={10}>10 Soru (Kapsamlı)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Seviye
                  </label>
                  <select
                    value={quizGrade}
                    onChange={(e) => setQuizGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 focus:border-purple-400 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="Ortaokul / LGS">Ortaokul / LGS</option>
                    <option value="Lise / YKS">Lise / YKS</option>
                    <option value="Üniversite / Genel">Üniversite / Genel</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={isQuizLoading}
                onClick={() => handleGenerateQuiz()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isQuizLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini Soruları Hazırlıyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Test Sorularını Üret</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Preview */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#111827]/80 border border-slate-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-purple-400" />
                <span>Üretilen Test Önizlemesi</span>
              </h3>

              {generatedQuiz && (
                <button
                  onClick={() =>
                    onOpenCreateAssignmentModal({
                      type: 'test',
                      title: generatedQuiz.title,
                      folder: generatedQuiz.folder,
                      desc: generatedQuiz.desc,
                      timeLimit: generatedQuiz.timeLimit,
                      questions: generatedQuiz.questions,
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Bu Testi Ödev Olarak Yayınla</span>
                </button>
              )}
            </div>

            {isQuizLoading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">
                  Google Gemini Pro müfredata tam uyumlu soruları ve çözümleri yapılandırıyor...
                </p>
              </div>
            ) : generatedQuiz ? (
              <div className="space-y-4 animate-fade">
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1">
                  <div className="font-heading font-bold text-base text-white">
                    {generatedQuiz.title}
                  </div>
                  <div className="text-xs text-purple-300">
                    Klasör: <b>{generatedQuiz.folder}</b> · Süre:{' '}
                    <b>{Math.round((generatedQuiz.timeLimit || 120) / 60)} dakika</b>
                  </div>
                  {generatedQuiz.desc && (
                    <p className="text-xs text-slate-400 mt-1">{generatedQuiz.desc}</p>
                  )}
                </div>

                <div className="space-y-3">
                  {generatedQuiz.questions?.map((q: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                        <span className="text-purple-400 font-bold">Soru {i + 1}</span>
                        <button
                          onClick={() => copyToClipboard(`Soru: ${q.q}\nCevap: ${q.a}`, `q-${i}`)}
                          className="opacity-0 group-hover:opacity-100 text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-opacity"
                        >
                          {copiedId === `q-${i}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Kopyala</span>
                        </button>
                      </div>
                      <div className="text-xs text-white font-medium">{q.q}</div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Doğru Cevap: <b>{q.a}</b>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 space-y-2">
                <BrainCircuit className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">Henüz Bir Test Üretilmedi</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Sol paneldeki formdan konu başlığını belirleyin veya önerilen konulardan birine tıklayarak anında test üretin.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: AI Lesson Notes */}
      {activeSubTab === 'note' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#111827]/80 border border-slate-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Ders Notu & Özet Yapılandırıcı</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Özet Çıkarılacak Konu
                </label>
                <input
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  placeholder="Örn: Mitoz ve Mayoz Bölünme Farkları"
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Örnek Konu Başlıkları:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {noteSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleGenerateNote(s)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-400 text-[11px] text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={isNoteLoading}
                onClick={() => handleGenerateNote()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isNoteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ders Notu Hazırlanıyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Ders Notu & Özet Çıkar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Preview */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#111827]/80 border border-slate-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Üretilen Ders Notu Önizlemesi</span>
              </h3>

              {generatedNote && (
                <button
                  onClick={() =>
                    onOpenCreateAssignmentModal({
                      type: 'note',
                      title: generatedNote.title,
                      folder: generatedNote.folder,
                      desc: generatedNote.content,
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ders Notu Olarak Yayınla</span>
                </button>
              )}
            </div>

            {isNoteLoading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">
                  Gemini AI anlaşılır, formüllü ve örnekli ders notu özetini oluşturuyor...
                </p>
              </div>
            ) : generatedNote ? (
              <div className="space-y-4 animate-fade">
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                  <div className="font-heading font-bold text-base text-white">
                    {generatedNote.title}
                  </div>
                  <div className="text-xs text-cyan-300">
                    Klasör / Ünite: <b>{generatedNote.folder}</b>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
                  {generatedNote.content}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">Henüz Ders Notu Üretilmedi</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Sol panelden dilediğiniz konuyu yazarak saniyeler içinde zengin ders özetleri çıkarın.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 3: Pedagogy & Chat Assistant */}
      {activeSubTab === 'chat' && (
        <div className="p-6 rounded-3xl bg-[#111827]/80 border border-slate-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Gemini AI Eğitim & Pedagoji Danışmanı</span>
            </h3>
            <span className="text-xs text-slate-400">7/24 Öğretmen Asistanı</span>
          </div>

          {/* Messages */}
          <div className="space-y-3 min-h-[280px] max-h-[420px] overflow-y-auto pr-2">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={cn(
                    'p-3.5 rounded-2xl text-xs sm:text-sm max-w-xl leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-medium'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Gemini yanıt hazırlıyor...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Örn: 8. sınıf öğrencilerini motive etmek için 3 pedagojik taktik önerir misin?"
              className="flex-1 px-4 py-3 bg-slate-900/90 border border-slate-800 focus:border-emerald-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Gönder</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
