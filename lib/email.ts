export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function buildDailyReminderHtml(name: string = 'Edouard'): string {
  const today = new Date().toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; background: #0a0a0a; color: #fafafa; padding: 40px; max-width: 600px; margin: 0 auto;">
  <div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 32px;">
    <h1 style="color: #22c55e; margin: 0 0 8px 0; font-size: 28px;">Mode de Vie</h1>
    <p style="color: #888; margin: 0 0 32px 0; font-size: 14px;">${today}</p>

    <h2 style="color: #fafafa; font-size: 20px; margin: 0 0 16px 0;">Bonjour ${name} 👋</h2>
    <p style="color: #aaa; line-height: 1.6; margin: 0 0 24px 0;">
      C'est l'heure de ton check-in quotidien. Quelques minutes maintenant, une journée plus structurée aujourd'hui.
    </p>

    <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
      <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Rappels du jour</p>
      <ul style="color: #ddd; margin: 0; padding: 0 0 0 20px; line-height: 2;">
        <li>Marcher 45 minutes</li>
        <li>Compléter 3 tâches importantes</li>
        <li>Boire assez d'eau</li>
        <li>Réduire la vape</li>
      </ul>
    </div>

    <a href="${appUrl}/checkin"
       style="display: inline-block; background: #22c55e; color: #000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 16px;">
      Faire mon check-in →
    </a>

    <p style="color: #555; font-size: 12px; margin: 32px 0 0 0;">Mode de Vie — Système Personnel</p>
  </div>
</body>
</html>`;
}

export function buildWeeklySummaryHtml(data: {
  name?: string;
  weekScore: number;
  habitsCompleted: number;
  totalHabits: number;
  streak: number;
  topWin: string;
}): string {
  const weekStr = new Date().toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' });
  const scoreColor = data.weekScore >= 75 ? '#22c55e' : data.weekScore >= 50 ? '#3b82f6' : '#f59e0b';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; background: #0a0a0a; color: #fafafa; padding: 40px; max-width: 600px; margin: 0 auto;">
  <div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 32px;">
    <h1 style="color: #22c55e; margin: 0 0 8px 0; font-size: 28px;">Revue de la semaine</h1>
    <p style="color: #888; margin: 0 0 32px 0; font-size: 14px;">${weekStr}</p>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 0 0 32px 0;">
      <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="color: ${scoreColor}; font-size: 36px; font-weight: 800;">${data.weekScore}</div>
        <div style="color: #888; font-size: 12px;">Score moyen</div>
      </div>
      <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="color: #22c55e; font-size: 36px; font-weight: 800;">${data.streak}</div>
        <div style="color: #888; font-size: 12px;">Jours streak</div>
      </div>
      <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="color: #3b82f6; font-size: 36px; font-weight: 800;">${data.habitsCompleted}/${data.totalHabits}</div>
        <div style="color: #888; font-size: 12px;">Habitudes</div>
      </div>
    </div>

    <a href="${appUrl}/review"
       style="display: inline-block; background: #22c55e; color: #000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 16px;">
      Faire ma revue hebdomadaire →
    </a>

    <p style="color: #555; font-size: 12px; margin: 32px 0 0 0;">Mode de Vie — Système Personnel</p>
  </div>
</body>
</html>`;
}
