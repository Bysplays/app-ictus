import React, { useState, useEffect, useCallback } from 'react';
import { Coffee, Sparkles, Play, Pause, CheckCircle2, Droplets, Eye, ArrowRight, Volume2 } from 'lucide-react';
import { soundService } from '../services/soundService';

interface RestBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishBreak: () => void;
}

export const RestBreakModal: React.FC<RestBreakModalProps> = ({
  isOpen,
  onClose,
  onFinishBreak,
}) => {
  const TOTAL_SECONDS = 300; // 5 minutos exactos
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(true);
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'exhale'>('inhale');
  const [isCompleted, setIsCompleted] = useState(false);

  // Reiniciar estado cada vez que se abre la ventana
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(TOTAL_SECONDS);
      setIsRunning(true);
      setIsCompleted(false);
      setBreathePhase('inhale');
      soundService.playRelaxingChime?.();
    }
  }, [isOpen]);

  // Manejador de fin de descanso
  const handleTimeFinished = useCallback(() => {
    setIsCompleted(true);
    setIsRunning(false);
    soundService.playSuccess();
    soundService.speak('Descanso de cinco minutos completado. Tu cerebro ha recuperado energía y está listo para continuar.');
  }, []);

  // Temporizador regresivo segundo a segundo
  useEffect(() => {
    if (!isOpen || !isRunning || isCompleted) return;

    if (secondsLeft <= 0) {
      handleTimeFinished();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          handleTimeFinished();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning, secondsLeft, isCompleted, handleTimeFinished]);

  // Ciclo de respiración relajante (4 segundos inhalar, 4 segundos exhalar)
  useEffect(() => {
    if (!isOpen || !isRunning || isCompleted) return;

    const breatheInterval = setInterval(() => {
      setBreathePhase(prev => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 4000);

    return () => clearInterval(breatheInterval);
  }, [isOpen, isRunning, isCompleted]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercent = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;

  const handleTogglePlay = () => {
    soundService.playTap();
    setIsRunning(prev => !prev);
  };

  const handleReadTips = () => {
    soundService.playTap();
    soundService.speak(
      'Pausa de descanso. Uno: Bebe un poco de agua para hidratar tu cerebro. Dos: Desvía la mirada de la pantalla y mira a lo lejos. Tres: Respira profundamente al compás del círculo.'
    );
  };

  const handleFinishEarly = () => {
    soundService.playTap();
    onFinishBreak();
  };

  return (
    <div className="modal-backdrop rest-modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-container rest-modal-container card" onClick={e => e.stopPropagation()}>
        {/* Cabecera del descanso */}
        <div className="rest-modal-header">
          <div className="rest-title-icon-wrap">
            <Coffee size={32} className="text-primary" />
          </div>
          <div>
            <h2 className="rest-modal-title">Pausa Restauradora (5 Minutos)</h2>
            <p className="rest-modal-subtitle">
              El reposo es fundamental en neurorrehabilitación para consolidar la plasticidad cerebral.
            </p>
          </div>
          <button
            className="touch-btn touch-btn-voice-mini"
            onClick={handleReadTips}
            title="Escuchar pautas de relajación en voz alta"
            aria-label="Escuchar pautas de relajación en voz alta"
          >
            <Volume2 size={22} />
          </button>
        </div>

        {/* Zona Central: Círculo de Respiración y Contador de Tiempo */}
        <div className="rest-central-zone">
          {!isCompleted ? (
            <div className="rest-timer-breathe-wrapper">
              <div className={`rest-breathe-ring ${breathePhase}`}>
                <div className="rest-inner-timer-circle">
                  <span className="rest-timer-digits">{formattedTime}</span>
                  <span className="rest-breathe-status">
                    {isRunning
                      ? breathePhase === 'inhale'
                        ? '🌬️ Inhala suavemente...'
                        : '💨 Exhala despacio...'
                      : '⏸️ Pausado'}
                  </span>
                </div>
              </div>

              <div className="rest-progress-bar-wrap" title={`Progreso del descanso: ${Math.round(progressPercent)}%`}>
                <div className="rest-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          ) : (
            <div className="rest-completed-notice card">
              <CheckCircle2 size={64} className="text-green" />
              <h3>¡Pausa de 5 Minutos Completada!</h3>
              <p>
                Tus neurotransmisores y corteza cerebral han tenido tiempo para oxigenarse y reposar.
              </p>
            </div>
          )}
        </div>

        {/* Consejos clínicos activos durante el descanso */}
        <div className="rest-tips-grid">
          <div className="rest-tip-card">
            <div className="rest-tip-icon-box">
              <Droplets size={26} className="text-blue" />
            </div>
            <div>
              <strong>1. Hidrata tu cerebro</strong>
              <p>Beber medio vaso de agua favorece el flujo sanguíneo cerebral y la concentración.</p>
            </div>
          </div>

          <div className="rest-tip-card">
            <div className="rest-tip-icon-box">
              <Eye size={26} className="text-purple" />
            </div>
            <div>
              <strong>2. Relaja la vista</strong>
              <p>Desvía los ojos de la tablet y mira hacia un punto lejano por la ventana.</p>
            </div>
          </div>

          <div className="rest-tip-card">
            <div className="rest-tip-icon-box">
              <Sparkles size={26} className="text-amber" />
            </div>
            <div>
              <strong>3. Suelta hombros y cuello</strong>
              <p>Deja caer los hombros suavemente para liberar la tensión postural o espasticidad.</p>
            </div>
          </div>
        </div>

        {/* Botonera de control táctil */}
        <div className="rest-modal-actions">
          {!isCompleted ? (
            <>
              <button
                className="touch-btn touch-btn-secondary touch-btn-large"
                onClick={handleTogglePlay}
              >
                {isRunning ? <Pause size={22} /> : <Play size={22} />}
                <span>{isRunning ? 'Pausar Reloj' : 'Continuar Reloj'}</span>
              </button>

              <button
                className="touch-btn touch-btn-primary touch-btn-large"
                onClick={handleFinishEarly}
              >
                <span>¡Ya me siento descansado! Continuar</span>
                <ArrowRight size={22} />
              </button>
            </>
          ) : (
            <button
              className="touch-btn touch-btn-success touch-btn-large"
              onClick={handleFinishEarly}
            >
              <CheckCircle2 size={24} />
              <span>Volver a Entrenar con Energía Renovada</span>
            </button>
          )}

          <button
            className="touch-btn touch-btn-tertiary"
            onClick={() => {
              soundService.playTap();
              onClose();
            }}
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  );
};
