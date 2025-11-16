import { NextResponse } from 'next/server';
import { assertAdminFromRequest } from '@/lib/admin';
import { createChapter } from '@/lib/mutations';

export async function POST(
  request: Request,
  context: { params: Promise<{ bookId: string }> },
): Promise<Response> {
  try {
    assertAdminFromRequest(request.headers);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { bookId } = await context.params;

  try {
    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json(
        { message: 'Chapter title is required' },
        { status: 400 },
      );
    }

    const chapterId = await createChapter({
      bookId,
      title,
      synopsis:
        typeof body?.synopsis === 'string'
          ? body.synopsis.trim()
          : undefined,
    });

    return NextResponse.json({
      message: 'Chapter created',
      id: chapterId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to create chapter' },
      { status: 500 },
    );
  }
}
