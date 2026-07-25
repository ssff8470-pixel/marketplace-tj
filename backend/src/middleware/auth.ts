import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

// Расширяем тип Request для userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      userPhone?: string;
    }
  }
}

/** Проверка JWT-токена (для обычных пользователей) */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
  req.userId = payload.userId;
  req.userRole = payload.role;
  req.userPhone = payload.phone;
  next();
}

/** Проверка роли администратора */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора.' });
  }
  next();
}
