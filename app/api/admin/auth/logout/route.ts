import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminSession } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  try {
    await deleteAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
