import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, ActivityIndicator
} from 'react-native';
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../src/firebase/firebaseConfig';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const db = getFirestore(app);
const auth = getAuth(app);

// ── Hardcoded clubs ───────────────────────────────────────
const CLUBS = [
  { id: '1', name: 'Padel 4U2',           city: 'Antwerpen' },
  { id: '2', name: 'Smash Padel Club',     city: 'Gent' },
  { id: '3', name: 'Padel Arena Brussels', city: 'Brussel' },
  { id: '4', name: 'Royal Padel Club',     city: 'Brugge' },
  { id: '5', name: 'Padel One',            city: 'Leuven' },
  { id: '6', name: 'The Padel Factory',    city: 'Mechelen' },
];

const TIMES = ['09:00', '10:30', '12:00', '14:00', '16:00', '17:30', '19:00', '20:30'];

const DAYS_NL = ['ZO', 'MA', 'DI', 'WO', 'DO', 'VR', 'ZA'];
const MONTHS_NL = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];

// Genereer de komende 14 dagen dynamisch
const generateDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d.getDate(),
      month: MONTHS_NL[d.getMonth()],
      day: DAYS_NL[d.getDay()],
      fullDate: d.toISOString().split('T')[0], // "2026-03-18"
    });
  }
  return days;
};

const LEVEL_OPTIONS = ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0'];

