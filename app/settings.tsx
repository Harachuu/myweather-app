import * as Icons from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [alertTime, setAlertTime] = useState('08:00 AM');
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedAlerts = await AsyncStorage.getItem('weather_alerts_enabled');
      const savedTime = await AsyncStorage.getItem('weather_alerts_time');
      if (savedAlerts !== null) setAlertsEnabled(JSON.parse(savedAlerts));
      if (savedTime !== null) setAlertTime(savedTime);
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  };

  const toggleAlerts = async (value: boolean) => {
    setAlertsEnabled(value);
    await AsyncStorage.setItem('weather_alerts_enabled', JSON.stringify(value));
  };

  const selectTime = async (time: string) => {
    setAlertTime(time);
    await AsyncStorage.setItem('weather_alerts_time', time);
  };

  const timeOptions = ['07:00 AM', '08:00 AM', '09:00 AM', '06:00 PM', '08:00 PM'];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Icons.MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <View style={{ width: 45 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
          <View style={styles.glassCard}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Weather Alerts</Text>
                <Text style={styles.settingSub}>Receive daily weather updates</Text>
              </View>
              <Switch 
                value={alertsEnabled} 
                onValueChange={toggleAlerts}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {alertsEnabled && (
            <>
              <Text style={styles.sectionLabel}>ALERT TIME</Text>
              <View style={styles.glassCard}>
                {timeOptions.map((time, index) => (
                  <View key={time}>
                    <TouchableOpacity 
                      style={styles.timeOption} 
                      onPress={() => selectTime(time)}
                    >
                      <Text style={[styles.timeText, alertTime === time && styles.activeTimeText]}>
                        {time}
                      </Text>
                      {alertTime === time && (
                        <Icons.MaterialCommunityIcons name="check" size={20} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                    {index < timeOptions.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  iconBtn: { backgroundColor: 'rgba(255,255,255,0.1)', width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  sectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 'bold', marginBottom: 10, marginTop: 20, letterSpacing: 1 },
  glassCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  settingTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  settingSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  timeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  timeText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  activeTimeText: { color: '#fff', fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 20 }
});