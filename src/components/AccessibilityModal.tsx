import React from 'react';
import { X, Type, Eye, Hand, Volume2, ShieldCheck, Check } from 'lucide-react';
import type { AccessibilitySettings } from '../types';
import { soundService } from '../services/soundService';

interface AccessibilityModalProps {
  isOpen: boolean;
  settings: AccessibilitySettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleSpeechToggle = (enabled: boolean) => {
    soundService.playTap();
    onUpdateSettings({ speechEnabled: enabled });
    if (enabled) {
      soundService.speak('Lectura por voz activada. Te acompañaré durante los ejercicios.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck size={28} className="modal-icon" />
            <div>
              <h2 className="modal-title">Ajustes de Accesibilidad</h2>
              <p className="modal-subtitle">Adaptado a tus necesidades físicas y visuales</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar ventana">
            <X size={28} />
          </button>
        </div>

        <div className="modal-body">
          <section className="setting-section">
            <div className="setting-label-row">
              <Type size={24} />
              <div>
                <h3 className="setting-title">Tamaño de Letra</h3>
                <p className="setting-desc">Aumenta el tamaño para leer con total comodidad</p>
              </div>
            </div>
            <div className="options-grid">
              {(['normal', 'large', 'xlarge'] as const).map(size => (
                <button
                  key={size}
                  className={`option-btn ${settings.fontSize === size ? 'option-btn-selected' : ''}`}
                  onClick={() => {
                    soundService.playTap();
                    onUpdateSettings({ fontSize: size });
                  }}
                >
                  {settings.fontSize === size && <Check size={20} className="check-icon" />}
                  <span>{size === 'normal' ? 'Normal (100%)' : size === 'large' ? 'Grande (120%)' : 'Extra Grande (140%)'}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="setting-section">
            <div className="setting-label-row">
              <Eye size={24} />
              <div>
                <h3 className="setting-title">Modo de Pantalla y Contraste</h3>
                <p className="setting-desc">Optimiza el fondo para evitar deslumbramientos o fatiga visual</p>
              </div>
            </div>
            <div className="options-grid">
              {(['standard', 'high-contrast', 'soft-dark'] as const).map(mode => (
                <button
                  key={mode}
                  className={`option-btn ${settings.contrast === mode ? 'option-btn-selected' : ''}`}
                  onClick={() => {
                    soundService.playTap();
                    onUpdateSettings({ contrast: mode });
                  }}
                >
                  {settings.contrast === mode && <Check size={20} className="check-icon" />}
                  <span>{mode === 'standard' ? 'Claridad Suave' : mode === 'high-contrast' ? 'Alto Contraste' : 'Modo Noche'}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="setting-section">
            <div className="setting-label-row">
              <Hand size={24} />
              <div>
                <h3 className="setting-title">Mano de Manejo en Tablet</h3>
                <p className="setting-desc">Coloca los botones principales al alcance de la mano que estés utilizando</p>
              </div>
            </div>
            <div className="options-grid">
              {(['left', 'center', 'right'] as const).map(hand => (
                <button
                  key={hand}
                  className={`option-btn ${settings.handDominance === hand ? 'option-btn-selected' : ''}`}
                  onClick={() => {
                    soundService.playTap();
                    onUpdateSettings({ handDominance: hand });
                  }}
                >
                  {settings.handDominance === hand && <Check size={20} className="check-icon" />}
                  <span>{hand === 'left' ? 'Mano Izquierda' : hand === 'right' ? 'Mano Derecha' : 'Ambas Manos'}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="setting-section">
            <div className="setting-label-row">
              <Eye size={24} />
              <div>
                <h3 className="setting-title">Guía Visual de Borde Izquierdo</h3>
                <p className="setting-desc">Muestra una línea guía luminosa a la izquierda para estimular el rastreo visual (heminegligencia)</p>
              </div>
            </div>
            <div className="options-grid">
              <button
                className={`option-btn ${settings.leftSideAnchor ? 'option-btn-selected' : ''}`}
                onClick={() => {
                  soundService.playTap();
                  onUpdateSettings({ leftSideAnchor: !settings.leftSideAnchor });
                }}
              >
                {settings.leftSideAnchor && <Check size={20} className="check-icon" />}
                <span>{settings.leftSideAnchor ? 'Activada (Recomendado post-ictus)' : 'Desactivada'}</span>
              </button>
            </div>
          </section>

          <section className="setting-section">
            <div className="setting-label-row">
              <Volume2 size={24} />
              <div>
                <h3 className="setting-title">Voz de Apoyo y Velocidad</h3>
                <p className="setting-desc">Lee en voz alta las instrucciones y palabras para ayudar en caso de afasia</p>
              </div>
            </div>
            <div className="options-grid">
              <button
                className={`option-btn ${settings.speechEnabled ? 'option-btn-selected' : ''}`}
                onClick={() => handleSpeechToggle(!settings.speechEnabled)}
              >
                {settings.speechEnabled && <Check size={20} className="check-icon" />}
                <span>{settings.speechEnabled ? 'Lectura por Voz: Activa' : 'Lectura por Voz: Silenciada'}</span>
              </button>

              <button
                className={`option-btn ${settings.speechRate < 0.95 ? 'option-btn-selected' : ''}`}
                onClick={() => {
                  soundService.playTap();
                  const newRate = settings.speechRate < 0.95 ? 1.0 : 0.82;
                  soundService.setSpeechRate(newRate);
                  onUpdateSettings({ speechRate: newRate });
                  soundService.speak(newRate < 0.95 ? 'Velocidad de voz pausada y tranquila.' : 'Velocidad de voz normal.');
                }}
              >
                <span>Velocidad: {settings.speechRate < 0.95 ? 'Pausada y Clara (0.8x)' : 'Normal (1.0x)'}</span>
              </button>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button
            className="touch-btn touch-btn-primary touch-btn-large"
            onClick={() => {
              soundService.playSuccess();
              onClose();
            }}
          >
            Listo, Guardar Ajustes
          </button>
        </div>
      </div>
    </div>
  );
};
