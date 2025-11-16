import { NextResponse } from 'next/server';
import { assertAdminFromRequest } from '@/lib/admin';
import { deleteChapter, updateChapter } from '@/lib/mutations';

export async function PUT(
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
    await updateChapter({
      bookId,
      chapterId,
      title: typeof body?.title === 'string' ? body.title.trim() : undefined,
      synopsis:
        typeof body?.synopsis === 'string'
          ? body.synopsis.trim()
          : undefined,
    });

    return NextResponse.json({ message: 'Chapter updated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update chapter' },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
    await deleteChapter({ bookId, chapterId });
    return NextResponse.json({ message: 'Chapter deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to delete chapter' },
      { status: 500 },
    );
  }
}
