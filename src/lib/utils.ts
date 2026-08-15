import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORAGE_KEY = 'eduflow_pro_v3';

export const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#9d4edd', // purple
  '#f59e0b', // amber
  '#dd2476', // pink
  '#00f2fe', // cyan
  '#ef4444', // red
  '#f97316', // orange
];

export function uid(): string {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function initials(name: string): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function slugUser(name: string, existingUsernames: string[]): string {
  let b = (name.trim().split(/\s+/)[0] || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, '');
  if (!b) b = 'ogrenci';
  let u = b;
  let n = 1;
  while (existingUsernames.includes(u)) {
    u = `${b}${++n}`;
  }
  return u;
}

export function norm(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function fmtTime(sec: number): string {
  sec = Math.max(0, Math.floor(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function timeAgo(timestamp: number): string {
  const d = Date.now() - timestamp;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  const days = Math.floor(h / 24);
  return `${days} gün önce`;
}
