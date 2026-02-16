import * as Icons from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const [list, setList] = useState([]);
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial'); 
  const router = useRouter();

  const loadData = async () => {
    try {
      const [storedFavs, storedUnits] = await Promise.all([
        AsyncStorage.getItem('favorites'),
        AsyncStorage.getItem('unit_preference')
      ]);
      if (storedFavs) setList(JSON.parse(storedFavs));
      if (storedUnits) setUnits(storedUnits as 'imperial' | 'metric');
    } catch (e) { console.error("Error loading data", e); }
  };

  // RESTORED: Unit toggle logic for Favorites page
  const toggleUnits = async () => {
    const newUnit = units === 'imperial' ? 'metric' : 'imperial';
    setUnits(newUnit);
    await AsyncStorage.setItem('unit_preference', newUnit);
  };

  const removeFav = async (name: string) => {
    const newList = list.filter((item: any) => item.name !== name);
    setList(newList);
    await AsyncStorage.setItem('favorites', JSON.stringify(newList));
  };

  useEffect(() => { loadData(); }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Icons.MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>FAVORITES</Text>
          
          <View style={styles.headerRight}>
            {/* RESTORED: Unit toggle button next to settings cog */}
            <TouchableOpacity onPress={toggleUnits} style={[styles.iconBtn, { marginRight: 10 }]}>
              <Text style={styles.unitBtnText}>{units === 'imperial' ? '°F' : '°C'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn}>
              <Icons.MaterialCommunityIcons name="cog" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList 
          data={list}
          keyExtractor={(item: any) => item.name}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.glassCard}>
              <TouchableOpacity 
                style={styles.cardContent} 
                onPress={() => router.push({ 
                  pathname: '/results', 
                  params: { zip: item.zip, lat: item.lat, lon: item.lon } 
                })}
              >
                <View>
                  <Text style={styles.cityName}>{item.name.toUpperCase()}</Text>
                  <Text style={styles.zipText}>{item.zip || 'Current Location'}</Text>
                </View>
                <Text style={styles.tempText}>
                  {Math.round(units === 'imperial' ? item.temp : (item.temp - 32) * 5 / 9)}°
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeFav(item.name)} style={styles.deleteBtn}>
                <Icons.MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 20, 
    alignItems: 'center' 
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    width: 45, 
    height: 45, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  unitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  glassCard: { 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    marginBottom: 15, 
    borderRadius: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.15)', 
    paddingRight: 10 
  },
  cardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  cityName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  zipText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  tempText: { color: '#fff', fontSize: 36, fontWeight: '200' },
  deleteBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(255,255,255,0.05)' 
  }
});