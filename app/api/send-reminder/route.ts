import { NextRequest, NextResponse } from 'next/server';
import { buildDailyReminderHtml } from '@/lib/email';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = process.env.USER_EMAIL;
  const name = process.env.USER_NAME || 'Édouard';

  if (!email) {
    return NextResponse.json({ error: 'USER_EMAIL not set' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 503 });
  }

  const html = buildDailyReminderHtml(name);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Mode de Vie <onboarding@resend.dev>',
      to: [email],
      subject: `✅ Check-in du jour — ${new Date().toLocaleDateString('fr-CA', { weekday: 'long' })}`,
      html,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }

  return NextResponse.json({ success: true, sentTo: email });
}
