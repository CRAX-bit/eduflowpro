'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Question } from '@/types';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Clock,
  Award,
  Check,
  HelpCircle,
  BrainCircuit,
  Zap,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { fmtTime, cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface QuizStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  folder?: string;
  questions: Question[];
  timeLimit?: number; // in seconds
  onComplete: (answers: string[], scorePercent: number) => void;
}

export function QuizStudyModal({
  isOpen,
  onClose,
  title,
  folder,
  questions,
  timeLimit,
  onComplete,
}: QuizStudyModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(timeLimit || 0);
  const [startTime] = useState<number>(Date.now());
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsAnswerRevealed(false);
      setIsCompleted(false);
      setRemainingTime(timeLimit || 0);
    }
  }, [isOpen, questions]);

  // Countdown timer if timeLimit is provided
  useEffect(() => {
    if (!isOpen || isCompleted || !timeLimit || timeLimit <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isCompleted, timeLimit]);

  // Current question data
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + (isAnswerRevealed ? 1 : 0)) / totalQuestions) * 100) : 0;

  // Generate 4 multiple choice options if not pre-configured in Question object
  const questionOptions = useMemo(() => {
    if (!currentQ) return [];
    if (currentQ.options && currentQ.options.length >= 2) {
      return currentQ.options;
    }

    const correct = currentQ.a.trim();
    // Default smart distractors based on question content
    const lower = (currentQ.q + ' ' + correct).toLowerCase();
    let distractors: string[] = [];

    if (lower.includes('hücre') || lower.includes('fotosentez') || lower.includes('mitokondri')) {
      distractors = ['Ribozom', 'Sitoplazma', 'Golgi Cihazı', 'Lizozom', 'Endoplazmik Retikulum'];
    } else if (lower.includes('tarih') || lower.includes('antlaşma') || lower.includes('savaş')) {
      distractors = ['Lozan Antlaşması', 'Mondros Mütarekesi', 'Sevr Antlaşması', 'Mudanya Ateşkesi'];
    } else if (!isNaN(Number(correct))) {
      const num = Number(correct);
      distractors = [
        String(num + 2),
        String(Math.max(1, num - 2)),
        String(num * 2),
        String(num + 5),
      ];
    } else {
      distractors = [
        'Seçenek A (Genel Yaklaşım)',
        'Seçenek B (Alternatif Yöntem)',
        'Seçenek C (İstisnai Durum)',
      ];
    }

    const filteredDistractors = distractors.filter((d) => d.toLowerCase() !== correct.toLowerCase()).slice(0, 3);
    const combined = [correct, ...filteredDistractors];

    // Deterministic shuffle based on question text length
    return combined.sort((a, b) => (a.length + currentQ.q.length) % 3 - (b.length + currentQ.q.length) % 3);
  }, [currentQ]);

  if (!isOpen || !currentQ) return null;

  const currentSelectedAnswer = selectedAnswers[currentIndex];
  const isCurrentCorrect = currentSelectedAnswer
    ? currentSelectedAnswer.trim().toLowerCase() === currentQ.a.trim().toLowerCase()
    : false;

  const handleSelectOption = (option: string) => {
    if (isAnswerRevealed) return; // Prevent change after answer is revealed

    const isCorrect = option.trim().toLowerCase() === currentQ.a.trim().toLowerCase();
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    setIsAnswerRevealed(true);

    if (isCorrect) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#6366f1'],
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswerRevealed(!!selectedAnswers[currentIndex + 1]);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setTotalElapsedSeconds(elapsed);

    // Calculate final score
    let correctCount = 0;
    const answerList: string[] = [];

    questions.forEach((q, idx) => {
      const ans = selectedAnswers[idx] || '';
      answerList.push(ans);
      if (ans.trim().toLowerCase() === q.a.trim().toLowerCase()) {
        correctCount += 1;
      }
    });

    const percent = Math.round((correctCount / totalQuestions) * 100);
    setIsCompleted(true);

    if (percent >= 70) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#818cf8', '#f59e0b'],
      });
    }

    onComplete(answerList, percent);
  };

  // Completion Summary Metrics
  const correctTotal = Object.entries(selectedAnswers).filter(([idx, ans]) => {
    const q = questions[Number(idx)];
    return q && ans.trim().toLowerCase() === q.a.trim().toLowerCase();
  }).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctTotal / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fade">
      <div className="relative w-full max-w-3xl bg-[#090a0f] border border-zinc-800 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. TOP FOCUS HEADER & DYNAMIC PROGRESS BAR */}
        <header className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-sm text-white truncate">
                {title}
              </h3>
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                {folder && <span>{folder} ·</span>}
                <span>Quizlet Odak Çalışma Modu</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {timeLimit && timeLimit > 0 && !isCompleted && (
              <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{fmtTime(remainingTime)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Çıkış Yap"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Smooth Animated Progress Bar */}
        {!isCompleted && (
          <div className="w-full bg-zinc-900 h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* 2. BODY CONTENT: QUESTION CARD or COMPLETION SUMMARY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-center">
          {!isCompleted ? (
            <div className="max-w-2xl mx-auto w-full space-y-6 animate-fade">
              
              {/* Question Count & Status Pill */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold">
                  Soru {currentIndex + 1} / {totalQuestions}
                </span>
                <span className="text-zinc-500">
                  %{progressPercent} Tamamlandı
                </span>
              </div>

              {/* Central Large Question Box */}
              <div className="p-6 sm:p-7 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-lg space-y-3">
                <h4 className="font-heading font-bold text-base sm:text-xl text-white leading-relaxed">
                  {currentQ.q}
                </h4>
              </div>

              {/* Interactive Multiple Choice Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questionOptions.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isSelected = currentSelectedAnswer === option;
                  const isCorrectAnswer = option.trim().toLowerCase() === currentQ.a.trim().toLowerCase();

                  let cardStyle = 'bg-zinc-950/70 hover:bg-zinc-900/90 border-zinc-800 hover:border-indigo-500/50 text-zinc-200';

                  if (isAnswerRevealed) {
                    if (isCorrectAnswer) {
                      cardStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] font-semibold';
                    } else if (isSelected && !isCorrectAnswer) {
                      cardStyle = 'bg-red-500/15 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
                    } else {
                      cardStyle = 'bg-zinc-950/40 border-zinc-800/50 text-zinc-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectOption(option)}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3.5 group',
                        cardStyle
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors',
                          isAnswerRevealed
                            ? isCorrectAnswer
                              ? 'bg-emerald-500 text-zinc-950'
                              : isSelected
                              ? 'bg-red-500 text-white'
                              : 'bg-zinc-800 text-zinc-500'
                            : 'bg-zinc-800 group-hover:bg-indigo-600 text-zinc-300 group-hover:text-white'
                        )}
                      >
                        {letter}
                      </div>

                      <span className="text-xs sm:text-sm leading-snug flex-1">
                        {option}
                      </span>

                      {isAnswerRevealed && isCorrectAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isAnswerRevealed && isSelected && !isCorrectAnswer && (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Pedagogical Explanation Feedback Bubble */}
              {isAnswerRevealed && (
                <div
                  className={cn(
                    'p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1.5 animate-fade',
                    isCurrentCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  )}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {isCurrentCorrect ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Harika Çözüm! Doğru Yanıt.</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-4 h-4 text-indigo-400" />
                        <span className="text-white">
                          Doğru Cevap: <b className="text-emerald-400">{currentQ.a}</b>
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300">
                    {currentQ.explanation
                      ? currentQ.explanation
                      : `Bu soru tipinde temel kavram tanımı ve konu mantığı gereği doğru yanıt "${currentQ.a}" olarak kabul edilir.`}
                  </p>
                </div>
              )}

              {/* Next Question Navigation Action */}
              {isAnswerRevealed && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all cursor-pointer"
                  >
                    <span>
                      {currentIndex < totalQuestions - 1 ? 'Sonraki Soruya Geç' : 'Testi Tamamla'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 3. QUIZLET COMPLETION SUMMARY CARD ("Tebrikler!" Özet Kartı) */
            <div className="max-w-md mx-auto w-full text-center space-y-6 animate-fade">
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-white">
                  {scorePercent >= 80 ? 'Harika Performans! 🌟' : scorePercent >= 50 ? 'Güzel Gayret! 👏' : 'Pratik Tamamlandı! 📚'}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400">
                  {title} çalışmasını başarıyla tamamladınız.
                </p>
              </div>

              {/* Metric Highlights Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-400">Başarı Oranı</div>
                  <div className="font-heading font-extrabold text-xl text-emerald-400">
                    %{scorePercent}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-400">Doğru / Toplam</div>
                  <div className="font-heading font-extrabold text-xl text-white">
                    {correctTotal} / {totalQuestions}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-400">Süre</div>
                  <div className="font-heading font-extrabold text-xl text-cyan-400">
                    {totalElapsedSeconds > 0 ? `${totalElapsedSeconds}s` : '—'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setSelectedAnswers({});
                    setIsAnswerRevealed(false);
                    setIsCompleted(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tekrar Çöz (Pratik)</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Ödevlerime Dön</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
