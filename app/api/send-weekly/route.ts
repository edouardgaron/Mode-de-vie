import { NextRequest, NextResponse } from 'next/server';
import { buildWeeklySummaryHtml } from '@/lib/email';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = process.env.USER_EMAIL;
  const name = process.env.USER_NAME || 'Édouard';

  if (!email || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Missing config' }, { status: 503 });
  }

  const html = buildWeeklySummaryHtml({
    name,
    weekScore: 0,
    habitsCompleted: 0,
    totalHabits: 11,
    streak: 0,
    topWin: '',
  });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Mode de Vie <onboarding@resend.dev>',
      to: [email],
      subject: '📊 Revue hebdomadaire — Mode de Vie',
      html,
    }),
  });

  return NextResponse.json({ success: res.ok });
}
