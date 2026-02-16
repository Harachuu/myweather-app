import * as Icons from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Logic: Requires both fields to be filled
    if (email && password) {
      router.replace('/weather');
    } else {
      Alert.alert('Wait!', 'Please enter your email and password.');
    }
  };

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.inner}
          >
            <View style={styles.headerArea}>
              <Icons.MaterialCommunityIcons name="weather-partly-cloudy" size={80} color="rgba(255,255,255,0.9)" />
              <Text style={styles.title}>MyWeather</Text>
              <Text style={styles.subtitle}>Enter your details to continue</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Icons.MaterialCommunityIcons name="email-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Email Address" 
                  placeholderTextColor="rgba(255,255,255,0.3)" // Darker placeholder for glass effect
                  onChangeText={setEmail} 
                  autoCapitalize="none" 
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Icons.MaterialCommunityIcons name="lock-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Password" 
                  placeholderTextColor="rgba(255,255,255,0.3)" // Darker placeholder for glass effect
                  secureTextEntry 
                  onChangeText={setPassword} 
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>LOGIN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a' // Matching your app's deep slate theme
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: { 
    fontSize: 42, 
    fontWeight: '900', 
    color: '#fff', 
    marginTop: 10,
    letterSpacing: 1
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', // Glass background
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 65,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', // Subtle glass border
  },
  inputIcon: {
    marginRight: 10,
  },
  input: { 
    flex: 1,
    color: '#fff', 
    fontSize: 16,
    fontWeight: '500',
  },
  button: { 
    backgroundColor: '#3b82f6', // Matching your search button blue
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '900', 
    fontSize: 16,
    letterSpacing: 2
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '600',
  }
});