export default function CreateMatchScreen() {
  const router = useRouter();
  const DAYS = generateDays();

  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<typeof CLUBS[0] | null>(null);
  const [minLevel, setMinLevel] = useState('1.0');
  const [maxLevel, setMaxLevel] = useState('3.0');
  const [isCompetitive, setIsCompetitive] = useState(false);
  const [isMixed, setIsMixed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);

  // Laad bezette tijdsloten wanneer dag of club verandert
  useEffect(() => {
    if (!selectedDay || !selectedClub) return;
    loadTakenSlots(selectedDay.fullDate, selectedClub.id);
  }, [selectedDay, selectedClub]);

  const loadTakenSlots = async (date: string, clubId: string) => {
    try {
      const q = query(
        collection(db, 'matches'),
        where('fullDate', '==', date),
        where('clubId', '==', clubId),
        where('status', '==', 'open')
      );
      const snap = await getDocs(q);
      const taken = snap.docs.map(d => d.data().time as string);
      setTakenSlots(taken);
      // Reset geselecteerde tijd als die nu bezet is
      if (selectedTime && taken.includes(selectedTime)) setSelectedTime(null);
    } catch (e) {
      console.warn('Kon tijdsloten niet laden:', e);
    }
  };

  const handleCreateMatch = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert('Fout', 'Je moet ingelogd zijn.');
    if (!selectedTime) return Alert.alert('Fout', 'Kies een tijdstip.');
    if (!selectedClub) return Alert.alert('Fout', 'Kies een club.');
    if (parseFloat(minLevel) >= parseFloat(maxLevel))
      return Alert.alert('Fout', 'Min niveau moet lager zijn dan max niveau.');

    setLoading(true);
    try {
      // Dubbelcheck of slot nog vrij is
      const q = query(
        collection(db, 'matches'),
        where('fullDate', '==', selectedDay.fullDate),
        where('clubId', '==', selectedClub.id),
        where('time', '==', selectedTime),
        where('status', '==', 'open')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        await loadTakenSlots(selectedDay.fullDate, selectedClub.id);
        return Alert.alert('Bezet', 'Dit tijdslot is net ingenomen. Kies een ander tijdstip.');
      }

      await addDoc(collection(db, 'matches'), {
        hostId: user.uid,
        clubId: selectedClub.id,
        clubName: selectedClub.name,
        clubCity: selectedClub.city,
        levelRange: { min: parseFloat(minLevel), max: parseFloat(maxLevel) },
        date: selectedDay.date,
        month: selectedDay.month,
        time: selectedTime,
        fullDate: selectedDay.fullDate,
        isCompetitive,
        isMixed,
        status: 'open',
        players: [user.uid],
        createdAt: serverTimestamp(),
      });

      Alert.alert('Match gepubliceerd!', 'Je match staat nu in de lijst.');
      router.back();
    } catch (e) {
      Alert.alert('Fout', 'Er ging iets mis bij het opslaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Match aanmaken', headerShadowVisible: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Datum ── */}
        <Text style={styles.sectionTitle}>Wanneer</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
          {DAYS.map((item) => (
            <TouchableOpacity
              key={item.fullDate}
              style={[styles.dayCard, selectedDay.fullDate === item.fullDate && styles.dayCardActive]}
              onPress={() => setSelectedDay(item)}
            >
              <Text style={[styles.dayName, selectedDay.fullDate === item.fullDate && styles.textWhite]}>
                {item.day}
              </Text>
              <Text style={[styles.dayNum, selectedDay.fullDate === item.fullDate && styles.textWhite]}>
                {item.date}
              </Text>
              <Text style={[styles.dayMonth, selectedDay.fullDate === item.fullDate && styles.textWhiteLight]}>
                {item.month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Tijdslot ── */}
        <Text style={styles.sectionTitle}>Tijdslot</Text>
        {!selectedClub && (
          <Text style={styles.hint}>Kies eerst een club om beschikbaarheid te zien</Text>
        )}
        <View style={styles.timeGrid}>
          {TIMES.map((t) => {
            const isTaken = takenSlots.includes(t);
            const isSelected = selectedTime === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.timeChip,
                  isSelected && styles.timeChipActive,
                  isTaken && styles.timeChipTaken,
                ]}
                onPress={() => !isTaken && setSelectedTime(t)}
                disabled={isTaken}
              >
                <Text style={[
                  styles.timeText,
                  isSelected && styles.textWhite,
                  isTaken && styles.timeTextTaken,
                ]}>
                  {t}
                </Text>
                {isTaken && <Text style={styles.takenLabel}>bezet</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Club ── */}
        <Text style={styles.sectionTitle}>Club</Text>
        <View style={styles.clubList}>
          {CLUBS.map((club) => {
            const isSelected = selectedClub?.id === club.id;
            return (
              <TouchableOpacity
                key={club.id}
                style={[styles.clubCard, isSelected && styles.clubCardActive]}
                onPress={() => setSelectedClub(club)}
              >
                <View style={[styles.clubIcon, isSelected && styles.clubIconActive]}>
                  <Ionicons name="location" size={18} color={isSelected ? '#fff' : '#0057FF'} />
                </View>
                <View style={styles.clubInfo}>
                  <Text style={[styles.clubName, isSelected && styles.textWhite]}>{club.name}</Text>
                  <Text style={[styles.clubCity, isSelected && styles.textWhiteLight]}>{club.city}</Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Niveau ── */}
        <Text style={styles.sectionTitle}>Niveau range</Text>
        <View style={styles.levelRow}>
          <View style={styles.levelBox}>
            <Text style={styles.levelLabel}>Min niveau</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {LEVEL_OPTIONS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.levelChip, minLevel === l && styles.levelChipActive]}
                  onPress={() => setMinLevel(l)}
                >
                  <Text style={[styles.levelChipText, minLevel === l && styles.textWhite]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={styles.levelBox}>
          <Text style={styles.levelLabel}>Max niveau</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {LEVEL_OPTIONS.map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.levelChip, maxLevel === l && styles.levelChipActive]}
                onPress={() => setMaxLevel(l)}
              >
                <Text style={[styles.levelChipText, maxLevel === l && styles.textWhite]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Opties ── */}
        <View style={styles.switchCard}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Competitieve match</Text>
              <Text style={styles.switchSub}>Telt mee voor je ranking</Text>
            </View>
            <Switch
              value={isCompetitive}
              onValueChange={setIsCompetitive}
              trackColor={{ true: '#0057FF' }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Gemengd (Mixed)</Text>
              <Text style={styles.switchSub}>Zowel heren als dames</Text>
            </View>
            <Switch
              value={isMixed}
              onValueChange={setIsMixed}
              trackColor={{ true: '#0057FF' }}
            />
          </View>
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleCreateMatch} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Match bevestigen & betalen</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingBottom: 48 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12, marginTop: 20 },
  hint: { fontSize: 13, color: '#bbb', marginBottom: 10, fontStyle: 'italic' },

  hScroll: { marginBottom: 4 },
  dayCard: {
    width: 58, borderRadius: 14, padding: 10,
    alignItems: 'center', marginRight: 10,
    backgroundColor: '#F5F5F5', borderWidth: 0.5, borderColor: '#eee',
  },
  dayCardActive: { backgroundColor: '#0057FF', borderColor: '#0057FF' },
  dayName: { fontSize: 10, fontWeight: '700', color: '#999' },
  dayNum: { fontSize: 22, fontWeight: '800', color: '#111', marginVertical: 2 },
  dayMonth: { fontSize: 10, fontWeight: '600', color: '#999' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  timeChip: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 12, backgroundColor: '#F5F5F5',
    borderWidth: 0.5, borderColor: '#eee',
    alignItems: 'center',
  },
  timeChipActive: { backgroundColor: '#0057FF', borderColor: '#0057FF' },
  timeChipTaken: { backgroundColor: '#F0F0F0', borderColor: '#eee' },
  timeText: { fontSize: 13, fontWeight: '700', color: '#333' },
  timeTextTaken: { color: '#ccc', textDecorationLine: 'line-through' },
  takenLabel: { fontSize: 9, color: '#FF4B4B', marginTop: 2, fontWeight: '600' },

  clubList: { gap: 10 },
  clubCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: '#eee',
  },
  clubCardActive: { backgroundColor: '#0057FF', borderColor: '#0057FF' },
  clubIcon: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: '#E7F0FF',
    justifyContent: 'center', alignItems: 'center',
  },
  clubIconActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  clubInfo: { flex: 1 },
  clubName: { fontSize: 15, fontWeight: '700', color: '#111' },
  clubCity: { fontSize: 12, color: '#999', marginTop: 2 },

  levelRow: { marginBottom: 12 },
  levelBox: { marginBottom: 12 },
  levelLabel: { fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 8 },
  levelChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#F5F5F5',
    marginRight: 8, borderWidth: 0.5, borderColor: '#eee',
  },
  levelChipActive: { backgroundColor: '#0057FF', borderColor: '#0057FF' },
  levelChipText: { fontSize: 13, fontWeight: '700', color: '#333' },

  switchCard: {
    backgroundColor: '#F7F7F7', borderRadius: 16,
    padding: 4, marginTop: 8, borderWidth: 0.5, borderColor: '#eee',
  },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  switchTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  switchSub: { fontSize: 12, color: '#999', marginTop: 2 },
  divider: { height: 0.5, backgroundColor: '#eee', marginHorizontal: 16 },

  submitBtn: {
    backgroundColor: '#0057FF', borderRadius: 16,
    padding: 18, alignItems: 'center', marginTop: 24,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  textWhite: { color: '#fff' },
  textWhiteLight: { color: 'rgba(255,255,255,0.7)' },
});