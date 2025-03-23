import { NextRequest, NextResponse } from 'next/server';

// Enable streaming responses
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Forward to backend
    const backendUrl = 'http://localhost:8000/api/quantum/gdsfactory/execute';
    console.log(`Forwarding request to backend: ${backendUrl}`);
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log(`Backend response status: ${backendResponse.status}`);
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${errorText}`);
      
      return NextResponse.json(
        { 
          error: 'Backend server error', 
          status: backendResponse.status,
          details: errorText
        },
        { status: backendResponse.status }
      );
    }
    
    // Get the response data as json
    const data = await backendResponse.json();
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GDSFactory API route:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
