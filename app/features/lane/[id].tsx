import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import {
  getFirestore, collection, query, where,
  getDocs, onSnapshot, addDoc, doc, setDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../src/firebase/firebaseConfig';
import { useLocalSearchParams, Stack } from 'expo-router';

const db = getFirestore(app);
const auth = getAuth(app);

// 📅 dagen
const DAYS_NL = ['ZO', 'MA', 'DI', 'WO', 'DO', 'VR', 'ZA'];
const MONTHS_NL = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];

const generateDays = () => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const fullDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    days.push({
      date: d.getDate(),
      month: MONTHS_NL[d.getMonth()],
      day: DAYS_NL[d.getDay()],
      fullDate,
    });
  }

  return days;
};

type Slot = {
  id: string;
  startTime: string;
  date: string;
  isBooked: boolean;
};

export default function LocationBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const locationId = Array.isArray(id) ? id[0] : id;

  const DAYS = generateDays();

  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  // ⏰ slots genereren
  const generateSlotsForDay = async (date: string) => {
    const times: string[] = [];

    for (let h = 8; h < 22; h++) {
      times.push(`${String(h).padStart(2, '0')}:00`);
      times.push(`${String(h).padStart(2, '0')}:30`);
    }

    for (const t of times) {
      await addDoc(collection(db, 'locations', locationId!, 'timeslots'), {
        startTime: t,
        date,
        isBooked: false,
      });
    }
  };

  const ensureSlotsExist = async (date: string) => {
    const q = query(
      collection(db, 'locations', locationId!, 'timeslots'),
      where('date', '==', date)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      await generateSlotsForDay(date);
    }
  };

  // 📥 realtime slots
  useEffect(() => {
    if (!locationId || !selectedDay) return;

    const init = async () => {
      setLoading(true);
      await ensureSlotsExist(selectedDay.fullDate);

      const q = query(
        collection(db, 'locations', locationId!, 'timeslots'),
        where('date', '==', selectedDay.fullDate)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Slot[];

        data.sort((a, b) => a.startTime.localeCompare(b.startTime));

        setSlots(data);
        setLoading(false);
      });

      return unsubscribe;
    };

    init();
  }, [locationId, selectedDay]);

  // 🎯 select slot
  const handleSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setSelectedDuration(null);
  };

  // 🔥 boeking
  const handleBooking = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert('Fout', 'Niet ingelogd');

    if (!selectedSlot || !selectedDuration) {
      return Alert.alert('Fout', 'Kies tijd en duur');
    }

    const slotsNeeded = selectedDuration === 60 ? 2 : 3;

    const startIndex = slots.findIndex(s => s.id === selectedSlot.id);
    const selected = slots.slice(startIndex, startIndex + slotsNeeded);

    if (selected.length < slotsNeeded) {
      return Alert.alert('Fout', 'Niet genoeg slots');
    }

    if (selected.some(s => s.isBooked)) {
      return Alert.alert('Bezet', 'Een deel is al geboekt');
    }

    try {
      for (const s of selected) {
        await setDoc(
          doc(db, 'locations', locationId!, 'timeslots', s.id),
          {
            ...s,
            isBooked: true,
            bookedBy: user.uid,
          }
        );
      }

      Alert.alert('Succes', 'Boeking bevestigd!');
      setSelectedSlot(null);
      setSelectedDuration(null);

    } catch {
      Alert.alert('Fout', 'Boeking mislukt');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Boek locatie' }} />

      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionTitle}>Wanneer</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DAYS.map(d => {
            const isSelected = selectedDay.fullDate === d.fullDate;

            return (
              <TouchableOpacity
                key={d.fullDate}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayActive
                ]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[styles.dayText, isSelected && styles.textWhite]}>
                  {d.day}
                </Text>

                <Text style={[
                  styles.dayNum,
                  isSelected && styles.textWhite
                ]}>
                  {d.date}
                </Text>

                <Text style={[styles.dayText, isSelected && styles.textWhite]}>
                  {d.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Tijdslots</Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.grid}>
            {slots.map(slot => {
              const isSelected = selectedSlot?.id === slot.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slot,
                    slot.isBooked && styles.booked,
                    isSelected && styles.selectedSlot,
                  ]}
                  disabled={slot.isBooked}
                  onPress={() => handleSelect(slot)}
                >
                  <Text style={[
                    styles.timeText,
                    slot.isBooked && styles.bookedText,
                    isSelected && styles.textWhite
                  ]}>
                    {slot.startTime}
                  </Text>

                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 🔥 BOOKING UI */}
        {selectedSlot && (
          <View style={styles.bookingBox}>

            <Text style={styles.bookingTitle}>
              Gekozen: {selectedSlot.startTime}
            </Text>

            <View style={styles.durationRow}>
              {[60, 90].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.durationBtn,
                    selectedDuration === d && styles.durationActive
                  ]}
                  onPress={() => setSelectedDuration(d)}
                >
                  <Text style={[
                    styles.durationText,
                    selectedDuration === d && styles.textWhite
                  ]}>
                    {d} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                !selectedDuration && { opacity: 0.5 }
              ]}
              disabled={!selectedDuration}
              onPress={handleBooking}
            >
              <Text style={styles.confirmText}>Boek nu</Text>
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },

  sectionTitle: {
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },

  dayCard: {
    padding: 15,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderColor:'#eee',
    borderWidth:0.5,
    alignItems: 'center',
  },
  dayText:{
    fontSize:10,
    fontWeight:'500',
    color:'grey'
  },
  dayNum: { fontSize: 22, fontWeight: '800', color: '#111', marginVertical: 2 },
  dayActive: {
    backgroundColor: '#0057FF',
    color:'white'
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  slot: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 12, backgroundColor: '#F5F5F5',
    borderWidth: 0.5, borderColor: '#eee', alignItems: 'center',
  },
  timeText: { fontSize: 13, fontWeight: '700', color: '#333' },
  selectedSlot: {
    backgroundColor: '#0057FF',
    color:'white'
  },

  booked: {
    backgroundColor: '#ddd',
  },

  bookedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  badge: {
    fontSize: 10,
    color: 'red',
  },

  bookingBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
  },

  bookingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  durationRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  durationBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#E7F0FF',
    alignItems: 'center',
  },

  durationActive: {
    backgroundColor: '#0057FF',
  },

  durationText: {
    fontWeight: '700',
  },

  confirmBtn: {
    backgroundColor: '#0057FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },

  textWhite: {
    color: '#fff',
  },
});