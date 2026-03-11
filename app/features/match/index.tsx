import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Alert, SafeAreaView } from 'react-native';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../src/firebase/firebaseConfig';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const db = getFirestore(app);
const auth = getAuth(app);

const DAYS = [
  { day: 'WO', date: '11', month: 'MAA' }, { day: 'DO', date: '12', month: 'MAA' },
  { day: 'VR', date: '13', month: 'MAA' }, { day: 'ZA', date: '14', month: 'MAA' },
  { day: 'ZO', date: '15', month: 'MAA' }
];

const TIMES = ["09:00", "10:30", "12:00", "16:00", "17:30", "19:00", "20:30"];

export default function CreateMatchScreen() {
  const router = useRouter();
  
  // State voor alle verplichte velden
  const [selectedDate, setSelectedDate] = useState(DAYS[0]);
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [club, setClub] = useState('');
  const [minLevel, setMinLevel] = useState('1.5');
  const [maxLevel, setMaxLevel] = useState('3.5');
  const [isCompetitive, setIsCompetitive] = useState(false);
  const [isMixed, setIsMixed] = useState(false);

  const handleCreateMatch = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Fout", "Je moet ingelogd zijn om een match aan te maken.");
    if (!club) return Alert.alert("Fout", "Vul de naam van de club in.");

    try {
      await addDoc(collection(db, "matches"), {
        hostId: user.uid,
        clubName: club,
        levelRange: { min: parseFloat(minLevel), max: parseFloat(maxLevel) },
        date: selectedDate.date,
        month: selectedDate.month,
        time: selectedTime,
        isCompetitive,
        isMixed,
        status: "open",
        players: [user.uid], // Maker is de eerste speler
        createdAt: serverTimestamp(),
      });
      
      Alert.alert("Match Gepubliceerd", "Je match staat nu in de lijst!");
      router.back();
    } catch (error) {
      Alert.alert("Fout", "Er ging iets mis bij het opslaan.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Match aanmaken', headerShadowVisible: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Wanneer wil je spelen?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {DAYS.map((item) => (
            <TouchableOpacity 
              key={item.date} 
              style={[styles.dateCircle, selectedDate.date === item.date && styles.activeBlue]}
              onPress={() => setSelectedDate(item)}
            >
              <Text style={[styles.dateDay, selectedDate.date === item.date && styles.whiteText]}>{item.day}</Text>
              <Text style={[styles.dateNum, selectedDate.date === item.date && styles.whiteText]}>{item.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {TIMES.map((t) => (
            <TouchableOpacity 
              key={t} 
              style={[styles.timeChip, selectedTime === t && styles.activeBlue]}
              onPress={() => setSelectedTime(t)}
            >
              <Text style={[styles.timeText, selectedTime === t && styles.whiteText]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Match Details</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Clubnaam (bijv. Padel 4U2)" 
          value={club} 
          onChangeText={setClub} 
        />

        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Min Level</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={minLevel} onChangeText={setMinLevel} />
          </View>
          <View style={{width: 20}} />
          <View style={{flex: 1}}>
            <Text style={styles.label}>Max Level</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={maxLevel} onChangeText={setMaxLevel} />
          </View>
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Competitieve Match</Text>
            <Text style={styles.switchSub}>Telt mee voor je Play Padel ranking</Text>
          </View>
          <Switch value={isCompetitive} onValueChange={setIsCompetitive} trackColor={{ true: '#0057FF' }} />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Gemengd (Mixed)</Text>
            <Text style={styles.switchSub}>Zowel heren als dames</Text>
          </View>
          <Switch value={isMixed} onValueChange={setIsMixed} trackColor={{ true: '#0057FF' }} />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleCreateMatch}>
          <Text style={styles.submitBtnText}>Match Bevestigen & Betalen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#000' },
  horizontalScroll: { flexDirection: 'row', marginBottom: 15 },
  dateCircle: { width: 62, height: 78, borderRadius: 31, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#EEE' },
  timeChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, backgroundColor: '#F5F5F5', marginRight: 10, borderWidth: 1, borderColor: '#EEE' },
  activeBlue: { backgroundColor: '#0057FF', borderColor: '#0057FF' },
  whiteText: { color: '#FFF' },
  dateDay: { fontSize: 10, color: '#999', fontWeight: 'bold' },
  dateNum: { fontSize: 19, fontWeight: '800' },
  timeText: { fontWeight: '700', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  input: { backgroundColor: '#F5F5F5', padding: 18, borderRadius: 15, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  label: { fontSize: 13, color: '#666', marginBottom: 5, fontWeight: '600' },
  row: { flexDirection: 'row' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  switchTitle: { fontSize: 16, fontWeight: '700' },
  switchSub: { fontSize: 12, color: '#999' },
  submitBtn: { backgroundColor: '#0057FF', padding: 20, borderRadius: 18, alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});