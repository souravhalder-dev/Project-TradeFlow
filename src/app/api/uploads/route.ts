import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { uploadFile } from '@/lib/storage/object-storage';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as any) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Restrict file size (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds maximum 10MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadFile(buffer, file.name, file.type, folder);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
