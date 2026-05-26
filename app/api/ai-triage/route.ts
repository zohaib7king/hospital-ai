import { NextResponse } from 'next/server';
import { runAITriage } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chief_complaint, symptoms } = body;

    if (!chief_complaint) {
      return NextResponse.json({ error: 'Chief complaint is required' }, { status: 400 });
    }

    const assessment = await runAITriage({
      chief_complaint,
      symptoms: symptoms || []
    });

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('AI Triage API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
