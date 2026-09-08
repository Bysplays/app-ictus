import React, { useState } from 'react';
import { Brain, Settings, Stethoscope, Volume2, VolumeX } from 'lucide-react';
import type { UserProfile } from '../types';
import { soundService } from '../services/soundService';

interface HeaderProps {
  profile: UserProfile;
  sessionMinutes: number;
  activeView: 'dashboard' | 'therapist' | 'game';
  onNavigate: (view: 'dashboard' | 'therapist') => void;
  onOpenAccessibility: () => void;
  onOpenFatigueAlert: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeView,
  onNavigate,
  onOpenAccessibility,
}) => {
  const [soundActive, setSoundActive] = useState(profile.settings.soundEffects);

  const toggleSound = () => {
    const nextState = !soundActive;
    setSoundActive(nextState);
    soundService.setSoundEnabled(nextState);
    if (nextState) {
      soundService.playTap();
    }
  };

  return (
    <header className="main-header">
      <div className="header-left" onClick={() => onNavigate('dashboard')} role="button" tabIndex={0}>
        <div className="header-logo-icon">
          <Brain size={34} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="header-title">NeuroIA</h1>
          <p className="header-subtitle">Rehabilitación y Neuroentrenamiento</p>
        </div>
      </div>

      <div className="header-right">
        {/* Botón Panel del Terapeuta */}
        <button
          className={`header-btn ${activeView === 'therapist' ? 'header-btn-active' : ''}`}
          onClick={() => {
            soundService.playTap();
            onNavigate(activeView === 'therapist' ? 'dashboard' : 'therapist');
          }}
          aria-label="Panel del Terapeuta"
          title="Panel clínico para terapeuta y seguimiento"
        >
          <Stethoscope size={24} />
          <span className="btn-label">{activeView === 'therapist' ? 'Volver a Ejercicios' : 'Panel Terapeuta'}</span>
        </button>

        {/* Botón de Sonido */}
        <button
          className="header-icon-btn"
          onClick={toggleSound}
          aria-label={soundActive ? 'Silenciar sonidos' : 'Activar sonidos'}
          title={soundActive ? 'Silenciar sonidos' : 'Activar sonidos'}
        >
          {soundActive ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>

        {/* Botón de Accesibilidad */}
        <button
          className="header-icon-btn header-icon-accessibility"
          onClick={() => {
            soundService.playTap();
            onOpenAccessibility();
          }}
          aria-label="Ajustes de accesibilidad"
          title="Ajustar tamaño de letra, contraste y mano hábil"
        >
          <Settings size={24} />
        </button>
      </div>
    </header>
  );
};
