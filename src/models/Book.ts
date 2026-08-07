import mongoose, { Schema, Document } from 'mongoose';

export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED';

export interface IBookDocument extends Document {
  userId: string;
  title: string;
  author: string;
  status: ReadingStatus;
  tags: string[];
  totalPages?: number;
  currentPage?: number;
  rating?: number;
  review?: string;
  quote?: string;
  coverUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBookDocument>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['WANT_TO_READ', 'READING', 'COMPLETED'],
      default: 'WANT_TO_READ',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    totalPages: {
      type: Number,
      min: 0,
      default: 0,
    },
    currentPage: {
      type: Number,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      trim: true,
      default: '',
    },
    quote: {
      type: String,
      trim: true,
      default: '',
    },
    coverUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

BookSchema.index({ userId: 1, status: 1 });
BookSchema.index({ userId: 1, tags: 1 });

export default mongoose.models.Book || mongoose.model<IBookDocument>('Book', BookSchema);
