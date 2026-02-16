import * as Icons from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

export default function WeatherSearch() {
  const [zip, setZip] = useState('');
  const [locating, setLocating] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (/^\d{5}$/.test(zip)) {
      Keyboard.dismiss();
      router.push({ pathname: '/results', params: { zip } });
    }
  };

  const handleCurrentLocation = async () => {
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Enable location access to use this feature.");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      router.push({ 
        pathname: '/results', 
        params: { 
          lat: location.coords.latitude.toString(), 
          lon: location.coords.longitude.toString() 
        } 
      });
    } catch (e) {
      Alert.alert("Error", "Could not determine your location.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.header}>
              <Text style={styles.logo}>MYWEATHER</Text>
              <TouchableOpacity onPress={() => router.push('/favorites')} style={styles.favoritesButton}>
                <Icons.MaterialCommunityIcons name="heart-multiple" size={22} color="#ff4757" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
              <View style={styles.mainDisplay}>
                 <Icons.MaterialCommunityIcons name="weather-partly-cloudy" size={100} color="rgba(255,255,255,0.9)" />
                 <Text style={styles.heroTitle}>Where would you{"\n"}like to search?</Text>
              </View>

              <View style={styles.searchSection}>
                <View style={styles.inputWrapper}>
                  <TouchableOpacity onPress={handleCurrentLocation} style={styles.locationBtn}>
                    {locating ? <ActivityIndicator size="small" color="#3b82f6" /> : <Icons.MaterialCommunityIcons name="crosshairs-gps" size={24} color="#3b82f6" />}
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Zipcode"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="numeric"
                    value={zip}
                    onChangeText={setZip}
                    maxLength={5}
                    onSubmitEditing={handleSearch}
                  />
                  <TouchableOpacity style={[styles.searchIconBtn, { opacity: zip.length === 5 ? 1 : 0.5 }]} onPress={handleSearch} disabled={zip.length !== 5}>
                    <Icons.MaterialCommunityIcons name="magnify" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, paddingTop: 20, alignItems: 'center' },
  logo: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  favoritesButton: { backgroundColor: 'rgba(255,255,255,0.1)', width: 45, height: 45, borderRadius: 22.5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  content: { flex: 1, paddingHorizontal: 25, justifyContent: 'center' },
  mainDisplay: { alignItems: 'center', marginBottom: 50 },
  heroTitle: { fontSize: 36, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginTop: 20, lineHeight: 42 },
  searchSection: { width: '100%' },
  inputWrapper: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', paddingLeft: 15, paddingRight: 10, height: 70 },
  locationBtn: { padding: 10, marginRight: 5 },
  input: { flex: 1, color: '#fff', fontSize: 20, fontWeight: '500' },
  searchIconBtn: { backgroundColor: '#3b82f6', width: 50, height: 50, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }
});