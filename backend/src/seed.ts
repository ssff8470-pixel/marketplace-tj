/**
 * Заполнение базы начальными данными (категории + демо-товары).
 * Запуск: npm run seed
 */
import prisma from './db';

async function main() {
  console.log('Начало заполнения базы данных...');

  // Категории
  const categories = [
    { name: 'Электроника', icon: '📱' },
    { name: 'Автомобили', icon: '🚗' },
    { name: 'Недвижимость', icon: '🏠' },
    { name: 'Одежда', icon: '👕' },
    { name: 'Мебель', icon: '🪑' },
    { name: 'Услуги', icon: '🔧' },
    { name: 'Другое', icon: '📦' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`[OK] Категории: ${categories.length}`);

  // Демо-пользователь
  const demoUser = await prisma.user.upsert({
    where: { phone: '992901234567' },
    update: {},
    create: {
      phone: '992901234567',
      name: 'Демо пользователь',
      role: 'USER',
    },
  });

  // Демо-товары
  const demoProducts = [
    {
      title: 'iPhone 13 Pro 256GB',
      description: 'Состояние отличное, пользуюсь 1 год. Все функции работают. В комплекте коробка и зарядка.',
      price: 4500,
      category: 'Электроника',
    },
    {
      title: 'Toyota Camry 2018',
      description: 'Пробег 85 000 км. Один владелец. Состояние идеальное. Все ТО пройдены вовремя.',
      price: 95000,
      category: 'Автомобили',
    },
    {
      title: '2-комнатная квартира в Душанбе',
      description: 'Район Фирдоуси, 4 этаж. 65 кв.м. Ремонт, мебель. Свободна.',
      price: 350000,
      category: 'Недвижимость',
    },
    {
      title: 'Куртка зимняя мужская',
      description: 'Размер L. Носил один сезон. Тёплая, водоотталкивающая.',
      price: 350,
      category: 'Одежда',
    },
    {
      title: 'Диван раскладной',
      description: 'Новый, ни разу не использовался. Цвет серый. Доставка по Душанбе.',
      price: 1800,
      category: 'Мебель',
    },
  ];

  for (const p of demoProducts) {
    await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        currency: 'TJS',
        userId: demoUser.id,
      },
    });
  }
  console.log(`[OK] Демо-товары: ${demoProducts.length}`);

  console.log('\nГотово! База данных заполнена.');
  console.log('Демо-пользователь: +992 90 123 4567 (код придёт при регистрации)');
}

main()
  .catch((e) => {
    console.error('Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
