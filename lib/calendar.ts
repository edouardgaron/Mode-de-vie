export interface CalendarEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(event.startDate)}/${fmt(event.endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getTodayAt(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function getCheckinCalendarUrl(): string {
  const start = getTodayAt(7, 0);
  const end = getTodayAt(7, 15);
  return generateGoogleCalendarUrl({
    title: '✅ Check-in Mode de Vie',
    description: 'Compléter le check-in quotidien — habitudes, journal, score du jour',
    startDate: start,
    endDate: end,
  });
}

export function getWorkoutCalendarUrl(): string {
  const start = getTodayAt(6, 0);
  const end = getTodayAt(7, 0);
  return generateGoogleCalendarUrl({
    title: '💪 Entraînement',
    description: "Séance d'entraînement — objectif 3x/semaine",
    startDate: start,
    endDate: end,
  });
}

export function getWalkCalendarUrl(): string {
  const start = getTodayAt(12, 0);
  const end = getTodayAt(12, 45);
  return generateGoogleCalendarUrl({
    title: '🚶 Marche 45 minutes',
    description: 'Marche quotidienne — objectif 5x/semaine',
    startDate: start,
    endDate: end,
  });
}

export function getWeeklyReviewCalendarUrl(): string {
  const next = new Date();
  const day = next.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  next.setDate(next.getDate() + daysUntilSunday);
  next.setHours(19, 0, 0, 0);
  const end = new Date(next);
  end.setHours(19, 45, 0, 0);
  return generateGoogleCalendarUrl({
    title: '📊 Revue hebdomadaire Mode de Vie',
    description: "Faire la revue hebdomadaire — ce qui a marché, ce qui n'a pas marché, priorité de la semaine prochaine",
    startDate: next,
    endDate: end,
  });
}
