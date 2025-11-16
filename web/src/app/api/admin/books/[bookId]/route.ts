import { NextResponse } from 'next/server';
import { assertAdminFromRequest } from '@/lib/admin';
import { getBookById } from '@/lib/data';
import { deleteBook, updateBook } from '@/lib/mutations';

export async function GET(
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
    const book = await getBookById(bookId);
    if (!book) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch book' },
      { status: 500 },
    );
  }
}

export async function PUT(
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
    await updateBook({
      id: bookId,
      title: typeof body?.title === 'string' ? body.title.trim() : undefined,
      subtitle:
        typeof body?.subtitle === 'string' ? body.subtitle.trim() : undefined,
      description:
        typeof body?.description === 'string'
          ? body.description.trim()
          : undefined,
      accentColor:
        typeof body?.accentColor === 'string'
          ? body.accentColor.trim()
          : undefined,
      coverImage:
        typeof body?.coverImage === 'string'
          ? body.coverImage.trim()
          : undefined,
    });

    return NextResponse.json({ message: 'Book updated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update book' },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
    await deleteBook(bookId);
    return NextResponse.json({ message: 'Book deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to delete book' },
      { status: 500 },
    );
  }
}
