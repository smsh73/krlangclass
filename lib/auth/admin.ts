import { cookies } from 'next/headers';
import { prisma } from '../db/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function createAdminSession(adminId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION);

  const cookieStore = await cookies();
  cookieStore.set('admin_session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  // Log admin access
  await prisma.adminAccessLog.create({
    data: {
      adminId,
      action: 'login',
      ipAddress: 'unknown', // Can be enhanced with request IP
    },
  });

  return token;
}

export async function getAdminSession(): Promise<{ adminId: string; token: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session_token')?.value;

  if (!token) {
    return null;
  }

  // For simplicity, we'll store admin sessions in AdminAccessLog
  // In production, you might want a separate AdminSession table
  const recentLogin = await prisma.adminAccessLog.findFirst({
    where: {
      action: 'login',
      createdAt: {
        gte: new Date(Date.now() - ADMIN_SESSION_DURATION),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!recentLogin || !recentLogin.adminId) {
    return null;
  }

  return {
    adminId: recentLogin.adminId,
    token,
  };
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session_token');
}

export async function getCurrentAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return null;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
  });

  return admin;
}

export async function verifyAdminPassword(username: string, password: string): Promise<{ success: boolean; adminId?: string }> {
  const admin = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (!admin) {
    return { success: false };
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return { success: false };
  }

  return { success: true, adminId: admin.id };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
