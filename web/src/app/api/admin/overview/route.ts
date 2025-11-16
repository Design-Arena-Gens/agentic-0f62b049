import { NextResponse } from 'next/server';
import { assertAdminFromRequest } from '@/lib/admin';
import { getBooks, getReaders, getSiteSettings } from '@/lib/data';

export async function GET(request: Request): Promise<Response> {
  try {
    assertAdminFromRequest(request.headers);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [settings, books, readers] = await Promise.all([
      getSiteSettings(),
      getBooks(),
      getReaders(),
    ]);

    return NextResponse.json({
      settings,
      books,
      readers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to load admin data' },
      { status: 500 },
    );
  }
}
