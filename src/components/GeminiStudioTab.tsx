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
      'Hayat Bilgisi: Sağlıklı Yaşam',
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
    placeholder: 'Örn: Türev ve İntegral, Hücre Bölünmeleri, Paragrafta Ana Fikir...',
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
      'Genel Kültür: Dünya Başkentleri',
      'Türkçe: Paragrafta Yapı ve Anlam',
    ],
  },
};

export function GeminiStudioTab({ onOpenCreateAssignmentModal }: GeminiStudioTabProps) {
  const { showToast, state } = useEduFlow();

  const [activeSubTab, setActiveSubTab] = useState<'quiz' | 'note' | 'chat'>('quiz');

  // Quiz State
  const [quizGrade, setQuizGrade] = useState('Ortaokul / LGS (5-8. Sınıf)');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizCount, setQuizCount] = useState(3);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  // Note State
  const [noteTopic, setNoteTopic] = useState('');
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<any>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Merhaba! Ben Deskio Öğretmen Copilot asistanınızım. MEB müfredat kazanımları, ders planlama, çoktan seçmeli veya açık uçlu soru hazırlama ve pedagojik analizler için hazırım. Size nasıl yardımcı olabilirim? ✨',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentLevelConfig = LEVEL_CONFIGS[quizGrade] || LEVEL_CONFIGS['Ortaokul / LGS (5-8. Sınıf)'];

  const handleGenerateQuiz = async (topicToUse?: string) => {
    const topic = (topicToUse || quizTopic).trim();
    if (!topic) {
      showToast('Lütfen bir konu başlığı girin veya önerilerden seçin.', 'warn');
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
      if (data.success && data.data) {
        setGeneratedQuiz(data.data);
        showToast(`${quizCount} soruluk test başarıyla oluşturuldu!`, 'success');
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
      const headers = await getAuthHeaders();
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
      const headers = await getAuthHeaders();
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
          { role: 'assistant', text: data.error || 'Yanıt üretilirken bir sorun oluştu.' },
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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-300 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('quiz')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
              activeSubTab === 'quiz'
                ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            )}
          >
            <FileQuestion className="w-4 h-4" />
            <span>Soru & Test Üretici</span>
          </button>

          <button
            onClick={() => setActiveSubTab('note')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
              activeSubTab === 'note'
                ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span>Ders Özeti & Notu</span>
          </button>

          <button
            onClick={() => setActiveSubTab('chat')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
              activeSubTab === 'chat'
                ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Copilot Chat</span>
          </button>
        </div>
      </div>

      {/* QUIZ TAB */}
      {activeSubTab === 'quiz' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-300 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Konu / Kazanım Başlığı
              </label>
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder={currentLevelConfig.placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Hedef Seviye
              </label>
              <select
                value={quizGrade}
                onChange={(e) => setQuizGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-bold focus:outline-none"
              >
                {Object.keys(LEVEL_CONFIGS).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Soru Sayısı
              </label>
              <select
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-xs sm:text-sm font-bold focus:outline-none"
              >
                <option value={3}>3 Soru (Hızlı)</option>
                <option value={5}>5 Soru (Standart)</option>
                <option value={8}>8 Soru</option>
                <option value={10}>10 Soru (Deneme)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-800">
              Önerilen Konu Başlıkları:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentLevelConfig.suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuizTopic(s)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-slate-800 hover:text-blue-800 text-xs font-semibold transition-all cursor-pointer text-left"
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
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
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

          {generatedQuiz && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-heading font-extrabold text-base text-slate-950">
                    {generatedQuiz.title || quizTopic}
                  </h4>
                  <span className="text-xs text-blue-800 font-bold">
                    {generatedQuiz.questions?.length || 0} Soru Hazırlandı
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onOpenCreateAssignmentModal({
                      type: 'test',
                      title: generatedQuiz.title || quizTopic,
                      folder: generatedQuiz.folder || quizTopic,
                      desc: generatedQuiz.desc || '',
                      timeLimit: (generatedQuiz.questions?.length || 3) * 60,
                      questions: generatedQuiz.questions,
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Ödev Olarak Yayınla</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {generatedQuiz.questions?.map((q: Question, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-white border border-slate-300 text-sm space-y-1.5 shadow-2xs font-medium"
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

      {/* NOTE TAB */}
      {activeSubTab === 'note' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-300 space-y-6 shadow-xs">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ders / Konu Başlığı
            </label>
            <input
              type="text"
              value={noteTopic}
              onChange={(e) => setNoteTopic(e.target.value)}
              placeholder="Örn: 9. Sınıf Fotosentez ve Solunum Özeti"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => handleGenerateNote()}
            disabled={isNoteLoading || !noteTopic.trim()}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
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
            <div className="p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="font-heading font-extrabold text-base text-slate-950">
                  {generatedNote.title || noteTopic}
                </h4>

                <button
                  type="button"
                  onClick={() => {
                    onOpenCreateAssignmentModal({
                      type: 'note',
                      title: generatedNote.title || noteTopic,
                      folder: generatedNote.folder || noteTopic,
                      desc: generatedNote.content || '',
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Ders Notu Olarak Yayınla</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-950 font-medium leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto shadow-2xs">
                {generatedNote.content}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHAT TAB */}
      {activeSubTab === 'chat' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-300 space-y-4 shadow-xs">
          <div className="space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto pr-1">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] space-y-1.5 shadow-2xs',
                  m.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white font-semibold'
                    : 'bg-slate-50 border border-slate-300 text-slate-950 font-medium'
                )}
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/40 pb-1 text-xs opacity-80 font-bold">
                  <span>{m.role === 'user' ? 'Siz' : 'Deskio Copilot'}</span>
                  {m.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(m.text, `chat-${idx}`)}
                      className="hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {copiedId === `chat-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            ))}

            {isChatLoading && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 text-slate-800 text-sm flex items-center gap-2 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Deskio Copilot yanıt hazırlıyor...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-200">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Örn: 8. Sınıf Fen için deney önerisi veya LGS matematik çalışma programı iste..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl text-slate-950 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
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
