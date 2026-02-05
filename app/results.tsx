import * as Icons from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');
const isSmallPhone = height < 700;

const getBackgroundColor = (icon: string) => {
  if (!icon) return '#0f172a';
  const isNight = icon.endsWith('n');
  if (icon.startsWith('01')) return isNight ? '#1e293b' : '#38bdf8';
  if (icon.startsWith('02') || icon.startsWith('03') || icon.startsWith('04')) return isNight ? '#334155' : '#94a3b8';
  if (icon.startsWith('09') || icon.startsWith('10')) return '#475569';
  if (icon.startsWith('11')) return '#1e1b4b';
  if (icon.startsWith('13')) return '#cbd5e1';
  return '#0f172a';
};

const getWeatherIcon = (icon: string) => {
  if (icon.startsWith('01')) return 'weather-sunny';
  if (icon.startsWith('02')) return 'weather-partly-cloudy';
  if (icon.startsWith('03') || icon.startsWith('04')) return 'weather-cloudy';
  if (icon.startsWith('09') || icon.startsWith('10')) return 'weather-rainy';
  if (icon.startsWith('11')) return 'weather-lightning';
  if (icon.startsWith('13')) return 'weather-snowy';
  return 'weather-cloudy';
};

export default function ResultsScreen() {
  const { zip } = useLocalSearchParams(); // Syncing with Search Screen
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial');
  const router = useRouter();

  const initialLoad = async () => {
    try {
      const storedUnits = await AsyncStorage.getItem('unit_preference');
      if (storedUnits) setUnits(storedUnits as 'imperial' | 'metric');
    } catch (e) {
      console.log("Error loading units", e);
    }
  };

  const fetchWeather = async (activeUnits = units) => {
    // SECURE KEY FETCH
    const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
    
    if (!apiKey) {
      Alert.alert("Error", "API Key missing. Restart Expo with -c");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=${activeUnits}&appid=${apiKey}`
      );
      const data = await response.json();
      
      if (data.cod === 200) {
        setWeather(data);
        const stored = await AsyncStorage.getItem('favorites');
        if (stored) {
          const list = JSON.parse(stored);
          setIsSaved(list.some((f: any) => f.zip === zip));
        }
      } else {
        Alert.alert("Error", data.message || "Zipcode not found", [{ text: "Go Back", onPress: () => router.back() }]);
      }
    } catch (e) {
      Alert.alert("Error", "Network failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialLoad().then(() => {
      if (zip) fetchWeather();
    });
  }, [zip, units]);

  const toggleUnits = async () => {
    const newUnit = units === 'imperial' ? 'metric' : 'imperial';
    setUnits(newUnit);
    await AsyncStorage.setItem('unit_preference', newUnit);
  };

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      let list = stored ? JSON.parse(stored) : [];
      if (isSaved) {
        list = list.filter((f: any) => f.zip !== zip);
        setIsSaved(false);
      } else { 
        let tempToSave = Math.round(weather.main.temp);
        if (units === 'metric') tempToSave = Math.round((tempToSave * 9/5) + 32);
        list.push({ zip, name: weather.name, temp: tempToSave });
        setIsSaved(true);
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(list));
    } catch (e) {
      Alert.alert("Error", "Could not update favorites");
    }
  };

  const formatTime = (ts: number) => 
    new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading && !weather) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{color: '#fff', marginTop: 10}}>Loading {zip}...</Text>
      </View>
    );
  }

  const dynamicBg = getBackgroundColor(weather.weather[0].icon);
  const weatherIconName = getWeatherIcon(weather.weather[0].icon);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: dynamicBg }]}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Icons.MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.navRight}>
            <TouchableOpacity onPress={() => router.push('/favorites')} style={[styles.iconBtn, { marginRight: 10 }]}>
              <Icons.MaterialCommunityIcons name="format-list-bulleted" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
              <Icons.MaterialCommunityIcons 
                name={isSaved ? "heart" : "heart-plus"} 
                size={24} 
                color={isSaved ? "#ff4757" : "#fff"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading && !!weather} onRefresh={() => fetchWeather()} tintColor="#fff" />}
        >
          <View style={styles.glassHeader}>
            <Text style={styles.city}>{weather.name.toUpperCase()}</Text>
            
            <TouchableOpacity onPress={toggleUnits} style={styles.unitToggle}>
              <Text style={[styles.unitText, units === 'imperial' && styles.unitActive]}>°F</Text>
              <View style={styles.unitPipe} />
              <Text style={[styles.unitText, units === 'metric' && styles.unitActive]}>°C</Text>
            </TouchableOpacity>

            <View style={styles.glassDivider} />
            <Text style={styles.zipLabel}>{zip}</Text>
          </View>

          <View style={styles.mainWeatherSection}>
            <Icons.MaterialCommunityIcons name={weatherIconName} size={isSmallPhone ? 60 : 80} color="#fff" />
            <Text style={styles.temp}>{Math.round(weather.main.temp)}°</Text>
            <Text style={styles.desc}>{weather.weather[0].description.toUpperCase()}</Text>
            <Text style={styles.feelsLike}>FEELS LIKE {Math.round(weather.main.feels_like)}°</Text>
          </View>

          <View style={styles.grid}>
            <DetailCard icon="weather-sunny" label="SUNRISE" value={formatTime(weather.sys.sunrise)} color="#fbbf24" />
            <DetailCard icon="weather-night" label="SUNSET" value={formatTime(weather.sys.sunset)} color="#818cf8" />
            <DetailCard icon="water-percent" label="HUMIDITY" value={`${weather.main.humidity}%`} color="#3b82f6" />
            <DetailCard 
              icon="weather-windy" 
              label="WIND" 
              value={`${Math.round(weather.wind.speed)} ${units === 'imperial' ? 'mph' : 'm/s'}`} 
              color="#f87171" 
            />
          </View>

          <TouchableOpacity 
            style={[styles.bigBtn, isSaved && styles.bigBtnActive]} 
            onPress={toggleFavorite}
          >
            <Text style={styles.bigBtnText}>{isSaved ? "REMOVE FROM FAVORITES" : "ADD TO FAVORITES"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const DetailCard = ({ icon, label, value, color }: any) => (
  <View style={styles.card}>
    <Icons.MaterialCommunityIcons name={icon} size={18} color={color} />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.val}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, zIndex: 10 },
  navRight: { flexDirection: 'row' },
  iconBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 15 },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', paddingBottom: 30, paddingTop: 10 },
  glassHeader: { backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', width: '85%', marginVertical: 10 },
  unitToggle: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: 'rgba(0,0,0,0.3)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  unitText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 'bold' },
  unitActive: { color: '#fff' },
  unitPipe: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
  glassDivider: { height: 1, width: '50%', backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 8 },
  zipLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: '500' },
  city: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  mainWeatherSection: { alignItems: 'center', marginVertical: 10 },
  temp: { color: '#fff', fontSize: isSmallPhone ? 60 : 75, fontWeight: '200' },
  feelsLike: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 'bold' },
  desc: { color: 'rgba(255,255,255,0.8)', fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', paddingHorizontal: 20, justifyContent: 'space-between', marginVertical: 10 },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', padding: 12, borderRadius: 20, width: '48%', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 'bold', marginTop: 4 },
  val: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bigBtn: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 20, width: '85%', alignItems: 'center', marginTop: 10 },
  bigBtnActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: '#ff4757' },
  bigBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});