import * as Icons from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function WeatherSearch() {
  const [zip, setZip] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (/^\d{5}$/.test(zip)) {
      Keyboard.dismiss();
      router.push({ pathname: '/results', params: { zip } });
    }
  };

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
          >
            
            <View style={styles.header}>
              <Text style={styles.logo}>MYWEATHER</Text>
              
              {/* FAVORITES BUTTON */}
              <TouchableOpacity 
                onPress={() => router.push('/favorites')} 
                style={styles.favoritesButton}
              >
                <Text style={styles.favText}>MY FAVORITES </Text>
                <Icons.MaterialCommunityIcons name="heart" size={20} color="#ff4757" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
              <View style={styles.glassCard}>
                <Icons.MaterialCommunityIcons name="weather-cloudy" size={80} color="#fff" style={{ marginBottom: 20 }} />
                <Text style={styles.title}>Weather Search</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5-Digit Zipcode"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="numeric"
                  value={zip}
                  onChangeText={setZip}
                  maxLength={5}
                  returnKeyType="done"
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity 
                  style={[styles.button, { opacity: zip.length === 5 ? 1 : 0.5 }]} 
                  onPress={handleSearch}
                  disabled={zip.length !== 5}
                >
                  <Text style={styles.buttonText}>Get Forecast</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    alignItems: 'center' 
  },
  logo: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  favoritesButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  favText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  glassCard: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    padding: 30, 
    borderRadius: 30, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  title: { fontSize: 28, color: '#fff', fontWeight: 'bold', marginBottom: 25 },
  input: { 
    width: '100%', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    color: '#fff', 
    padding: 20, 
    borderRadius: 20, 
    fontSize: 24, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  button: { 
    width: '100%', 
    backgroundColor: '#3b82f6', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});