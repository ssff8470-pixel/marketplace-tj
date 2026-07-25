import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(payload: { userId: string; phone: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): { userId: string; phone: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// Хранилище SMS-кодов: Map<phone, { code, expiresAt }>
const smsStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * Генерация и "отправка" SMS-кода.
 * В локальной разработке код возвращается в ответе (имитация).
 */
export function generateSmsCode(phone: string): string {
  // 4-значный код для удобства
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  smsStore.set(phone, {
    code,
    expiresAt: Date.now() + 3 * 60 * 1000, // 3 минуты
  });
  return code;
}

export function verifySmsCode(phone: string, code: string): boolean {
  const entry = smsStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    smsStore.delete(phone);
    return false;
  }
  if (entry.code !== code) return false;
  smsStore.delete(phone);
  return true;
}

/**
 * Валидация номера телефона Таджикистана (+992).
 * Формат: +992 XX XXX XXXX или 992XXXXXXXXX
 * Операторы: 90, 91, 92, 93, 94, 95, 97, 98, 99, 50, 55, 88
 */
export function validateTajikPhone(phone: string): boolean {
  // Удаляем пробелы, дефисы, скобки
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Форматы: +992XXXXXXXXX или 992XXXXXXXXX
  const regex = /^(\+?992)(5[05]|8[8]|9[0-9])\d{7}$/;
  return regex.test(cleaned);
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) return cleaned.slice(1);
  if (cleaned.startsWith('992')) return cleaned;
  return cleaned;
}

export { bcrypt };
