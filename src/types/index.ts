/**
 * Contact Management System - Enterprise Type Definitions
 */

export type EmailLabel = 'work' | 'personal' | 'other';
export type PhoneLabel = 'work' | 'mobile' | 'home' | 'other';

export interface EmailEntry {
  id: string;
  email: string;
  label: EmailLabel;
  isPrimary?: boolean;
}

export interface PhoneEntry {
  id: string;
  number: string;
  label: PhoneLabel;
  isPrimary?: boolean;
}

export interface Contact {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  department?: string;
  emails: EmailEntry[];
  phones: PhoneEntry[];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
  category?: 'Clients' | 'Partners' | 'Vendors' | 'Team' | 'General';
  isFavorite: boolean;
  avatarColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  role: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  logger: string;
  thread: string;
  message: string;
  details?: string;
}

export interface SortConfig {
  key: keyof Contact | 'name';
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  searchQuery: string;
  category: string;
  isFavoriteOnly: boolean;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
