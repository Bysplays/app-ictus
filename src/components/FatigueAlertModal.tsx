import React from 'react';
import { Sparkles, Coffee, HeartPulse, ArrowRight } from 'lucide-react';
import { soundService } from '../services/soundService';

interface FatigueAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTakeBreak: () => void;
}

export const FatigueAlertModal: React.FC<FatigueAlertModalProps> = ({
  isOpen,
  onClose,
  onTakeBreak,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container fatigue-modal" onClick={e => e.stopPropagation()}>
        <div className="fatigue-icon-wrapper">
          <HeartPulse size={48} className="fatigue-heart-icon" />
        </div>

        <h2 className="fatigue-title">Momento de Cuidar tu Energía</h2>
        
        <p className="fatigue-text">
          Llevas una sesión muy productiva. Tras un ictus, el cerebro realiza un esfuerzo intenso para reconectar nuevas neuronas (neuroplasticidad).
        </p>

        <div className="fatigue-tips">
          <div className="fatigue-tip-item">
            <Coffee size={24} />
            <span>Bebe un sorbo de agua para hidratar tus neuronas</span>
          </div>
          <div className="fatigue-tip-item">
            <Sparkles size={24} />
            <span>Mira a lo lejos unos segundos para relajar la vista</span>
          </div>
        </div>

        <div className="fatigue-actions">
          <button
            className="touch-btn touch-btn-primary touch-btn-large"
            onClick={() => {
              soundService.playTap();
              onTakeBreak();
            }}
            title="Iniciar descanso guiado de 5 minutos con temporizador y respiración relajante"
          >
            <Coffee size={24} />
            <span>Iniciar Pausa Guiada de 5 Minutos</span>
          </button>

          <button
            className="touch-btn touch-btn-secondary touch-btn-large"
            onClick={() => {
              soundService.playTap();
              onClose();
            }}
          >
            Me siento bien, continuar un poco más
            <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
