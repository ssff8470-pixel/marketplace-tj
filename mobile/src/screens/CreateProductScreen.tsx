import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../api/client';
import { CATEGORIES } from '../config';

export default function CreateProductScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editing = route.params?.product;

  const [title, setTitle] = useState(editing?.title || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [price, setPrice] = useState(editing?.price?.toString() || '');
  const [category, setCategory] = useState(editing?.category || 'other');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (title.length < 3) {
      Alert.alert('Ошибка', 'Заголовок минимум 3 символа');
      return;
    }
    if (description.length < 10) {
      Alert.alert('Ошибка', 'Описание минимум 10 символов');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную цену');
      return;
    }

    setLoading(true);
    try {
      const data = {
        title,
        description,
        price: parseFloat(price),
        category,
      };
      if (editing) {
        await api.updateProduct(editing.id, data);
        Alert.alert('Готово', 'Товар обновлён');
      } else {
        await api.createProduct(data);
        Alert.alert('Готово', 'Товар опубликован');
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>
        {editing ? 'Редактировать товар' : 'Новый товар'}
      </Text>

      <Text style={styles.label}>Название</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Например: iPhone 13 Pro"
      />

      <Text style={styles.label}>Описание</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Опишите ваш товар..."
        multiline
        numberOfLines={5}
      />

      <Text style={styles.label}>Цена (TJS)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="0"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Категория</Text>
      <View style={styles.categories}>
        {CATEGORIES.filter(c => c.key !== 'all').map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catChip, category === cat.key && styles.catChipActive]}
            onPress={() => setCategory(cat.key)}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catLabel, category === cat.key && styles.catLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {editing ? 'Сохранить' : 'Опубликовать'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, fontSize: 16 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f0f0f0' },
  catChipActive: { backgroundColor: '#4F46E5' },
  catIcon: { fontSize: 16, marginRight: 4 },
  catLabel: { fontSize: 13, color: '#333' },
  catLabelActive: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
