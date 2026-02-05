import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (email && password) router.replace('/weather');
    else Alert.alert('Wait!', 'Please enter your email and password.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyWeather</Text>
      <TextInput style={styles.input} placeholder="Email Address" onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f5f6fa' },
  title: { fontSize: 48, fontWeight: '900', textAlign: 'center', marginBottom: 50, color: '#2f3640' },
  input: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 15 },
  button: { backgroundColor: '#3498db', padding: 20, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});