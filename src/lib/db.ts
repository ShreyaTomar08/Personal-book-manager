import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/thumbstack-books';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function tryConnectMongo(): Promise<boolean> {
  if (cached?.conn) {
    return true;
  }

  try {
    if (!cached?.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 2000,
      };
      cached!.promise = mongoose.connect(MONGODB_URI, opts);
    }
    cached!.conn = await cached!.promise;
    return true;
  } catch (err) {
    console.warn('MongoDB not reachable on localhost port 27017. Falling back seamlessly to In-Memory DB Store ✨');
    cached!.promise = null;
    cached!.conn = null;
    return false;
  }
}

export const connectToDatabase = tryConnectMongo;
