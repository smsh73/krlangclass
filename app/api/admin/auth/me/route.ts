import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/admin';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ admin: null }, { status: 200 });
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Get admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
