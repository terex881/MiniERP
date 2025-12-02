import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

// Format date time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

// Get initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Status colors
export const statusColors = {
  // Lead status
  NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONTACTED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  QUALIFIED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CONVERTED: 'bg-green-500/20 text-green-400 border-green-500/30',
  LOST: 'bg-red-500/20 text-red-400 border-red-500/30',
  // Claim status
  OPEN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  RESOLVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CLOSED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

// Priority colors
export const priorityColors = {
  LOW: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  MEDIUM: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  URGENT: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Role colors
export const roleColors = {
  ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
  SUPERVISOR: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  OPERATOR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CLIENT: 'bg-green-500/20 text-green-400 border-green-500/30',
};

// Billing cycle labels
export const billingCycleLabels = {
  monthly: 'Monthly',
  yearly: 'Yearly',
  'one-time': 'One-time',
};

// Check if user can access based on role
export function canAccess(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

// Role hierarchy check
const roleHierarchy = ['CLIENT', 'OPERATOR', 'SUPERVISOR', 'ADMIN'];

export function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  return roleHierarchy.indexOf(userRole) >= roleHierarchy.indexOf(requiredRole);
}

