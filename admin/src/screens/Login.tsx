import React, { useState } from 'react';
import { adminApi, setAdminToken } from '../api';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState('+992 90 000 0000');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.login(phone.replace(/\D/g, ''), code);
      setAdminToken(res.token);
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>🛒 TJ Marketplace</h1>
        <p style={styles.subtitle}>Админ-панель</p>
        <p style={styles.hint}>По умолчанию: +992900000000 / код: 123456</p>
        <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" />
        <input style={styles.input} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Код" type="password" />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b' },
  card: { background: '#fff', borderRadius: 16, padding: 40, width: 380, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  hint: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 16 },
  input: { width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: 8, fontSize: 16, marginBottom: 12 },
  button: { width: '100%', padding: '14px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  error: { color: '#dc2626', fontSize: 14, marginBottom: 12 },
};
