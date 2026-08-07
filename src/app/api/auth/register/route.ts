import { NextRequest, NextResponse } from 'next/server';
import { tryConnectMongo } from '@/lib/db';
import User from '@/models/User';
import { inMemoryDb } from '@/lib/inMemoryDb';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const isMongoConnected = await tryConnectMongo();

    if (isMongoConnected) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ message: 'A reader with this email already exists' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      const token = signToken({
        userId: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
      });

      const response = NextResponse.json(
        {
          message: 'Account created successfully! Welcome to your reading sanctuary ✨',
          user: {
            _id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt,
          },
          token,
        },
        { status: 201 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    } else {
      // In-Memory Fallback
      const existingUser = inMemoryDb.findUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ message: 'A reader with this email already exists' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = inMemoryDb.createUser({
        name,
        email,
        password: hashedPassword,
      });

      const token = signToken({
        userId: newUser._id,
        email: newUser.email,
        name: newUser.name,
      });

      const response = NextResponse.json(
        {
          message: 'Account created! Welcome to your reading sanctuary ✨',
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt,
          },
          token,
        },
        { status: 201 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: error.message || 'Server error during registration' }, { status: 500 });
  }
}
