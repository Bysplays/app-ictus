import type { UserProfile, ExerciseResult, AccessibilitySettings, CognitiveDomain, TherapistNote } from '../types';

const STORAGE_KEY = 'neuroactiva_profile_v5';
const HISTORY_KEY = 'neuroactiva_history_v5';

export const defaultSettings: AccessibilitySettings = {
  fontSize: 'large',
  contrast: 'standard',
  handDominance: 'center',
  speechEnabled: true,
  speechRate: 0.88,
  soundEffects: true,
  leftSideAnchor: true,
  hapticTouchFeedback: true,
};

const initialDomainProgress = {
  attention: { level: 1, totalCompleted: 0, avgAccuracy: 0, history: [] },
  language: { level: 1, totalCompleted: 0, avgAccuracy: 0, history: [] },
  memory: { level: 1, totalCompleted: 0, avgAccuracy: 0, history: [] },
  executive: { level: 1, totalCompleted: 0, avgAccuracy: 0, history: [] },
  motor: { level: 1, totalCompleted: 0, avgAccuracy: 0, history: [] },
};

const initialTherapistNotes: TherapistNote[] = [];

export const getInitialProfile = (): UserProfile => {
  const today = new Date().toISOString().split('T')[0];
  return {
    name: 'Diego',
    strokeDate: '2026-04-12',
    affectedSide: 'derecha',
    streakDays: 0,
    lastActiveDate: today,
    totalMinutes: 0,
    totalSessions: 0,
    totalScore: 0,
    domainProgress: JSON.parse(JSON.stringify(initialDomainProgress)),
    dailyPlanCompletedToday: false,
    settings: { ...defaultSettings },
    therapistNotes: initialTherapistNotes,
    prescribedDomains: [],
    therapistGuidanceNote: ''
  };
};

