/**
 * Конфигурация API-клиента.
 *
 * ВАЖНО: Для тестирования на реальном телефоне замените localhost
 * на IP-адрес вашего компьютера в локальной сети.
 * Например: https://192.168.1.100:3000
 *
 * Узнать IP: в терминале выполните `ipconfig` (Windows) или `ifconfig` (Mac/Linux).
 */
export const API_URL = 'https://localhost:3000/api';
// export const API_URL = 'https://192.168.1.100:3000/api'; // — пример для телефона

export const CATEGORIES = [
  { key: 'all', label: 'Все', icon: '📦' },
  { key: 'Электроника', label: 'Электроника', icon: '📱' },
  { key: 'Автомобили', label: 'Автомобили', icon: '🚗' },
  { key: 'Недвижимость', label: 'Недвижимость', icon: '🏠' },
  { key: 'Одежда', label: 'Одежда', icon: '👕' },
  { key: 'Мебель', label: 'Мебель', icon: '🪑' },
  { key: 'Услуги', label: 'Услуги', icon: '🔧' },
  { key: 'other', label: 'Другое', icon: '📦' },
];
