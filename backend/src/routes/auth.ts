import { Router, Request, Response } from 'express';
import prisma from '../db';
import { generateSmsCode, verifySmsCode, validateTajikPhone, normalizePhone, generateToken } from '../utils/auth';
import { z } from 'zod';

const router = Router();

const phoneSchema = z.object({
  phone: z.string().min(12, 'Номер слишком короткий'),
});

const verifySchema = z.object({
  phone: z.string(),
  code: z.string().length(4, 'Код должен содержать 4 цифры'),
});

/** POST /api/auth/send-code — отправка SMS-кода */
router.post('/send-code', async (req: Request, res: Response) => {
  const parsed = phoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Неверный формат данных', details: parsed.error.flatten() });
  }

  const phone = normalizePhone(parsed.data.phone);

  if (!validateTajikPhone(phone)) {
    return res.status(400).json({ error: 'Неверный номер телефона Таджикистана. Формат: +992XXXXXXXXX' });
  }

  const code = generateSmsCode(phone);

  // В локальной разработке возвращаем код в ответе.
  // В продакшене здесь была бы интеграция с SMS-провайдером (например, tj-sms.ru).
  console.log(`[SMS] Код для ${phone}: ${code}`);

  res.json({
    message: 'Код отправлен',
    // devMode — в реальном проекте убрать
    devCode: code,
  });
});

/** POST /api/auth/verify-code — проверка кода и вход/регистрация */
router.post('/verify-code', async (req: Request, res: Response) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Неверный формат данных', details: parsed.error.flatten() });
  }

  const phone = normalizePhone(parsed.data.phone);
  const code = parsed.data.code;

  if (!verifySmsCode(phone, code)) {
    return res.status(400).json({ error: 'Неверный или истёкший код' });
  }

  // Проверяем, существует ли пользователь
  let user = await prisma.user.findUnique({ where: { phone } });
  let isNewUser = false;

  if (!user) {
    // Регистрируем нового пользователя
    user = await prisma.user.create({
      data: {
        phone,
        name: `Пользователь ${phone.slice(-4)}`,
        role: 'USER',
      },
    });
    isNewUser = true;
  }

  if (user.isBlocked) {
    return res.status(403).json({ error: 'Аккаунт заблокирован администратором' });
  }

  const token = generateToken({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  });

  res.json({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
    isNewUser,
  });
});

/** POST /api/auth/admin-login — вход администратора */
router.post('/admin-login', async (req: Request, res: Response) => {
  const schema = z.object({
    phone: z.string(),
    code: z.string(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Неверный формат данных' });
  }

  const phone = normalizePhone(parsed.data.phone);
  const adminPhone = process.env.ADMIN_PHONE || '992900000000';
  const adminCode = process.env.ADMIN_CODE || '123456';

  if (phone !== adminPhone || parsed.data.code !== adminCode) {
    return res.status(401).json({ error: 'Неверные учётные данные администратора' });
  }

  let admin = await prisma.user.findUnique({ where: { phone } });
  if (!admin) {
    admin = await prisma.user.create({
      data: { phone, name: 'Администратор', role: 'ADMIN' },
    });
  } else if (admin.role !== 'ADMIN') {
    admin = await prisma.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
  }

  const token = generateToken({
    userId: admin.id,
    phone: admin.phone,
    role: 'ADMIN',
  });

  res.json({
    token,
    user: {
      id: admin.id,
      phone: admin.phone,
      name: admin.name,
      role: admin.role,
    },
  });
});

/** GET /api/auth/me — получить текущего пользователя */
router.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  const { verifyToken } = await import('../utils/auth');
  const payload = verifyToken(header.slice(7));
  if (!payload) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  res.json({
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      isBlocked: user.isBlocked,
    },
  });
});

/** PUT /api/auth/profile — обновить профиль */
router.put('/profile', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  const { verifyToken } = await import('../utils/auth');
  const payload = verifyToken(header.slice(7));
  if (!payload) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }

  const schema = z.object({
    name: z.string().min(1).max(100).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: parsed.data,
  });

  res.json({
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
  });
});

export default router;
