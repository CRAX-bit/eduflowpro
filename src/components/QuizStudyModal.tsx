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

export interface QuizStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  folder?: string;
  questions?: Question[];
  timeLimit?: number; // in seconds
  quiz?: {
    id?: string;
    title: string;
    folder?: string;
    questions: Question[];
    timeLimit?: number;
  } | null;
  onComplete: (answers: string[], scorePercent: number) => void;
}

export function QuizStudyModal({
  isOpen,
  onClose,
  title: propTitle,
  folder: propFolder,
  questions: propQuestions,
  timeLimit: propTimeLimit,
  quiz,
  onComplete,
}: QuizStudyModalProps) {
  const activeTitle = quiz?.title || propTitle || 'İnteraktif Soru Çözümü';
  const activeFolder = quiz?.folder || propFolder || '';
  const activeQuestions = quiz?.questions || propQuestions || [];
  const activeTimeLimit = quiz?.timeLimit || propTimeLimit || 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(activeTimeLimit);
  const [startTime] = useState<number>(Date.now());
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsAnswerRevealed(false);
      setIsCompleted(false);
      setRemainingTime(activeTimeLimit);
    }
  }, [isOpen, activeQuestions, activeTimeLimit]);

  useEffect(() => {
    if (!isOpen || isCompleted || !activeTimeLimit || activeTimeLimit <= 0) return;

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
  }, [isOpen, isCompleted, activeTimeLimit]);

  const currentQ = activeQuestions[currentIndex];
  const totalQuestions = activeQuestions.length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + (isAnswerRevealed ? 1 : 0)) / totalQuestions) * 100) : 0;

  const questionOptions = useMemo(() => {
    if (!currentQ) return [];
    if (currentQ.options && Array.isArray(currentQ.options) && currentQ.options.length >= 2) {
      return currentQ.options;
    }

    const correct = (currentQ.a || currentQ.correctAnswer || '').trim();
    if (!isNaN(Number(correct)) && correct !== '') {
      const num = Number(correct);
      return [
        String(num),
        String(num + 2),
        String(Math.max(1, num - 2)),
        String(num * 2),
      ].sort(() => 0.5 - Math.random());
    }

    return [correct, 'Doğrulanamaz', 'Belirsiz', 'Farklı Değer'];
  }, [currentQ]);

  if (!isOpen || !currentQ) return null;

  const currentSelectedAnswer = selectedAnswers[currentIndex];
  const isCurrentCorrect = currentSelectedAnswer
    ? currentSelectedAnswer.trim().toLowerCase() === currentQ.a.trim().toLowerCase()
    : false;

  const handleSelectOption = (option: string) => {
    if (isAnswerRevealed) return;

    const isCorrect = option.trim().toLowerCase() === currentQ.a.trim().toLowerCase();
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    setIsAnswerRevealed(true);

    if (isCorrect) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2563eb', '#10b981', '#6366f1'],
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

    let correctCount = 0;
    const answerList: string[] = [];

    activeQuestions.forEach((q, idx) => {
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
        colors: ['#2563eb', '#10b981', '#3b82f6', '#f59e0b'],
      });
    }

    onComplete(answerList, percent);
  };

  const correctTotal = Object.entries(selectedAnswers).filter(([idx, ans]) => {
    const q = activeQuestions[Number(idx)];
    return q && ans.trim().toLowerCase() === q.a.trim().toLowerCase();
  }).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctTotal / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-fade">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-sm text-slate-900 truncate">
                {activeTitle}
              </h3>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                {activeFolder && <span>{activeFolder} ·</span>}
                <span>Quiz Odak Çalışma Modu</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTimeLimit > 0 && !isCompleted && (
              <div className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-mono text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{fmtTime(remainingTime)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer shadow-2xs"
              title="Çıkış Yap"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Progress Bar */}
        {!isCompleted && (
          <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-center bg-slate-50/40">
          {!isCompleted ? (
            <div className="max-w-2xl mx-auto w-full space-y-6 animate-fade">
              {/* Question Count */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs">
                  Soru {currentIndex + 1} / {totalQuestions}
                </span>
                <span className="text-slate-500 font-medium">
                  %{progressPercent} Tamamlandı
                </span>
              </div>

              {/* Question Box */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <h4 className="font-heading font-bold text-base sm:text-xl text-slate-900 leading-relaxed">
                  {currentQ.q}
                </h4>
              </div>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questionOptions.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = currentSelectedAnswer === option;
                  const isCorrectAnswer = option.trim().toLowerCase() === currentQ.a.trim().toLowerCase();

                  let cardStyle = 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-800 shadow-2xs';

                  if (isAnswerRevealed) {
                    if (isCorrectAnswer) {
                      cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold shadow-xs';
                    } else if (isSelected && !isCorrectAnswer) {
                      cardStyle = 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs';
                    } else {
                      cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
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
                              ? 'bg-emerald-600 text-white'
                              : isSelected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                            : 'bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white'
                        )}
                      >
                        {letter}
                      </div>

                      <span className="text-xs sm:text-sm leading-snug flex-1">
                        {option}
                      </span>

                      {isAnswerRevealed && isCorrectAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerRevealed && isSelected && !isCorrectAnswer && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Bubble */}
              {isAnswerRevealed && (
                <div
                  className={cn(
                    'p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1.5 animate-fade shadow-2xs',
                    isCurrentCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  )}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {isCurrentCorrect ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Harika Çözüm! Doğru Yanıt.</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-900">
                          Doğru Cevap: <b className="text-emerald-600">{currentQ.a}</b>
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-slate-600">
                    {currentQ.explanation
                      ? currentQ.explanation
                      : `Bu soru tipinde temel kavram tanımı ve konu mantığı gereği doğru yanıt "${currentQ.a}" olarak kabul edilir.`}
                  </p>
                </div>
              )}

              {/* Next Question Navigation */}
              {isAnswerRevealed && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
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
            /* Completion Summary Card */
            <div className="max-w-md mx-auto w-full text-center space-y-6 animate-fade">
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-slate-900">
                  {scorePercent >= 80 ? 'Harika Performans! 🌟' : scorePercent >= 50 ? 'Güzel Gayret! 👏' : 'Pratik Tamamlandı! 📚'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {activeTitle} çalışmasını başarıyla tamamladınız.
                </p>
              </div>

              {/* Metric Highlights Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <div className="text-[11px] text-slate-500">Başarı Oranı</div>
                  <div className="font-heading font-extrabold text-xl text-blue-600">
                    %{scorePercent}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <div className="text-[11px] text-slate-500">Doğru / Toplam</div>
                  <div className="font-heading font-extrabold text-xl text-slate-900">
                    {correctTotal} / {totalQuestions}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <div className="text-[11px] text-slate-500">Süre</div>
                  <div className="font-heading font-extrabold text-xl text-indigo-600">
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
                  className="flex-1 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tekrar Çöz (Pratik)</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
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
