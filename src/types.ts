export type Language = 'kk' | 'ru';

export type BookType = 'general' | 'special';

export interface Book {
  id: number;
  title: string;
  author: string;
  subject: string;
  category: string;
  course: number; // 0 for all courses, 1-4 for specific
  book_type: BookType;
  total_copies: number;
  available_copies: number;
  description: string;
  cover_color: string;
  cover_url?: string;
  isbn?: string;
  created_at?: string;
}

export type IssueStatus = 'active' | 'partial' | 'returned';

export interface IssueRecord {
  id: number;
  book_id: number;
  book_title?: string;
  book_author?: string;
  course: number;
  group_name: string;
  head_name: string;
  quantity: number;
  returned_quantity: number;
  status: IssueStatus;
  issue_date: string;
  return_date?: string | null;
  notes?: string;
}

export interface AISearchResult {
  book: Book;
  score: number;
  explanation: {
    kk: string;
    ru: string;
  };
}

export interface CollegeGroup {
  course: number;
  name: string;
}

export interface LibraryStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  activeIssues: number;
  totalIssuedCopies: number;
}
