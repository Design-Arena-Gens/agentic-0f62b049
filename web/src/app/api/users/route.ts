import { NextResponse } from 'next/server';
import { registerReader } from '@/lib/mutations';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 },
      );
    }

    const readerId = await registerReader(name);
    return NextResponse.json(
      {
        readerId,
        name,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to register reader' },
      { status: 500 },
    );
  }
}
