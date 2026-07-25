import React, { useState, useEffect } from 'react';
import { adminApi, setAdminToken, getAdminToken } from './api';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Users from './screens/Users';
import Products from './screens/Products';

type Tab = 'dashboard' | 'users' | 'products';

export default function App() {
  const [isAuth, setIsAuth] = useState(!!getAdminToken());
  const [tab, setTab] = useState<Tab>('dashboard');

  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  const handleLogout = () => {
    setAdminToken(null);
    setIsAuth(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          🛒 TJ Admin
        </div>
        <nav style={styles.nav}>
          <button style={tab === 'dashboard' ? styles.navItemActive : styles.navItem} onClick={() => setTab('dashboard')}>
            📊 Дашборд
          </button>
          <button style={tab === 'users' ? styles.navItemActive : styles.navItem} onClick={() => setTab('users')}>
            👥 Пользователи
          </button>
          <button style={tab === 'products' ? styles.navItemActive : styles.navItem} onClick={() => setTab('products')}>
            📦 Товары
          </button>
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Выйти
        </button>
      </aside>

      {/* Content */}
      <main style={styles.content}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'users' && <Users />}
        {tab === 'products' && <Products />}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: { width: 240, background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column', padding: 16 },
  sidebarLogo: { fontSize: 20, fontWeight: 'bold', padding: '16px 0', borderBottom: '1px solid #334155' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 },
  navItem: { background: 'transparent', border: 'none', color: '#94a3b8', padding: '12px 16px', textAlign: 'left', borderRadius: 8, cursor: 'pointer', fontSize: 15, transition: 'all 0.2s' },
  navItemActive: { background: '#4F46E5', border: 'none', color: '#fff', padding: '12px 16px', textAlign: 'left', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 },
  logoutBtn: { background: '#dc2626', border: 'none', color: '#fff', padding: '12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  content: { flex: 1, padding: 32, overflow: 'auto' },
};
