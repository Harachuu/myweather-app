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

  // Load both saved unit preferences
  const loadData = async () => {
    try {
      const [storedFavs, storedUnits] = await Promise.all([
        AsyncStorage.getItem('favorites'),
        AsyncStorage.getItem('unit_preference')
      ]);

      if (storedFavs) setList(JSON.parse(storedFavs));
      if (storedUnits) setUnits(storedUnits as 'imperial' | 'metric');
    } catch (e) {
      console.error("Error loading data", e);
    }
  };

  // Save unit preference whenever it changes
  const toggleUnits = async () => {
    const newUnit = units === 'imperial' ? 'metric' : 'imperial';
    setUnits(newUnit);
    await AsyncStorage.setItem('unit_preference', newUnit);
  };

  const removeFav = async (zip: string) => {
    const newList = list.filter((item: any) => item.zip !== zip);
    setList(newList);
    await AsyncStorage.setItem('favorites', JSON.stringify(newList));
  };

  // Convert F to C automatically
  const displayTemp = (temp: number) => {
    if (units === 'imperial') return Math.round(temp);
    return Math.round((temp - 32) * 5 / 9);
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icons.MaterialCommunityIcons name="heart-outline" size={60} color="rgba(255,255,255,0.1)" />
      <Text style={styles.emptyText}>No favorite cities yet.</Text>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icons.MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Favorites</Text>
            
            <TouchableOpacity onPress={toggleUnits} style={styles.unitToggle}>
              <Text style={[styles.unitText, units === 'imperial' && styles.unitActive]}>°F</Text>
              <View style={styles.unitPipe} />
              <Text style={[styles.unitText, units === 'metric' && styles.unitActive]}>°C</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ width: 44 }} /> 
        </View>

        <FlatList 
          data={list}
          keyExtractor={(item: any) => item.zip.toString()}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <TouchableOpacity 
                style={styles.infoArea} 
                onPress={() => router.push({ pathname: '/results', params: { zip: item.zip } })}
              >
                <View>
                  <Text style={styles.name}>{item.name.toUpperCase()}</Text>
                  <Text style={styles.zip}>{item.zip}</Text>
                </View>
                <Text style={styles.temp}>{displayTemp(item.temp)}°</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => removeFav(item.zip)} style={styles.deleteBtn}>
                <Icons.MaterialCommunityIcons name="close-circle" size={22} color="rgba(255,255,255,0.3)" />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20, alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 6 },
  titleContainer: { alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 1 },
  unitToggle: { flexDirection: 'row', alignItems: 'center', marginTop: 5, backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 2, paddingHorizontal: 10, borderRadius: 15 },
  unitText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold' },
  unitActive: { color: '#fff' },
  unitPipe: { width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 6 },
  row: { backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 20, marginBottom: 12, borderRadius: 25, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingRight: 15 },
  infoArea: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  zip: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  temp: { color: '#fff', fontSize: 32, fontWeight: '200' },
  deleteBtn: { padding: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16, marginTop: 15 }
});