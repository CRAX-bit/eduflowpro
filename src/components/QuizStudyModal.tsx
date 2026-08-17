'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question } from '@/types';
import {
  X,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Zap,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface QuizStudyModalProps {
  quiz: {
    id?: string;
    title: string;
    folder?: string;
    questions: Question[];
    timeLimit?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (answers: string[], scorePercent: number) => void;
}

export function QuizStudyModal({
  quiz,
  isOpen,
  onClose,
  onComplete,
}: QuizStudyModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];

  // Initialize state
  useEffect(() => {
    if (isOpen && quiz) {
      setCurrentIndex(0);
      setUserAnswers(new Array(quiz.questions.length).fill(''));
      setIsFinished(false);
      setShowExplanation(false);
      setTimeLeft(quiz.timeLimit || quiz.questions.length * 60);
    }
  }, [isOpen, quiz]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isFinished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isFinished, timeLeft]);

  if (!isOpen || !quiz || totalQuestions === 0) return null;

  const handleSelectOption = (option: string) => {
    if (isFinished) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = option;
    setUserAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    setShowExplanation(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.a) {
        correctCount += 1;
      }
    });
    const percent = Math.round((correctCount / totalQuestions) * 100);

    if (percent >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    if (onComplete) {
      onComplete(userAnswers, percent);
    }
  };

  // Calculate score
  let correctCount = 0;
  let wrongCount = 0;
  let emptyCount = 0;
  questions.forEach((q, idx) => {
    const ans = userAnswers[idx];
    if (!ans) {
      emptyCount += 1;
    } else if (ans === q.a) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }
  });
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3 md:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade">
      <div className="bg-white border border-slate-300 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Deskio Odak Testi
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-950 truncate mt-0.5">
                {quiz.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Countdown Badge */}
            {!isFinished && (
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-extrabold border',
                timeLeft < 60
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-white border-slate-300 text-slate-900'
              )}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
              title="Testi Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!isFinished && (
          <div className="w-full bg-slate-100 h-2 shrink-0 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-r-full"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 touch-scroll">
          {!isFinished ? (
            /* Active Question Card */
            <div className="space-y-6 animate-fade">
              {/* Question Meta & Number */}
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold pb-2 border-b border-slate-100">
                <span className="text-blue-700">
                  Soru {currentIndex + 1} / {totalQuestions}
                </span>
                <span>{quiz.folder || 'Kazanım Testi'}</span>
              </div>

              {/* High Contrast Question Text */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-2 shadow-2xs">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  SORU METNİ:
                </div>
                <p className="font-heading font-extrabold text-base sm:text-lg text-slate-950 leading-relaxed">
                  {currentQ.q}
                </p>
              </div>

              {/* 4 Options Grid (Single col on mobile, 2 col on tablet+) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {(currentQ.options || currentQ.o || []).map((opt, idx) => {
                  const isSelected = userAnswers[currentIndex] === opt;
                  const isCorrect = opt === currentQ.a;
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D

                  let buttonStyle = 'bg-slate-50 hover:bg-white border-slate-300 text-slate-950 hover:border-blue-400 font-semibold';
                  if (isSelected) {
                    buttonStyle = isCorrect
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                      : 'bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-xs';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={cn(
                        'p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 min-h-[52px] active:scale-[0.98]',
                        buttonStyle
                      )}
                    >
                      <span
                        className={cn(
                          'w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5 border shadow-2xs',
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-rose-600 border-rose-600 text-white'
                            : 'bg-white border-slate-300 text-slate-800'
                        )}
                      >
                        {letter}
                      </span>
                      <span className="text-sm sm:text-[15px] leading-relaxed pt-0.5 break-words font-medium">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Hint if selected */}
              {userAnswers[currentIndex] && (
                <div className={cn(
                  'p-4 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed animate-fade space-y-1',
                  userAnswers[currentIndex] === currentQ.a
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                )}>
                  <div className="font-bold flex items-center gap-1.5">
                    {userAnswers[currentIndex] === currentQ.a ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Harika! Doğru Cevap: {currentQ.a}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Yanlış! Doğru Cevap: {currentQ.a}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="p-4 sm:p-6 text-center space-y-6 animate-fade">
              <div className="w-16 h-16 rounded-3xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-2xl text-slate-950">
                  Test Tamamlandı!
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  Performans ve başarı analiziniz aşağıda özetlenmiştir.
                </p>
              </div>

              {/* Score Metric Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-700">DOĞRU</div>
                  <div className="font-heading font-extrabold text-2xl text-emerald-700">
                    {correctCount}
                  </div>
                </div>
                <div className="space-y-1 border-x border-slate-200">
                  <div className="text-xs font-bold text-slate-700">YANLIŞ</div>
                  <div className="font-heading font-extrabold text-2xl text-rose-700">
                    {wrongCount}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-700">BAŞARI</div>
                  <div className="font-heading font-extrabold text-2xl text-blue-700">
                    %{scorePercent}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-2 text-left pt-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Soru Detayları:
                </span>
                <div className="space-y-2">
                  {questions.map((q, idx) => {
                    const ans = userAnswers[idx];
                    const isRight = ans === q.a;
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-3.5 rounded-xl border text-xs sm:text-sm space-y-1',
                          isRight
                            ? 'bg-emerald-50/60 border-emerald-300 text-slate-950'
                            : 'bg-rose-50/60 border-rose-300 text-slate-950'
                        )}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Soru {idx + 1}: {q.q}</span>
                          <span className={isRight ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                            {isRight ? '✓ Doğru' : '✗ Yanlış'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700">
                          <span>Cevabınız: <b className="text-slate-950">{ans || '(Boş)'}</b></span>
                          {!isRight && <span className="ml-3 text-emerald-800 font-bold">Doğru: {q.a}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          {!isFinished ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 min-h-[44px] active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Önceki</span>
              </button>

              <div className="text-xs font-mono font-bold text-slate-700">
                {currentIndex + 1} / {totalQuestions}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-sm shadow-blue-600/25 transition-all cursor-pointer min-h-[44px] active:scale-95"
              >
                <span>{currentIndex === totalQuestions - 1 ? 'Testi Bitir' : 'Sonraki Soru'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-all cursor-pointer shadow-md min-h-[44px] active:scale-95"
            >
              Tamamla ve Kapat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
