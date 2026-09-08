import React, { useState } from 'react';
import {
  Eye,
  MessageSquare,
  Brain,
  ListOrdered,
  Hand,
  Stethoscope,
  Play,
  Calendar,
  Flame,
  Award,
  HelpCircle,
  X,
  Shuffle,
  ArrowLeft
} from 'lucide-react';
import type { UserProfile, CognitiveDomain, ExerciseId } from '../types';
import { soundService } from '../services/soundService';
import { ExerciseSelectionModal } from './ExerciseSelectionModal';

interface DashboardProps {
  profile: UserProfile;
  onSelectDomain: (domain: CognitiveDomain) => void;
  onSelectExercise?: (exerciseId: ExerciseId) => void;
  onStartDailyPlan: () => void;
  onOpenTherapistReport: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  onSelectDomain,
  onSelectExercise,
  onStartDailyPlan,
  onOpenTherapistReport,
}) => {
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showAreaSelection, setShowAreaSelection] = useState(false);
  const [selectedDomainForModal, setSelectedDomainForModal] = useState<CognitiveDomain | null>(null);

  const domainCards = [
    {
      id: 'attention' as CognitiveDomain,
      title: 'Atención y Rastreo Visual',
      subtitle: 'Heminegligencia y Exploración',
      desc: 'Localiza estímulos en toda la pantalla para estimular el barrido de izquierda a derecha.',
      icon: <Eye size={36} />,
      color: 'var(--color-attention)',
      bgColor: 'var(--color-attention-bg)',
      stats: profile.domainProgress.attention,
    },
    {
      id: 'language' as CognitiveDomain,
      title: 'Lenguaje y Vocabulario',
      subtitle: 'Afasia y Anomia',
      desc: 'Recupera palabras y nombres de objetos cotidianos con apoyo fonológico y de voz.',
      icon: <MessageSquare size={36} />,
      color: 'var(--color-language)',
      bgColor: 'var(--color-language-bg)',
      stats: profile.domainProgress.language,
    },
    {
      id: 'memory' as CognitiveDomain,
      title: 'Memoria de Trabajo',
      subtitle: 'Secuencias y Recuerdos',
      desc: 'Retén secuencias visuales paso a paso para reforzar la memoria inmediata.',
      icon: <Brain size={36} />,
      color: 'var(--color-memory)',
      bgColor: 'var(--color-memory-bg)',
      stats: profile.domainProgress.memory,
    },
    {
      id: 'executive' as CognitiveDomain,
      title: 'Funciones Ejecutivas',
      subtitle: 'Vida Diaria y Lógica',
      desc: 'Ordena temporalmente acciones cotidianas (higiene, cocina, seguridad) para tu autonomía.',
      icon: <ListOrdered size={36} />,
      color: 'var(--color-executive)',
      bgColor: 'var(--color-executive-bg)',
      stats: profile.domainProgress.executive,
    },
    {
      id: 'motor' as CognitiveDomain,
      title: 'Coordinación Visomotora',
      subtitle: 'Precisión Táctil y Mano',
      desc: 'Toca dianas en pantalla a tu propio ritmo para reentrenar la motricidad fina.',
      icon: <Hand size={36} />,
      color: 'var(--color-motor)',
      bgColor: 'var(--color-motor-bg)',
      stats: profile.domainProgress.motor,
    },
  ];

  return (
    <div className={`dashboard-container ${showAreaSelection ? 'dashboard-area-selection-active' : ''}`}>
      {/* Banner de Bienvenida y NeuroPuntos (solo visible en vista inicial, oculto al elegir área) */}
      {!showAreaSelection && (
        <section className="welcome-banner card">
          <div className="welcome-content">
            <div className="welcome-greeting">
              <span className="welcome-tag">Hola, {profile.name} 👋</span>
              <h2 className="welcome-title">Bienvenido a tu sesión de NeuroActiva</h2>
            </div>

          {profile.therapistGuidanceNote && (
            <div className="therapist-guidance-pill" onClick={onOpenTherapistReport}>
              <Stethoscope size={22} className="guidance-icon" />
              <div>
                <strong>Indicación del Terapeuta:</strong>
                <p>{profile.therapistGuidanceNote}</p>
              </div>
            </div>
          )}
        </div>

        {/* Métricas clave: Racha, Tiempo y NeuroPuntos */}
        <div className="welcome-stats-box">
          <div
            className="welcome-stat-item stat-interactive"
            onClick={() => {
              soundService.playTap();
              setShowPointsModal(true);
            }}
            title="Haz clic para ver para qué sirven los NeuroPuntos"
          >
            <div className="stat-icon-wrapper points-icon-wrapper">
              <Award size={26} className="points-award-icon" />
            </div>
            <div>
              <div className="stat-header-inline">
                <span className="stat-big text-primary">{profile.totalScore ?? 0}</span>
                <HelpCircle size={15} className="help-icon-subtle" />
              </div>
              <span className="stat-sub">NeuroPuntos</span>
            </div>
          </div>

          <div className="welcome-stat-item">
            <div className="stat-icon-wrapper flame-icon-wrapper">
              <Flame size={26} className="flame-icon" />
            </div>
            <div>
              <span className="stat-big">{profile.streakDays}</span>
              <span className="stat-sub">Días seguidos</span>
            </div>
          </div>

          <div className="welcome-stat-item">
            <div className="stat-icon-wrapper cal-icon-wrapper">
              <Calendar size={26} className="cal-icon" />
            </div>
            <div>
              <span className="stat-big">{profile.totalMinutes}</span>
              <span className="stat-sub">Minutos activos</span>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Botón Central Comenzar Plan del Día / Selector de Áreas */}
      {!showAreaSelection ? (
        <div className="daily-plan-center-wrapper">
          <button
            className="touch-btn touch-btn-primary daily-plan-giant-btn gentle-bounce"
            onClick={() => {
              soundService.playTap();
              setShowAreaSelection(true);
            }}
          >
            <Play size={36} fill="currentColor" />
            <span>Comenzar Plan del Día</span>
          </button>
        </div>
      ) : (
        <section className="area-selection-section card animate-fade-in">
          <div className="section-header-row">
            <div>
              <h3 className="section-title">Elige el Área que deseas entrenar</h3>
              <p className="section-subtitle">Toca la tarjeta del área que prefieras practicar hoy:</p>
            </div>

            <div className="area-header-buttons">
              <button
                className="touch-btn touch-btn-primary"
                onClick={() => {
                  soundService.playSuccess();
                  onStartDailyPlan();
                }}
                title="Sesión guiada que combina 3 ejercicios distintos"
              >
                <Shuffle size={20} />
                <span>Sesión Guiada (3 Ejercicios)</span>
              </button>

              <button
                className="touch-btn touch-btn-secondary"
                onClick={() => {
                  soundService.playTap();
                  setShowAreaSelection(false);
                }}
              >
                <ArrowLeft size={20} />
                <span>Volver</span>
              </button>
            </div>
          </div>

          <div className="domains-grid">
            {domainCards.map(domain => {
              const isPrescribed = profile.prescribedDomains && profile.prescribedDomains.includes(domain.id);
              return (
                <div
                  key={domain.id}
                  className={`card card-interactive domain-card ${isPrescribed ? 'card-prescribed' : ''}`}
                  onClick={() => {
                    soundService.playTap();
                    setSelectedDomainForModal(domain.id);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {isPrescribed && (
                    <div className="prescribed-badge">
                      <Stethoscope size={16} />
                      <span>Prioridad Pautada</span>
                    </div>
                  )}

                  <div className="domain-card-header">
                    <div
                      className="domain-icon-circle"
                      style={{ backgroundColor: domain.bgColor, color: domain.color }}
                    >
                      {domain.icon}
                    </div>
                    <div className="domain-title-group">
                      <h4 className="domain-card-title">{domain.title}</h4>
                      <span className="domain-card-subtitle">{domain.subtitle}</span>
                    </div>
                  </div>

                  <p className="domain-card-desc">{domain.desc}</p>

                  <div className="domain-card-footer">
                    <div className="domain-card-stat">
                      <span className="stat-label">Precisión media</span>
                      <strong className="stat-val">{domain.stats.avgAccuracy || 0}%</strong>
                    </div>

                    <button
                      className="touch-btn touch-btn-primary domain-play-btn"
                      onClick={e => {
                        e.stopPropagation();
                        soundService.playTap();
                        setSelectedDomainForModal(domain.id);
                      }}
                    >
                      <Play size={20} />
                      <span>Practicar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modal para elegir entre los 2 ejercicios del área */}
      {selectedDomainForModal && (
        <ExerciseSelectionModal
          domain={selectedDomainForModal}
          domainTitle={domainCards.find(d => d.id === selectedDomainForModal)?.title || ''}
          domainColor={domainCards.find(d => d.id === selectedDomainForModal)?.color || ''}
          domainBg={domainCards.find(d => d.id === selectedDomainForModal)?.bgColor || ''}
          onSelectExercise={exerciseId => {
            const dom = selectedDomainForModal;
            setSelectedDomainForModal(null);
            if (onSelectExercise) {
              onSelectExercise(exerciseId);
            } else {
              onSelectDomain(dom);
            }
          }}
          onClose={() => setSelectedDomainForModal(null)}
        />
      )}

      {/* Modal explicativo: ¿Para qué sirven los puntos ganados? */}
      {showPointsModal && (
        <div className="modal-backdrop" onClick={() => setShowPointsModal(false)} role="dialog" aria-modal="true">
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Award size={32} className="text-primary" />
                <div>
                  <h2 className="modal-title">¿De qué sirven los NeuroPuntos?</h2>
                  <p className="modal-subtitle">La función clínica y psicológica de tu puntuación</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowPointsModal(false)} aria-label="Cerrar ventana">
                <X size={28} />
              </button>
            </div>

            <div className="modal-body points-modal-body">
              <div className="points-benefit-item">
                <div className="benefit-icon-badge">🧠</div>
                <div>
                  <h4>1. Refuerzo de la Neuroplasticidad Cerebral</h4>
                  <p>
                    Tras un ictus, el cerebro necesita motivación constante para reconectar circuitos neuronales dañados. Los puntos activan la vía dopaminérgica de recompensa positiva, combatiendo la apatía y el desánimo frecuentes en la recuperación.
                  </p>
                </div>
              </div>

              <div className="points-benefit-item">
                <div className="benefit-icon-badge">🛡️</div>
                <div>
                  <h4>2. Gamificación Libre de Estrés (Sin Castigos)</h4>
                  <p>
                    En NeuroActiva <strong>nunca se restan puntos por equivocarse</strong> ni hay "Game Over". Cada intento suma valor porque cada repetición estimula el cerebro. Los puntos premian tu constancia y perseverancia.
                  </p>
                </div>
              </div>

              <div className="points-benefit-item">
                <div className="benefit-icon-badge">🩺</div>
                <div>
                  <h4>3. Indicador Objetivo para el Terapeuta</h4>
                  <p>
                    Para tu terapeuta ocupacional o logopeda, los puntos reflejan la fluidez y velocidad de respuesta sin necesidad de someterte a exámenes invasivos, permitiéndole evaluar tu recuperación semana a semana.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="touch-btn touch-btn-primary touch-btn-large"
                onClick={() => {
                  soundService.playTap();
                  setShowPointsModal(false);
                }}
              >
                Entendido, ¡a seguir sumando!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
