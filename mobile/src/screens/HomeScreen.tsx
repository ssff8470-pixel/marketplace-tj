import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
  TextInput, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { CATEGORIES } from '../config';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (reset) setLoading(true);
      const res = await api.getProducts({ page: pageNum, category, search });
      if (pageNum === 1) {
        setProducts(res.products);
      } else {
        setProducts((prev) => [...prev, ...res.products]);
      }
      setTotalPages(res.pagination.totalPages);
      setPage(pageNum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, search]);

  useEffect(() => {
    loadProducts(1, true);
  }, [category]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts(1, true);
  };

  const onSearch = () => {
    loadProducts(1, true);
  };

  const loadMore = () => {
    if (page < totalPages) {
      loadProducts(page + 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' TJS';
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
    >
      <View style={styles.cardImage}>
        <Text style={styles.cardImageText}>📷</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Поиск */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск товаров..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
      </View>

      {/* Категории */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item: any) => item.key}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            style={[styles.catChip, category === item.key && styles.catChipActive]}
            onPress={() => setCategory(item.key)}
          >
            <Text style={styles.catIcon}>{item.icon}</Text>
            <Text style={[styles.catLabel, category === item.key && styles.catLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.categories}
        showsHorizontalScrollIndicator={false}
      />

      {/* Список товаров */}
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          numColumns={2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Товары не найдены</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { padding: 12, backgroundColor: '#fff' },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 12, padding: 12, fontSize: 16 },
  categories: { maxHeight: 60, backgroundColor: '#fff', paddingHorizontal: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 4, borderRadius: 20, backgroundColor: '#f0f0f0' },
  catChipActive: { backgroundColor: '#4F46E5' },
  catIcon: { fontSize: 16, marginRight: 4 },
  catLabel: { fontSize: 13, color: '#333' },
  catLabelActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 8 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, margin: 6, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  cardImage: { height: 120, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  cardImageText: { fontSize: 40 },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5' },
  cardCategory: { fontSize: 12, color: '#999', marginTop: 4 },
  loader: { flex: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});
