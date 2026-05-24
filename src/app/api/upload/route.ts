import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { app } from '@/lib/firebase/config';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${baseName}_${Date.now()}${ext}`;

    // Try uploading to Firebase Storage first (production cloud-storage)
    const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (firebaseStorageBucket && !firebaseStorageBucket.includes("your-project-id")) {
      try {
        const storage = getStorage(app);
        const storageRef = ref(storage, `uploads/${uniqueName}`);
        
        // uploadBytes works with Uint8Array in Node.js serverless environments
        await uploadBytes(storageRef, new Uint8Array(bytes), {
          contentType: file.type || 'application/octet-stream',
        });
        
        const url = await getDownloadURL(storageRef);
        
        return NextResponse.json({
          success: true,
          url,
          name: file.name,
          size: file.size,
        });
      } catch (fbError: any) {
        console.error('Firebase storage upload failed, trying local fallback:', fbError);
      }
    }

    // Local / Serverless filesystem fallback
    // On Vercel, the only writeable directory is '/tmp'
    const isVercel = process.env.VERCEL === '1';
    const uploadsDir = isVercel 
      ? path.join('/tmp', 'uploads')
      : path.join(process.cwd(), 'public', 'uploads');
      
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    const url = isVercel 
      ? `/uploads/${uniqueName}` // In serverless we return it, but Firebase is the expected production way
      : `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url,
      name: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
