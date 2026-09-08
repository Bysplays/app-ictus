import React, { useState, useEffect, useRef } from 'react';
import { Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { ExerciseWrapper } from '../components/ExerciseWrapper';
import type { ExerciseResult, UserProfile, MistakeDetail } from '../types';
import { soundService } from '../services/soundService';

interface PlanProgress {
  current: number;
  total: number;
  isLast: boolean;
}

interface AttentionGoNoGoGameProps {
  profile: UserProfile;
  onBack: () => void;
  onSaveResult: (result: ExerciseResult) => void;
  planProgress?: PlanProgress | null;
  onNextPlanExercise?: () => void;
}

interface Trial {
  type: 'go' | 'nogo';
  emoji: string;
  label: string;
  subLabel: string;
  bgClass: string;
}

const TRIALS_SEQUENCE: Trial[] = [
  { type: 'go', emoji: '🟢', label: '¡TOCA!', subLabel: 'Luz Verde', bgClass: 'trial-go' },
  { type: 'go', emoji: '🟢', label: '¡TOCA!', subLabel: 'Luz Verde', bgClass: 'trial-go' },
  { type: 'nogo', emoji: '🛑', label: '¡DETENTE!', subLabel: 'Señal de Alto (No toques)', bgClass: 'trial-nogo' },
  { type: 'go', emoji: '🟢', label: '¡TOCA!', subLabel: 'Luz Verde', bgClass: 'trial-go' },
  { type: 'go', emoji: '🟢', label: '¡TOCA!', subLabel: 'Luz Verde', bgClass: 'trial-go' },
  { type: 'nogo', emoji: '🛑', label: '¡DETENTE!', subLabel: 'Señal de Alto (No toques)', bgClass: 'trial-nogo' },
  { type: 'go', emoji: '🟢', label: '¡TOCA!', subLabel: 'Luz Verde', bgClass: 'trial-go' },
  { type: 'nogo', emoji: '🛑', label: '¡DETENTE!', subLabel: 'Señal de Alto (No toques)', bgClass: 'trial-nogo' },
];

export const AttentionGoNoGoGame: React.FC<AttentionGoNoGoGameProps> = ({
  onBack,
  onSaveResult,
  planProgress,
  onNextPlanExercise,
}) => {
  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const [isPlayingTrial, setIsPlayingTrial] = useState(false);
  const [userResponded, setUserResponded] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'mistake' | 'neutral'; text: string } | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [mistakesList, setMistakesList] = useState<MistakeDetail[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);

  const timerRef = useRef<number | null>(null);

  const initGame = () => {
    setCurrentTrialIdx(0);
    setIsPlayingTrial(true);
    setUserResponded(false);
    setFeedback(null);
    setCorrectCount(0);
    setMistakesList([]);
    setIsCompleted(false);
    setResult(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Manejo de cada estímulo con ventana de tiempo pausada y accesible (2.6 segundos)
  useEffect(() => {
    if (!isPlayingTrial || isCompleted) return;

    setUserResponded(false);
    setFeedback(null);
    const currentTrial = TRIALS_SEQUENCE[currentTrialIdx];

    // Locución breve
    if (currentTrial.type === 'go') {
      soundService.speak('Toca');
    } else {
      soundService.speak('Detente');
    }

    timerRef.current = window.setTimeout(() => {
      // Fin del tiempo del estímulo actual
      evaluateTrialEnd();
    }, 2600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentTrialIdx, isPlayingTrial, isCompleted]);

  const handleUserTap = () => {
    if (userResponded || !isPlayingTrial || isCompleted) return;

    setUserResponded(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    const currentTrial = TRIALS_SEQUENCE[currentTrialIdx];

    if (currentTrial.type === 'go') {
      soundService.playSuccess();
      setFeedback({ type: 'success', text: '¡Excelente! Respuesta rápida.' });
      setCorrectCount(prev => prev + 1);
    } else {
      // Falsa alarma en No-Go
      soundService.playGentlePrompt();
      setFeedback({ type: 'mistake', text: 'Era señal de alto (No debías tocar).' });
      setMistakesList(prev => [
        ...prev,
        {
          id: 'nogo-' + Date.now(),
          item: `Ronda ${currentTrialIdx + 1} (${currentTrial.label})`,
          userAction: 'Pulsaste la pantalla',
          correctSolution: 'Esperar sin tocar ante la señal de alto',
          explanation: 'El control inhibitorio mejora frenando el impulso motor antes de pulsar.',
        },
      ]);
    }

    // Pausa breve para mostrar el feedback y avanzar al siguiente
    setTimeout(() => {
      advanceNextTrial();
    }, 900);
  };

  const evaluateTrialEnd = () => {
    const currentTrial = TRIALS_SEQUENCE[currentTrialIdx];

    if (currentTrial.type === 'nogo') {
      // Correcto por inhibir
      soundService.playSuccess();
      setFeedback({ type: 'success', text: '¡Muy bien! Frenaste a tiempo.' });
      setCorrectCount(prev => prev + 1);
    } else {
      // Omisión en Go
      soundService.playGentlePrompt();
      setFeedback({ type: 'mistake', text: 'Se agotó el tiempo para tocar.' });
      setMistakesList(prev => [
        ...prev,
        {
          id: 'go-miss-' + Date.now(),
          item: `Ronda ${currentTrialIdx + 1} (${currentTrial.label})`,
          userAction: 'No se pulsó a tiempo',
          correctSolution: 'Tocar cuando la luz esté verde',
          explanation: 'Reacciona al ver la luz verde para mantener la atención activa.',
        },
      ]);
    }

    setTimeout(() => {
      advanceNextTrial();
    }, 900);
  };

  const advanceNextTrial = () => {
    if (currentTrialIdx + 1 < TRIALS_SEQUENCE.length) {
      setCurrentTrialIdx(prev => prev + 1);
    } else {
      // Fin del juego
      setIsPlayingTrial(false);
      const elapsedSeconds = Math.max(15, Math.round((Date.now() - startTime) / 1000));
      const total = TRIALS_SEQUENCE.length;
      const finalCorrect = Math.min(total, correctCount);
      const accuracy = Math.min(100, Math.round((finalCorrect / total) * 100));

      const gameResult: ExerciseResult = {
        id: 'res-' + Date.now(),
        exerciseId: 'attention-gonogo',
        domain: 'attention',
        date: new Date().toISOString().split('T')[0],
        durationSeconds: elapsedSeconds,
        accuracy,
        score: finalCorrect * 100,
        correctAnswers: finalCorrect,
        totalQuestions: total,
        feedbackMessage:
          accuracy >= 80
            ? '¡Gran control inhibitorio y foco! Tu atención sostenida ha respondido de forma ágil y precisa.'
            : '¡Buen entrenamiento de atención! Aprender a frenar ante estímulos no deseados fortalece el lóbulo frontal.',
        mistakesList,
      };

      setResult(gameResult);
      setIsCompleted(true);
      onSaveResult(gameResult);
    }
  };

  const currentTrial = TRIALS_SEQUENCE[currentTrialIdx];

  return (
    <ExerciseWrapper
      title={`Semáforo de Atención (${currentTrialIdx + 1}/${TRIALS_SEQUENCE.length})`}
      domain="attention"
      instructionText="Toca la pantalla únicamente cuando veas la Luz Verde. Si ves la Señal de Alto, ¡no toques!"
      hideBadges={true}
      hideInstructionBanner={true}
      onBack={onBack}
      isCompleted={isCompleted}
      result={result}
      onRestart={initGame}
      planProgress={planProgress}
      onNextPlanExercise={onNextPlanExercise}
    >
      <div className="gonogo-game-container">
        <div className="gonogo-card">
          {/* Estímulo Central */}
          <div
            className={`gonogo-target-display ${currentTrial?.bgClass || ''} ${userResponded ? 'target-reacted' : ''}`}
            onClick={handleUserTap}
            role="button"
            tabIndex={0}
          >
            <span className="gonogo-emoji">{currentTrial?.emoji}</span>
            <h2 className="gonogo-label">{currentTrial?.label}</h2>
            <p className="gonogo-sublabel">{currentTrial?.subLabel}</p>

            {feedback && (
              <div className={`gonogo-feedback-badge feedback-${feedback.type} animate-fade-in`}>
                {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                <span>{feedback.text}</span>
              </div>
            )}
          </div>

          {/* Botón táctil grande alternativo para accesibilidad motora */}
          <div className="gonogo-action-zone">
            <button
              className="touch-btn touch-btn-primary touch-btn-large gonogo-press-btn"
              onClick={handleUserTap}
              disabled={userResponded || isCompleted}
            >
              <Zap size={28} />
              <span>Pulsar Aquí (Solo con Luz Verde)</span>
            </button>
          </div>
        </div>
      </div>
    </ExerciseWrapper>
  );
};
