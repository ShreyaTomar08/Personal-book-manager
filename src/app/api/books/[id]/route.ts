import { NextRequest, NextResponse } from 'next/server';
import { tryConnectMongo } from '@/lib/db';
import Book from '@/models/Book';
import { inMemoryDb } from '@/lib/inMemoryDb';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const isMongoConnected = await tryConnectMongo();

    if (isMongoConnected) {
      const book = await Book.findOne({ _id: id, userId: authUser.userId });
      if (!book) return NextResponse.json({ message: 'Book not found' }, { status: 404 });
      return NextResponse.json({ book });
    } else {
      const books = inMemoryDb.getBooks(authUser.userId);
      const book = books.find((b) => b._id === id);
      if (!book) return NextResponse.json({ message: 'Book not found' }, { status: 404 });
      return NextResponse.json({ book });
    }
  } catch (error: any) {
    console.error('Fetch single book error:', error);
    return NextResponse.json({ message: 'Error fetching book' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.tags && Array.isArray(body.tags)) {
      body.tags = body.tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean);
    } else if (typeof body.tags === 'string') {
      body.tags = body.tags
        .split(',')
        .map((t: string) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    const isMongoConnected = await tryConnectMongo();

    if (isMongoConnected) {
      const updatedBook = await Book.findOneAndUpdate({ _id: id, userId: authUser.userId }, { $set: body }, { new: true, runValidators: true });
      if (!updatedBook) return NextResponse.json({ message: 'Book not found' }, { status: 404 });
      return NextResponse.json({ book: updatedBook, message: 'Book details updated ✨' });
    } else {
      const updatedBook = inMemoryDb.updateBook(authUser.userId, id, body);
      if (!updatedBook) return NextResponse.json({ message: 'Book not found' }, { status: 404 });
      return NextResponse.json({ book: updatedBook, message: 'Book details updated ✨' });
    }
  } catch (error: any) {
    console.error('Update book error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const isMongoConnected = await tryConnectMongo();

    if (isMongoConnected) {
      const deletedBook = await Book.findOneAndDelete({ _id: id, userId: authUser.userId });
      if (!deletedBook) return NextResponse.json({ message: 'Book not found' }, { status: 404 });
      return NextResponse.json({ message: 'Book removed from your library' });
    } else {
      const deleted = inMemoryDb.deleteBook(authUser.userId, id);
      if (!deleted) return NextResponse.json({ message: 'Book not found' }, { status: 404 });
      return NextResponse.json({ message: 'Book removed from your library' });
    }
  } catch (error: any) {
    console.error('Delete book error:', error);
    return NextResponse.json({ message: 'Failed to delete book' }, { status: 500 });
  }
}
