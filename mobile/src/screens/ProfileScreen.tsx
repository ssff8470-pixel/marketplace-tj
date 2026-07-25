import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<'my' | 'favorites'>('my');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = tab === 'my' ? await api.getMyProducts() : await api.getFavorites();
      setProducts(res.products || res.favorites || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [tab]);

  const formatPrice = (p: number) => new Intl.NumberFormat('ru-RU').format(p) + ' TJS';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>+{user?.phone}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'my' && styles.tabActive]}
          onPress={() => setTab('my')}
        >
          <Text style={[styles.tabText, tab === 'my' && styles.tabTextActive]}>Мои товары</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'favorites' && styles.tabActive]}
          onPress={() => setTab('favorites')}
        >
          <Text style={[styles.tabText, tab === 'favorites' && styles.tabTextActive]}>Избранное</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item: any) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
            >
              <View style={styles.cardRow}>
                <View style={styles.cardThumb}>
                  <Text style={styles.cardThumbText}>📷</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
                  <Text style={styles.cardStatus}>{item.status === 'active' ? '✅ Активен' : item.status === 'sold' ? '✅ Продан' : '🚫 Заблокирован'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Пусто</Text>}
        />
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#4F46E5' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  phone: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 14, color: '#666' },
  tabTextActive: { color: '#4F46E5', fontWeight: '600' },
  loader: { flex: 1, justifyContent: 'center' },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 6, borderRadius: 12, padding: 12, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardThumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardThumbText: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardPrice: { fontSize: 15, fontWeight: 'bold', color: '#4F46E5', marginTop: 2 },
  cardStatus: { fontSize: 12, color: '#999', marginTop: 2 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
  logoutBtn: { margin: 16, backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 16 },
});
