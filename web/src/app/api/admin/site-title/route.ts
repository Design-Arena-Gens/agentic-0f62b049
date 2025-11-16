import { NextResponse } from 'next/server';
import { assertAdminFromRequest } from '@/lib/admin';
import { updateSiteTitle } from '@/lib/mutations';

export async function PUT(request: Request): Promise<Response> {
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

    await updateSiteTitle(title);
    return NextResponse.json({ message: 'Site title updated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update site title' },
      { status: 500 },
    );
  }
}
