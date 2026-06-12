import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/generate`, {
      method: 'POST'
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch(err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
