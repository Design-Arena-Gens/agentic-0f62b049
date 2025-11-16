import { NextResponse } from 'next/server';
import { assertAdminFromRequest } from '@/lib/admin';
import { createTopic } from '@/lib/mutations';

export async function POST(
  request: Request,
  context: { params: Promise<{ bookId: string; chapterId: string }> },
): Promise<Response> {
  try {
    assertAdminFromRequest(request.headers);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { bookId, chapterId } = await context.params;

  try {
    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const content =
      typeof body?.content === 'string' ? body.content.trim() : '';

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Topic title and content are required' },
        { status: 400 },
      );
    }

    const topicId = await createTopic({
      bookId,
      chapterId,
      title,
      content,
    });

    return NextResponse.json({ message: 'Topic created', id: topicId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to create topic' },
      { status: 500 },
    );
  }
}
