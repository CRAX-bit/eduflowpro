'use client';

import React, { useState } from 'react';
import { useEduFlow } from '@/context/EduFlowContext';
import { Question } from '@/types';
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
  Compass,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuthHeaders } from '@/lib/api-client';

interface GeminiStudioTabProps {
  onOpenCreateAssignmentModal: (prefill: any) => void;
}

export function GeminiStudioTab({ onOpenCreateAssignmentModal }: GeminiStudioTabProps) {
  const { showToast, state } = useEduFlow();

  const [activeSubTab, setActiveSubTab] = useState<'quiz' | 'note' | 'chat'>('quiz');

  // Quiz Generation State
  const [quizTopic, setQuizTopic] = useState('');
  const [quizCount, setQuizCount] = useState(3);
  const [quizGrade, setQuizGrade] = useState('Ortaokul / LGS (5-8. Sınıf)');
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
      text: 'Merhaba Hocam! Soru hazırlama, MEB müfredat kazanımları, ders planı oluşturma veya pedagojik analizler için hazırım. Size nasıl yardımcı olabilirim?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quizSuggestions = [
    'Matematik Çarpanlar ve Katlar (EBOB-EKOK)',
    'Fen Bilgisi Fotosentez ve Solunum',
    'İngilizce Present Perfect Tense',
    'Türkçe Fiilimsiler (Eylemsiler)',
    'Fizik Kuvvet ve Hareket Yasaları',
    'Kimya Asitler, Bazlar ve pH Değerleri',
    'Tarih Milli Mücadele ve Kurtuluş Savaşı',
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
      const headers = await getAuthHeaders(state.session);
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
      if (data.success && data.data) {
        setGeneratedQuiz(data.data);
        showToast('Kazanımlara uygun sorular başarıyla üretildi! 🎉', 'success');
      } else {
        showToast(data.error || 'Test oluşturulamadı. Lütfen tekrar deneyin.', 'error');
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
      const headers = await getAuthHeaders(state.session);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_notes',
          topic,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedNote(data.data);
        showToast('Ders notu ve özeti oluşturuldu.', 'success');
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
          { role: 'assistant', text: data.error || 'Yanıt üretilirken bir sorun oluştu. Lütfen sorunuzu tekrar iletin.' },
        ]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Panoya kopyalandı.', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Studio Subtabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('quiz')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
              activeSubTab === 'quiz'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            )}
          >
            <FileQuestion className="w-4 h-4 text-emerald-400" />
            <span>Test & Soru Hazırlama</span>
          </button>

          <button
            onClick={() => setActiveSubTab('note')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
              activeSubTab === 'note'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            )}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Ders Notu & Özet</span>
          </button>

          <button
            onClick={() => setActiveSubTab('chat')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
              activeSubTab === 'chat'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            )}
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Öğretmen Danışman Asistanı</span>
          </button>
        </div>

        <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gemini 2.5 Pro Devrede</span>
        </div>
      </div>

      {/* Subtab 1: Quiz Generator */}
      {activeSubTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            {/* Prominent Guidance Header */}
            <div className="space-y-1.5 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Yapay Zeka Sınav Yapılandırıcı</span>
              </div>
              <h3 className="font-heading font-bold text-base text-white">
                Hangi konu için soru üretmek istersiniz?
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Konuyu yazın, soru sayısını ve sınav türünü seçin; yapay zeka müfredata tam uyumlu orijinal sorular hazırlasın.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Konu / Ünite Başlığı
                </label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="Örn: Çarpanlar ve Katlar, Fotosentez, Fiilimsiler..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                  Örnek Konular:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quizSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleGenerateQuiz(s)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Soru Sayısı
                  </label>
                  <select
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value={3}>3 Soru (Hızlı Test)</option>
                    <option value={5}>5 Soru (Standart)</option>
                    <option value={10}>10 Soru (Kapsamlı Deneme)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Eğitim Seviyesi
                  </label>
                  <select
                    value={quizGrade}
                    onChange={(e) => setQuizGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="İlkokul (1-4. Sınıf)">İlkokul (1-4. Sınıf)</option>
                    <option value="Ortaokul / LGS (5-8. Sınıf)">Ortaokul / LGS (5-8. Sınıf)</option>
                    <option value="Lise / TYT-AYT (9-12. Sınıf)">Lise / TYT-AYT (9-12. Sınıf)</option>
                    <option value="Lisans / KPSS - ALES">Lisans / KPSS - ALES</option>
                    <option value="Genel / Konu Kavrama">Genel / Konu Kavrama</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={isQuizLoading}
                onClick={() => handleGenerateQuiz()}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
              >
                {isQuizLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Müfredata Uygun Sorular Hazırlanıyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-zinc-950" />
                    <span>Test Sorularını Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Preview */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-heading font-semibold text-base text-white flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-emerald-400" />
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
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 text-zinc-950" />
                  <span>Ödev Olarak Yayınla</span>
                </button>
              )}
            </div>

            {!generatedQuiz ? (
              <div className="p-12 text-center text-zinc-400 text-xs border border-dashed border-zinc-800 rounded-xl space-y-2">
                <BrainCircuit className="w-8 h-8 mx-auto text-zinc-500" />
                <p>Sol taraftaki panelden bir konu belirleyip "Test Sorularını Oluştur" butonuna basınız.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="text-xs font-semibold text-emerald-400">Ünite / Konu: {generatedQuiz.folder}</div>
                  <h4 className="font-bold text-base text-white">{generatedQuiz.title}</h4>
                  <p className="text-xs text-zinc-300">{generatedQuiz.desc}</p>
                </div>

                <div className="space-y-3">
                  {generatedQuiz.questions?.map((q: Question, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="text-xs font-semibold text-zinc-400">Soru {idx + 1}</div>
                      <p className="text-xs sm:text-sm text-zinc-100 font-medium leading-relaxed">{q.q}</p>
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Doğru Yanıt: <b>{q.a}</b></span>
                      </div>
                      {q.explanation && (
                        <p className="text-[11px] text-zinc-400 italic">💡 Çözüm: {q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: Notes Generator */}
      {activeSubTab === 'note' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>Ders Notu & Özet Yapılandırıcı</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Ders & Konu Başlığı
                </label>
                <input
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  placeholder="Örn: Newton Hareket Yasaları, Mitoz Bölünme..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-cyan-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                  Örnek Konu Başlıkları:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {noteSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleGenerateNote(s)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer"
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
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isNoteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ders Notu Hazırlanıyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Ders Notunu Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Preview */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-heading font-semibold text-base text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Hazırlanan Ders Notu</span>
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
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 text-zinc-950" />
                  <span>Öğrencilerle Paylaş</span>
                </button>
              )}
            </div>

            {!generatedNote ? (
              <div className="p-12 text-center text-zinc-400 text-xs border border-dashed border-zinc-800 rounded-xl space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-zinc-500" />
                <p>Sol taraftaki alandan bir konu girerek ders notu ve özet oluşturabilirsiniz.</p>
              </div>
            ) : (
              <div className="space-y-3 animate-fade">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-xs font-semibold text-cyan-400">Ünite: {generatedNote.folder}</div>
                  <h4 className="font-bold text-lg text-white mt-1">{generatedNote.title}</h4>
                </div>

                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {generatedNote.content}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 3: Chat Assistant (Gerçek Gemini AI Bağlantısı) */}
      {activeSubTab === 'chat' && (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-heading font-semibold text-base text-white">
                Öğretmen Danışman Asistanı
              </h3>
              <p className="text-xs text-zinc-400">
                Müfredat kazanımları, rubrik kriterleri, ders planları ve pedagojik analizler hakkında danışabilirsiniz.
              </p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-4 rounded-xl text-xs sm:text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'ml-auto bg-emerald-500 text-zinc-950 font-medium shadow-sm'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-200'
                )}
              >
                {m.text}
              </div>
            ))}
            {isChatLoading && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Danışman yanıt hazırlıyor...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Sorunuzu buraya yazınız (örn: 8. sınıf LGS Çarpanlar konusu için 3 aşamalı ders planı ve kazanım analizi önerir misin?)..."
              className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gönder</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
