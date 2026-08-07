export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface IBook {
  _id: string;
  userId: string;
  title: string;
  author: string;
  status: ReadingStatus;
  tags: string[];
  totalPages?: number;
  currentPage?: number;
  rating?: number; // 1 to 5 stars
  review?: string;
  quote?: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDashboardStats {
  totalBooks: number;
  wantToRead: number;
  reading: number;
  completed: number;
  totalPagesRead: number;
  topTags: { tag: string; count: number }[];
}

export interface AuthResponse {
  user: IUser;
  token?: string;
  message?: string;
}
