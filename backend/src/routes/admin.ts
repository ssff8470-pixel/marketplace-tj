import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Все маршруты требуют авторизации + прав администратора
router.use(authMiddleware, adminMiddleware);

/** GET /api/admin/stats — статистика дашборда */
router.get('/stats', async (_req: Request, res: Response) => {
  const [users, products, activeProducts, blockedUsers] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { status: 'active' } }),
    prisma.user.count({ where: { isBlocked: true } }),
  ]);

  res.json({ users, products, activeProducts, blockedUsers });
});

/** GET /api/admin/users — список пользователей */
router.get('/users', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, phone: true, name: true, role: true,
        isBlocked: true, createdAt: true,
        _count: { select: { products: true } },
      },
    }),
    prisma.user.count(),
  ]);

  res.json({ users, pagination: { page, limit, total } });
});

/** PUT /api/admin/users/:id/block — блокировка/разблокировка пользователя */
router.put('/users/:id/block', async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isBlocked: !req.body.block ? false : true },
  });
  res.json({ user: { id: user.id, isBlocked: user.isBlocked } });
});

/** PUT /api/admin/users/:id/role — изменение роли */
router.put('/users/:id/role', async (req: Request, res: Response) => {
  const role = req.body.role === 'ADMIN' ? 'ADMIN' : 'USER';
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
  });
  res.json({ user: { id: user.id, role: user.role } });
});

/** DELETE /api/admin/users/:id — удалить пользователя */
router.delete('/users/:id', async (req: Request, res: Response) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'Пользователь удалён' });
});

/** GET /api/admin/products — все товары (включая заблокированные) */
router.get('/products', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.product.count(),
  ]);

  res.json({ products, pagination: { page, limit, total } });
});

/** PUT /api/admin/products/:id/status — изменить статус товара */
router.put('/products/:id/status', async (req: Request, res: Response) => {
  const status = ['active', 'sold', 'blocked'].includes(req.body.status)
    ? req.body.status
    : 'active';
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json({ product: { id: product.id, status: product.status } });
});

/** DELETE /api/admin/products/:id — удалить товар */
router.delete('/products/:id', async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: 'Товар удалён' });
});

export default router;
