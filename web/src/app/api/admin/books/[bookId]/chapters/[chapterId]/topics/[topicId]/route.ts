import { NextResponse } from 'next/server';
import { assertAdminFromRequest } from '@/lib/admin';
import { deleteTopic, updateTopic } from '@/lib/mutations';

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ bookId: string; chapterId: string; topicId: string }>;
  },
): Promise<Response> {
  try {
    assertAdminFromRequest(request.headers);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { bookId, chapterId, topicId } = await context.params;

  try {
    const body = await request.json();
    await updateTopic({
      bookId,
      chapterId,
      topicId,
      title: typeof body?.title === 'string' ? body.title.trim() : undefined,
      content:
        typeof body?.content === 'string'
          ? body.content.trim()
          : undefined,
    });

    return NextResponse.json({ message: 'Topic updated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update topic' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ bookId: string; chapterId: string; topicId: string }>;
  },
): Promise<Response> {
  try {
    assertAdminFromRequest(request.headers);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { bookId, chapterId, topicId } = await context.params;

  try {
    await deleteTopic({ bookId, chapterId, topicId });
    return NextResponse.json({ message: 'Topic deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to delete topic' },
      { status: 500 },
    );
  }
}
