import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function AuthScreen() {
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('+992 ');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState('');

  const formatPhone = (text: string) => {
    // Автоформат: +992 XX XXX XXXX
    let digits = text.replace(/\D/g, '');
    if (digits.startsWith('992')) {
      digits = digits.slice(3);
    }
    if (digits.length > 9) digits = digits.slice(0, 9);

    let formatted = '+992';
    if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 9);
    return formatted;
  };

  const handleSendCode = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 12) {
      Alert.alert('Ошибка', 'Введите номер в формате +992 XX XXX XXXX');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendCode(phone);
      setDevCode(res.devCode || '');
      setStep('code');
      Alert.alert(
        'Код отправлен',
        devCode ? `Ваш код (демо-режим): ${res.devCode}` : 'Проверьте SMS'
      );
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 4) {
      Alert.alert('Ошибка', 'Введите 4-значный код');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyCode(phone, code);
      await login(res.token, res.user);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🛒</Text>
        <Text style={styles.title}>TJ Marketplace</Text>
        <Text style={styles.subtitle}>Покупай и продавай в Таджикистане</Text>
      </View>

      {step === 'phone' ? (
        <View style={styles.form}>
          <Text style={styles.label}>Номер телефона</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={formatPhone}
            placeholder="+992 90 123 4567"
            keyboardType="phone-pad"
            autoFocus
          />
          <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Отправить код</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Код подтверждения</Text>
          <Text style={styles.hint}>Отправлен на {phone}</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={code}
            onChangeText={setCode}
            placeholder="0000"
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
          />
          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Войти</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('phone')}>
            <Text style={styles.linkText}>Изменить номер</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4F46E5', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  form: { backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  hint: { fontSize: 12, color: '#999', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, fontSize: 18, marginBottom: 16 },
  codeInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkText: { color: '#4F46E5', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
