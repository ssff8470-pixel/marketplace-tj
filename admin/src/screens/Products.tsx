import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    adminApi.getProducts(p).then((data) => {
      setProducts(data.products);
      setPage(p);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id: string, status: string) => {
    await adminApi.setProductStatus(id, status);
    load(page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    await adminApi.deleteProduct(id);
    load(page);
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('ru-RU').format(p) + ' TJS';

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h1 style={styles.title}>Товары ({products.length})</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Название</th>
            <th style={styles.th}>Цена</th>
            <th style={styles.th}>Категория</th>
            <th style={styles.th}>Продавец</th>
            <th style={styles.th}>Статус</th>
            <th style={styles.th}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={styles.tr}>
              <td style={styles.td}>{p.title}</td>
              <td style={styles.td}>{formatPrice(p.price)}</td>
              <td style={styles.td}>{p.category}</td>
              <td style={styles.td}>{p.user?.name || '—'}</td>
              <td style={styles.td}>
                <span style={statusBadge(p.status)}>{p.status}</span>
              </td>
              <td style={styles.td}>
                <select
                  style={styles.select}
                  value={p.status}
                  onChange={(e) => changeStatus(p.id, e.target.value)}
                >
                  <option value="active">active</option>
                  <option value="sold">sold</option>
                  <option value="blocked">blocked</option>
                </select>
                <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusBadge(status: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    active: { background: '#dcfce7', color: '#166534' },
    sold: { background: '#dbeafe', color: '#1e40af' },
    blocked: { background: '#fee2e2', color: '#991b1b' },
  };
  return { ...map[status] || {}, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, marginBottom: 24, color: '#1e293b' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '14px 16px', background: '#f8fafc', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 16px', fontSize: 14, color: '#334155' },
  select: { padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, marginRight: 6 },
  deleteBtn: { background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: '#dc2626', fontWeight: 600 },
};
