import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const res = await api.getProduct(route.params.id);
      setProduct(res.product);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />;
  }

  if (!product) {
    return <Text style={styles.empty}>Товар не найден</Text>;
  }

  const isOwner = user?.id === product.userId;

  const handleDelete = () => {
    Alert.alert('Удалить товар?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteProduct(product.id);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Ошибка', e.message);
          }
        },
      },
    ]);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price) + ' TJS';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.image}>
        <Text style={styles.imageText}>📷</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaItem}>📂 {product.category}</Text>
          <Text style={styles.metaItem}>👁 {product.views} просмотров</Text>
        </View>

        <Text style={styles.sectionTitle}>Описание</Text>
        <Text style={styles.description}>{product.description}</Text>

        <Text style={styles.sectionTitle}>Продавец</Text>
        <View style={styles.sellerCard}>
          <Text style={styles.sellerName}>{product.user?.name || 'Аноним'}</Text>
          <Text style={styles.sellerPhone}>📞 +{product.user?.phone}</Text>
        </View>

        {isOwner ? (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('CreateProduct', { product })}
            >
              <Text style={styles.editBtnText}>✏️ Редактировать</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑 Удалить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Alert.alert('Связаться', `Позвоните: +${product.user?.phone}`)}
          >
            <Text style={styles.callBtnText}>📞 Связаться с продавцом</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999' },
  image: { height: 300, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  imageText: { fontSize: 80 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 26, fontWeight: 'bold', color: '#4F46E5', marginTop: 8 },
  meta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { fontSize: 14, color: '#666' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 8 },
  description: { fontSize: 15, color: '#555', lineHeight: 22 },
  sellerCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16 },
  sellerName: { fontSize: 16, fontWeight: '600', color: '#333' },
  sellerPhone: { fontSize: 15, color: '#4F46E5', marginTop: 4 },
  ownerActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  editBtn: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 12, padding: 16, alignItems: 'center' },
  editBtnText: { color: '#333', fontWeight: '600' },
  deleteBtn: { flex: 1, backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, alignItems: 'center' },
  deleteBtnText: { color: '#dc2626', fontWeight: '600' },
  callBtn: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
