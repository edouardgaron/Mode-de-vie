import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('fr-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(amount);
}

export function getMonthString(): string {
  return new Date().toISOString().slice(0, 7);
}

export function formatMonthFrench(month: string): string {
  const date = new Date(month + '-01T12:00:00');
  return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long' });
}
