import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if it hasn't been initialized yet
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string))
  });
}

export async function GET(request: NextRequest) {
  const soundUrl = request.nextUrl.searchParams.get('soundUrl');
  const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!soundUrl || !idToken) {
    return NextResponse.json({ error: 'Invalid soundUrl or missing token' }, { status: 400 });
  }

  try {
    // Verify the ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    console.log('Authenticated user:', uid);

    const storage = getStorage(app);
    const soundRef = ref(storage, soundUrl);
    const downloadURL = await getDownloadURL(soundRef);

    const response = await fetch(downloadURL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename=sound.mp3',
      },
    });
  } catch (error) {
    console.error('Detailed error in download route:', error);
    return NextResponse.json({ error: 'Failed to download file', details: (error as Error).message }, { status: 500 });
  }
}