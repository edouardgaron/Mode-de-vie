import { DailyCheckin } from '@/types';

export interface ScoreBreakdown {
  health: number; // 0-30
  business: number; // 0-25
  integrity: number; // 0-20
  finance: number; // 0-10
  journal: number; // 0-10
  social: number; // 0-5
  total: number; // 0-100
}

export function calculateDailyScore(checkin: Partial<DailyCheckin>): ScoreBreakdown {
  // Health: 30 points
  let health = 0;
  if (checkin.slept7h) health += 6;
  if (checkin.walked45min) health += 6;
  if (checkin.didWorkout) health += 6;
  if (checkin.drankWater) health += 4;
  if (checkin.reducedVaping) health += 4;
  if (checkin.didHealthAction) health += 4;

  // Business: 25 points
  let business = 0;
  if (checkin.did3Tasks) business += 12;
  if (checkin.avoidedDispersal) business += 8;
  const energyBonus = checkin.energyLevel ? Math.floor((checkin.energyLevel - 5) * 0.5) : 0;
  business += Math.max(0, Math.min(5, energyBonus));

  // Integrity: 20 points
  let integrity = 0;
  if (checkin.toldTruth) integrity += 10;
  if (checkin.integrityScore) integrity += Math.floor(checkin.integrityScore * 1);

  // Finance: 10 points
  let finance = 0;
  if (checkin.didFinanceAction) finance += 10;

  // Journal: 10 points
  let journal = 0;
  if (checkin.avoidedToday && checkin.avoidedToday.length > 10) journal += 3;
  if (checkin.proudOf && checkin.proudOf.length > 10) journal += 4;
  if (checkin.truthToAccept && checkin.truthToAccept.length > 10) journal += 3;

  // Social: 5 points
  let social = 0;
  if (checkin.socialContact) social += 5;

  // Cap each category
  health = Math.min(30, health);
  business = Math.min(25, business);
  integrity = Math.min(20, integrity);
  finance = Math.min(10, finance);
  journal = Math.min(10, journal);
  social = Math.min(5, social);

  const total = health + business + integrity + finance + journal + social;

  return { health, business, integrity, finance, journal, social, total };
}

export function getMotivationalMessage(score: number): string {
  if (score >= 90) return "Exceptionnel. Tu te bâtis en temps réel. Continue.";
  if (score >= 75) return "Solide. Tu montres qui tu deviens. Reste dans le mouvement.";
  if (score >= 60) return "Bonne journée. Il y a de la marge pour aller plus loin demain.";
  if (score >= 45) return "Journée correcte. Identifie ce qui t'a bloqué et ajuste.";
  if (score >= 30) return "Journée difficile. C'est normal. Demain est une nouvelle chance.";
  return "Journée à oublier. Mais tu es encore là. C'est ce qui compte.";
}

export function getWeeklyScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function getStreakCount(checkins: DailyCheckin[]): number {
  if (checkins.length === 0) return 0;
  const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sorted.length; i++) {
    const checkinDate = new Date(sorted[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    const checkinStr = checkinDate.toISOString().slice(0, 10);
    const expectedStr = expectedDate.toISOString().slice(0, 10);

    if (checkinStr === expectedStr && sorted[i].dailyScore >= 40) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
