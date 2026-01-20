import { NextRequest, NextResponse } from 'next/server'

/**
 * NOTE: For development, we're calling Firestore directly from the client.
 * For production, set up Firebase Admin SDK here to verify tokens and write logs server-side.
 * 
 * These routes are currently pass-through; actual CRUD happens in LogsContext (client-side).
 * This file is ready for enhancement with Firebase Admin when you add backend auth.
 */

export async function GET(req: NextRequest) {
  // TODO: Implement server-side log fetching with admin SDK
  return NextResponse.json({ message: 'Use client-side context for now' })
}

export async function POST(req: NextRequest) {
  // TODO: Implement server-side log creation with admin SDK
  return NextResponse.json({ message: 'Use client-side context for now' })
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  // TODO: Implement server-side log deletion with admin SDK
  return NextResponse.json({ message: 'Use client-side context for now' })
}
