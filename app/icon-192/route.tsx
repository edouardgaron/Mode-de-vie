import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(_req: NextRequest) {
  return new ImageResponse(
    (
      <div style={{ width: 192, height: 192, background: '#0a0a0a', borderRadius: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        <div style={{ color: '#22c55e', fontSize: 120, fontWeight: 800, fontFamily: 'system-ui', lineHeight: 1 }}>M</div>
        <div style={{ color: '#4ade80', fontSize: 18, fontWeight: 600, fontFamily: 'system-ui', letterSpacing: 2 }}>MODE</div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
