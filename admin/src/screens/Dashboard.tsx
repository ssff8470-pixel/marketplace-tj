import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка...</p>;

  const cards = [
    { label: 'Пользователи', value: stats?.users || 0, icon: '👥', color: '#3b82f6' },
    { label: 'Всего товаров', value: stats?.products || 0, icon: '📦', color: '#10b981' },
    { label: 'Активные товары', value: stats?.activeProducts || 0, icon: '✅', color: '#f59e0b' },
    { label: 'Заблокированные', value: stats?.blockedUsers || 0, icon: '🚫', color: '#ef4444' },
  ];

  return (
    <div>
      <h1 style={styles.title}>Дашборд</h1>
      <div style={styles.grid}>
        {cards.map((card, i) => (
          <div key={i} style={{ ...styles.card, borderLeft: `4px solid ${card.color}` }}>
            <div style={styles.cardIcon}>{card.icon}</div>
            <div>
              <div style={styles.cardValue}>{card.value}</div>
              <div style={styles.cardLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, marginBottom: 24, color: '#1e293b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 },
  card: { background: '#fff', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardIcon: { fontSize: 36 },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: '#1e293b' },
  cardLabel: { fontSize: 14, color: '#64748b' },
};
