import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    adminApi.getUsers(p).then((data) => {
      setUsers(data.users);
      setPage(p);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const toggleBlock = async (id: string, current: boolean) => {
    await adminApi.blockUser(id, !current);
    load(page);
  };

  const toggleRole = async (id: string, currentRole: string) => {
    await adminApi.setUserRole(id, currentRole === 'ADMIN' ? 'USER' : 'ADMIN');
    load(page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить пользователя?')) return;
    await adminApi.deleteUser(id);
    load(page);
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h1 style={styles.title}>Пользователи ({users.length})</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Имя</th>
            <th style={styles.th}>Телефон</th>
            <th style={styles.th}>Роль</th>
            <th style={styles.th}>Товаров</th>
            <th style={styles.th}>Статус</th>
            <th style={styles.th}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={styles.tr}>
              <td style={styles.td}>{u.name}</td>
              <td style={styles.td}>+{u.phone}</td>
              <td style={styles.td}>
                <span style={u.role === 'ADMIN' ? styles.adminBadge : styles.userBadge}>
                  {u.role}
                </span>
              </td>
              <td style={styles.td}>{u._count?.products || 0}</td>
              <td style={styles.td}>
                <span style={u.isBlocked ? styles.blockedBadge : styles.activeBadge}>
                  {u.isBlocked ? 'Заблокирован' : 'Активен'}
                </span>
              </td>
              <td style={styles.td}>
                <button style={styles.btn} onClick={() => toggleBlock(u.id, u.isBlocked)}>
                  {u.isBlocked ? 'Разблокировать' : 'Блокировать'}
                </button>
                <button style={styles.btn} onClick={() => toggleRole(u.id, u.role)}>
                  {u.role === 'ADMIN' ? 'Сделать USER' : 'Сделать ADMIN'}
                </button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(u.id)}>
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

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, marginBottom: 24, color: '#1e293b' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '14px 16px', background: '#f8fafc', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 16px', fontSize: 14, color: '#334155' },
  adminBadge: { background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  userBadge: { background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  blockedBadge: { background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  activeBadge: { background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  btn: { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', marginRight: 6, color: '#334155' },
  deleteBtn: { background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: '#dc2626', fontWeight: 600 },
};
