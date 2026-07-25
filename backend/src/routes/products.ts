import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const productSchema = z.object({
  title: z.string().min(3, 'Заголовок минимум 3 символа').max(120),
  description: z.string().min(10, 'Описание минимум 10 символов').max(2000),
  price: z.number().positive('Цена должна быть положительной'),
  currency: z.string().default('TJS'),
  category: z.string().default('other'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

/** GET /api/products — список товаров (с пагинацией и фильтром) */
router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;
  const userId = req.query.userId as string | undefined;

  const skip = (page - 1) * limit;

  const where: any = { status: 'active' };
  if (category && category !== 'all') where.category = category;
  if (userId) where.userId = userId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/** GET /api/products/:id — детали товара */
router.get('/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true, phone: true } } },
  });

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  // Увеличиваем счётчик просмотров
  await prisma.product.update({
    where: { id: req.params.id },
    data: { views: { increment: 1 } },
  });

  res.json({ product });
});

/** POST /api/products — создать товар (нужна авторизация) */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Неверные данные', details: parsed.error.flatten() });
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
      userId: req.userId!,
    },
  });

  res.status(201).json({ product });
});

/** PUT /api/products/:id — обновить товар (только владелец) */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  if (product.userId !== req.userId && req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Нет прав на редактирование' });
  }

  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  res.json({ product: updated });
});

/** DELETE /api/products/:id — удалить товар (владелец или админ) */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  if (product.userId !== req.userId && req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Нет прав на удаление' });
  }

  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: 'Товар удалён' });
});

/** GET /api/products/my/listing — мои товары */
router.get('/my/listing', authMiddleware, async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ products });
});

/** POST /api/products/:id/favorite — добавить в избранное */
router.post('/:id/favorite', authMiddleware, async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  const fav = await prisma.favorite.upsert({
    where: {
      userId_productId: { userId: req.userId!, productId: req.params.id },
    },
    update: {},
    create: { userId: req.userId!, productId: req.params.id },
  });

  res.json({ message: 'Добавлено в избранное', favorite: fav });
});

/** DELETE /api/products/:id/favorite — убрать из избранного */
router.delete('/:id/favorite', authMiddleware, async (req: Request, res: Response) => {
  await prisma.favorite.deleteMany({
    where: { userId: req.userId!, productId: req.params.id },
  }).catch(() => {});
  res.json({ message: 'Убрано из избранного' });
});

/** GET /api/products/favorites/my — моё избранное */
router.get('/favorites/my', authMiddleware, async (req: Request, res: Response) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ favorites: favorites.map((f) => f.product) });
});

export default router;
