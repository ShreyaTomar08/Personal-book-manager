import { NextRequest, NextResponse } from 'next/server';
import { tryConnectMongo } from '@/lib/db';
import User from '@/models/User';
import { inMemoryDb } from '@/lib/inMemoryDb';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Please provide both email and password' }, { status: 400 });
    }

    const isMongoConnected = await tryConnectMongo();

    let userObj: { _id: string; name: string; email: string; password?: string; createdAt?: any } | null = null;

    if (isMongoConnected) {
      const dbUser = await User.findOne({ email: email.toLowerCase() });
      if (dbUser) {
        userObj = {
          _id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          password: dbUser.password,
          createdAt: dbUser.createdAt,
        };
      }
    } else {
      userObj = inMemoryDb.findUserByEmail(email);
    }

    if (!userObj || !userObj.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, userObj.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      userId: userObj._id,
      email: userObj.email,
      name: userObj.name,
    });

    const response = NextResponse.json({
      message: 'Welcome back to your reading sanctuary ✨',
      user: {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        createdAt: userObj.createdAt,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: error.message || 'Server error during login' }, { status: 500 });
  }
}
