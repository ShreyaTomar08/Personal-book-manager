import { NextRequest, NextResponse } from 'next/server';
import { tryConnectMongo } from '@/lib/db';
import User from '@/models/User';
import { inMemoryDb } from '@/lib/inMemoryDb';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const isMongoConnected = await tryConnectMongo();

    if (isMongoConnected) {
      const dbUser = await User.findById(authUser.userId).select('-password');
      if (dbUser) {
        return NextResponse.json({
          user: {
            _id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            createdAt: dbUser.createdAt,
          },
        });
      }
    }

    // In-memory fallback
    const memUser = inMemoryDb.findUserById(authUser.userId);
    if (memUser) {
      return NextResponse.json({
        user: {
          _id: memUser._id,
          name: memUser.name,
          email: memUser.email,
          createdAt: memUser.createdAt,
        },
      });
    }

    // Fallback using JWT payload if user session is valid
    return NextResponse.json({
      user: {
        _id: authUser.userId,
        name: authUser.name,
        email: authUser.email,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Fetch me error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
