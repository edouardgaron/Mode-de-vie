import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(_req: NextRequest) {
  return new ImageResponse(
    (
      <div style={{ width: 512, height: 512, background: '#0a0a0a', borderRadius: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#22c55e', fontSize: 300, fontWeight: 800, fontFamily: 'system-ui', lineHeight: 1 }}>M</div>
        <div style={{ color: '#4ade80', fontSize: 50, fontWeight: 600, fontFamily: 'system-ui', letterSpacing: 8 }}>MODE</div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