export class StorageService {
  public static getProfile(): UserProfile {
    if (typeof window === 'undefined') return getInitialProfile();
    try {
      // Limpiar versiones obsoletas de prueba para garantizar inicio limpio desde 0
      ['v1', 'v2', 'v3', 'v4'].forEach(v => {
        localStorage.removeItem(`neuroactiva_profile_${v}`);
        localStorage.removeItem(`neuroactiva_history_${v}`);
      });

      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const initial = getInitialProfile();
        this.saveProfile(initial);
        return initial;
      }
      const parsed: UserProfile = JSON.parse(data);
      if (!parsed.prescribedDomains) {
        parsed.prescribedDomains = parsed.prescribedDomain ? [parsed.prescribedDomain] : [];
      }
      if (typeof parsed.totalScore !== 'number') {
        parsed.totalScore = 0;
      }

      // Sanear valores históricos o desbordados que pudieran exceder el 100% de precisión
      let needsSave = false;
      if (parsed.domainProgress) {
        (Object.keys(parsed.domainProgress) as (keyof typeof parsed.domainProgress)[]).forEach(domain => {
          const d = parsed.domainProgress[domain];
          if (d) {
            if (d.avgAccuracy > 100) {
              d.avgAccuracy = 100;
              needsSave = true;
            }
            if (d.history) {
              d.history.forEach(h => {
                if (h.accuracy > 100) {
                  h.accuracy = 100;
                  needsSave = true;
                }
              });
            }
          }
        });
      }
      if (needsSave) {
        this.saveProfile(parsed);
      }

      this.checkDailyStreak(parsed);
      return parsed;
    } catch {
      return getInitialProfile();
    }
  }

  public static saveProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Silencioso
    }
  }

  private static checkDailyStreak(profile: UserProfile): void {
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate === today) return;

    const lastDate = new Date(profile.lastActiveDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      profile.streakDays += 1;
    } else if (diffDays > 1) {
      profile.streakDays = 1;
    }

    profile.lastActiveDate = today;
    profile.dailyPlanCompletedToday = false;
    this.saveProfile(profile);
  }

  public static updateSettings(settings: Partial<AccessibilitySettings>): UserProfile {
    const profile = this.getProfile();
    profile.settings = { ...profile.settings, ...settings };
    this.saveProfile(profile);
    return profile;
  }

  public static addTherapistNote(note: Omit<TherapistNote, 'id'>): UserProfile {
    const profile = this.getProfile();
    const newNote: TherapistNote = {
      ...note,
      id: 'note-' + Date.now()
    };
    profile.therapistNotes.unshift(newNote);
    if (note.priorityDomain && !profile.prescribedDomains.includes(note.priorityDomain)) {
      profile.prescribedDomains.push(note.priorityDomain);
    }
    this.saveProfile(profile);
    return profile;
  }

  public static setPrescribedGuidance(domains: CognitiveDomain[], guidanceText: string): UserProfile {
    const profile = this.getProfile();
    profile.prescribedDomains = domains;
    profile.therapistGuidanceNote = guidanceText;
    this.saveProfile(profile);
    return profile;
  }

  public static addExerciseResult(result: ExerciseResult): UserProfile {
    const profile = this.getProfile();
    profile.totalSessions += 1;
    profile.totalMinutes += Math.round(result.durationSeconds / 60) || 1;
    profile.totalScore = (profile.totalScore || 0) + result.score;
    if (profile.streakDays === 0) {
      profile.streakDays = 1;
    }

    const domainKey = result.domain;
    const currentDomain = profile.domainProgress[domainKey] || {
      level: 1,
      totalCompleted: 0,
      avgAccuracy: 0,
      history: [],
    };

    const newTotal = currentDomain.totalCompleted + 1;
    const clampedAccuracy = Math.min(100, Math.max(0, result.accuracy));
    result.accuracy = clampedAccuracy;
    if (typeof result.correctAnswers === 'number' && typeof result.totalQuestions === 'number') {
      result.correctAnswers = Math.min(result.totalQuestions, Math.max(0, result.correctAnswers));
    }
    const newAvg = Math.min(100, Math.round(
      (currentDomain.avgAccuracy * currentDomain.totalCompleted + clampedAccuracy) / newTotal
    ));

    let newLevel = currentDomain.level;
    if (result.accuracy >= 85 && newTotal % 3 === 0 && newLevel < 3) {
      newLevel += 1;
    }

    currentDomain.totalCompleted = newTotal;
    currentDomain.avgAccuracy = newAvg;
    currentDomain.level = newLevel;
    currentDomain.history.push({
      date: result.date,
      accuracy: result.accuracy,
      score: result.score,
    });

    profile.domainProgress[domainKey] = currentDomain;

    this.appendHistory(result);
    this.saveProfile(profile);
    return profile;
  }

  /**
   * Generación Equitativa y Equilibrada del Plan Diario:
   * Garantiza que ningún dominio (como Memoria o Motor) quede rezagado.
   */
  public static generateDailyPlanQueue(profile: UserProfile): CognitiveDomain[] {
    const allDomains: CognitiveDomain[] = ['attention', 'language', 'memory', 'executive', 'motor'];
    const prescribed = profile.prescribedDomains || [];
    const queue: CognitiveDomain[] = [];

    // 1. Si el terapeuta ha pautado áreas prioritarias, se añaden primero
    if (prescribed.length > 0) {
      const shuffledPrescribed = [...prescribed].sort(() => Math.random() - 0.5);
      shuffledPrescribed.forEach(dom => {
        if (queue.length < 3 && !queue.includes(dom)) {
          queue.push(dom);
        }
      });
    }

    // 2. Para los huecos restantes (o si no hay prescripción), seleccionamos
    // los dominios que MENOS veces se han jugado hasta ahora para asegurar EQUIDAD TOTAL.
    if (queue.length < 3) {
      const candidates = allDomains.filter(d => !queue.includes(d));

      // Ordenar de menor a mayor cantidad de sesiones completadas (desempate aleatorio)
      candidates.sort((a, b) => {
        const countA = profile.domainProgress[a]?.totalCompleted || 0;
        const countB = profile.domainProgress[b]?.totalCompleted || 0;
        if (countA !== countB) return countA - countB;
        return Math.random() - 0.5;
      });

      while (queue.length < 3 && candidates.length > 0) {
        queue.push(candidates.shift()!);
      }
    }

    // Barajar ligeramente el orden de presentación para que no sea predecible
    return queue.sort(() => Math.random() - 0.5);
  }

  public static getHistory(): ExerciseResult[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) {
        const history: ExerciseResult[] = JSON.parse(data);
        return history.map(h => ({
          ...h,
          accuracy: Math.min(100, Math.max(0, h.accuracy)),
          correctAnswers: typeof h.correctAnswers === 'number' && typeof h.totalQuestions === 'number'
            ? Math.min(h.totalQuestions, Math.max(0, h.correctAnswers))
            : h.correctAnswers,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  private static appendHistory(result: ExerciseResult): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      history.unshift(result);
      if (history.length > 60) history.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Silencioso
    }
  }

  public static resetProgress(): UserProfile {
    const initial = getInitialProfile();
    this.saveProfile(initial);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_KEY);
    }
    return initial;
  }
}
