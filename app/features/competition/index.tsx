import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';
import { app } from '../../../src/firebase/firebaseConfig'; 
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

const db = getFirestore(app);

export default function CompetitionScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Luister live naar alle matchen die 'open' zijn
    const q = query(collection(db, "matches"), where("status", "==", "open"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(docs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderMatchCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <View style={styles.cardContent}>
        {/* Tijd & Datum */}
        <View style={styles.leftPart}>
          <Text style={styles.timeText}>{item.time}</Text>
          <Text style={styles.dateText}>{item.date} {item.month}</Text>
        </View>

        {/* Club Info */}
        <View style={styles.middlePart}>
          <Text style={styles.clubName} numberOfLines={1}>{item.clubName}</Text>
          <View style={styles.tagRow}>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>Lvl {item.levelRange?.min} - {item.levelRange?.max}</Text>
            </View>
            {item.isCompetitive && (
              <View style={[styles.levelTag, { backgroundColor: '#FFF0F0' }]}>
                <Text style={[styles.levelTagText, { color: '#FF4B4B' }]}>🏆 PRO</Text>
              </View>
            )}
          </View>
        </View>

        {/* Speler indicator */}
        <View style={styles.rightPart}>
          <View style={styles.playerBadge}>
            <Text style={styles.playerNum}>{item.players?.length || 1}/4</Text>
          </View>
          <Text style={styles.playerSub}>spelers</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Boek een match', headerShadowVisible: false }} />
      {loading ? (
        <ActivityIndicator size="small" color="#0057FF" style={{marginTop: 30}} />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchCard}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>Geen beschikbare wedstrijden gevonden.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  leftPart: { paddingRight: 15, borderRightWidth: 1, borderRightColor: '#F0F0F0', minWidth: 75, alignItems: 'center' },
  timeText: { fontSize: 18, fontWeight: '700', color: '#000' },
  dateText: { fontSize: 11, color: '#999', fontWeight: 'bold', marginTop: 2 },
  middlePart: { flex: 1, paddingHorizontal: 15 },
  clubName: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 5 },
  tagRow: { flexDirection: 'row', gap: 6 },
  levelTag: { backgroundColor: '#E7F0FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  levelTagText: { color: '#0057FF', fontSize: 11, fontWeight: '700' },
  rightPart: { alignItems: 'center' },
  playerBadge: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#0057FF', justifyContent: 'center', alignItems: 'center' },
  playerNum: { fontSize: 12, fontWeight: '800', color: '#0057FF' },
  playerSub: { fontSize: 10, color: '#999', marginTop: 4, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});