import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://ecolytics-api-6905384399.us-central1.run.app/api/v2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // Build the upstream URL by forwarding all other query params
  const upstreamParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      upstreamParams.set(key, value);
    }
  });

  const qs = upstreamParams.toString();
  const upstreamUrl = `${API_BASE}/${endpoint}${qs ? '?' + qs : ''}`;

  try {
    const response = await fetch(upstreamUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream API returned ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';

    // If it's JSON, forward as JSON
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // For tile images or other binary, stream through
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error: any) {
    console.error('Ecolytics proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from upstream API', details: error.message },
      { status: 502 }
    );
  }
}
