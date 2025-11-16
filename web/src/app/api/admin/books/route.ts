import { NextResponse } from 'next/server';
import { assertAdminFromRequest } from '@/lib/admin';
import { getBooks } from '@/lib/data';
import { createBook } from '@/lib/mutations';

export async function GET(request: Request): Promise<Response> {
  try {
    assertAdminFromRequest(request.headers);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const books = await getBooks();
    return NextResponse.json({ books });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch books' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertAdminFromRequest(request.headers);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 },
      );
    }

    const bookId = await createBook({
      title,
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

    return NextResponse.json({ message: 'Book created', id: bookId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to create book' },
      { status: 500 },
    );
  }
}
