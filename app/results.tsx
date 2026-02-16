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
  const { zip } = useLocalSearchParams();
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
    const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
    if (!apiKey) {
      Alert.alert("Error", "API Key missing.");
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

  // Attire Recommendation Logic
  const getAttire = () => {
    if (!weather) return { icon: 'tshirt-crew', value: 'Loading...' };
    const temp = weather.main.temp;
    const isImperial = units === 'imperial';
    const condition = weather.weather[0].main.toLowerCase();
    const windSpeed = weather.wind.speed;

    // 1. Rain/Storm Priority
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
      return { icon: 'umbrella', value: 'Recommend an umbrella' };
    }
    // 2. Wind Priority
    if ((isImperial && windSpeed > 15) || (!isImperial && windSpeed > 6.7)) {
      return { icon: 'weather-windy-variant', value: 'Recommend a jacket' };
    }
    // 3. Hot
    if ((isImperial && temp > 80) || (!isImperial && temp > 26.6)) {
      return { icon: 'sunglasses', value: 'Recommend sun protection' };
    }
    // 4. Cold
    if ((isImperial && temp < 45) || (!isImperial && temp < 7.2)) {
      return { icon: 'snowflake', value: 'Recommend heavy layers' };
    }
    // 5. Default Cool
    return { icon: 'tshirt-crew', value: 'Recommend light layers' };
  };

  if (loading && !weather) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const dynamicBg = getBackgroundColor(weather.weather[0].icon);
  const weatherIconName = getWeatherIcon(weather.weather[0].icon);
  const attire = getAttire();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: dynamicBg }]}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Icons.MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
            <Icons.MaterialCommunityIcons 
              name={isSaved ? "heart" : "heart-outline"} 
              size={26} 
              color={isSaved ? "#ff4757" : "#fff"} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading && !!weather} onRefresh={() => fetchWeather()} tintColor="#fff" />}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.city}>{weather.name}</Text>
            <Text style={styles.temp}>{Math.round(weather.main.temp)}°</Text>
            
            <Text style={styles.feelsLikeText}>FEELS LIKE {Math.round(weather.main.feels_like)}°</Text>
            
            <View style={styles.conditionContainer}>
              <Icons.MaterialCommunityIcons name={weatherIconName} size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.desc}>{weather.weather[0].description}</Text>
            </View>
          </View>

          {/* Grid Section */}
          <View style={styles.grid}>
            <DetailTile icon="water-outline" label="Humidity" value={`${weather.main.humidity}%`} />
            <DetailTile icon="weather-windy" label="Wind Speed" value={`${Math.round(weather.wind.speed)} ${units === 'imperial' ? 'mph' : 'm/s'}`} />
            
            {/* New Attire Recommendation Cell */}
            <DetailTile 
                icon={attire.icon} 
                label="Attire" 
                value={attire.value} 
                isWide={true} 
            />
            
            <DetailTile icon="altimeter" label="Pressure" value={`${weather.main.pressure} hPa`} />
            <DetailTile icon="weather-sunset-up" label="Sunrise" value={formatTime(weather.sys.sunrise)} />
            <DetailTile icon="weather-sunset-down" label="Sunset" value={formatTime(weather.sys.sunset)} />
          </View>

          <TouchableOpacity style={styles.glassActionBtn} onPress={toggleUnits}>
            <Text style={styles.glassActionText}>
               Switch to {units === 'imperial' ? 'Celsius' : 'Fahrenheit'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const DetailTile = ({ icon, label, value, isWide }: any) => (
  <View style={[styles.tile, isWide && { width: '100%' }]}>
    <Icons.MaterialCommunityIcons name={icon} size={22} color="rgba(255,255,255,0.7)" />
    <View style={styles.tileTextContainer}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileVal} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  nav: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 10 
  },
  iconBtn: { 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    padding: 8, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  heroSection: { alignItems: 'center', marginTop: 30, marginBottom: 40 },
  city: { color: '#fff', fontSize: 32, fontWeight: '300', letterSpacing: 1 },
  temp: { color: '#fff', fontSize: 100, fontWeight: 'bold', marginTop: 10 },
  feelsLikeText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '600', marginBottom: 15, letterSpacing: 1 },
  conditionContainer: { flexDirection: 'row', alignItems: 'center' },
  desc: { color: 'rgba(255,255,255,0.8)', fontSize: 20, textTransform: 'capitalize' },
  
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  tile: { 
    backgroundColor: 'rgba(255,255,255,0.12)', 
    padding: 20, 
    borderRadius: 24, 
    width: '48%', 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  tileTextContainer: { marginLeft: 12, flex: 1 },
  tileLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  tileVal: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  
  glassActionBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  glassActionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});