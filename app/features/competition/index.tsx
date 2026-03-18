import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';
import { app } from '../../../src/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';

const db = getFirestore(app);

export default function CompetitionScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'matches'), where('status', '==', 'open'));
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
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: '/features/match/chat',
        params: { matchId: item.id },
      })}
    >
      <View style={styles.cardContent}>

        <View style={styles.leftPart}>
          <Text style={styles.timeText}>{item.time}</Text>
          <Text style={styles.dateText}>{item.date} {item.month}</Text>
        </View>

        <View style={styles.middlePart}>
          <Text style={styles.clubName} numberOfLines={1}>{item.clubName}</Text>
          <Text style={styles.clubCity} numberOfLines={1}>{item.clubCity}</Text>
          <View style={styles.tagRow}>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>
                Lvl {item.levelRange?.min} - {item.levelRange?.max}
              </Text>
            </View>
            {item.isCompetitive && (
              <View style={[styles.levelTag, { backgroundColor: '#FFF0F0' }]}>
                <Text style={[styles.levelTagText, { color: '#FF4B4B' }]}>🏆 PRO</Text>
              </View>
            )}
            {item.isMixed && (
              <View style={[styles.levelTag, { backgroundColor: '#F3E5F5' }]}>
                <Text style={[styles.levelTagText, { color: '#9C27B0' }]}>Mixed</Text>
              </View>
            )}
          </View>
          <View style={styles.chatHint}>
            <Ionicons name="chatbubble-outline" size={13} color="#bbb" />
            <Text style={styles.chatHintText}>Chat</Text>
          </View>
        </View>

        <View style={styles.rightPart}>
          <View style={[
            styles.playerBadge,
            item.players?.length === 4 && { borderColor: '#4CAF50' },
          ]}>
            <Text style={[
              styles.playerNum,
              item.players?.length === 4 && { color: '#4CAF50' },
            ]}>
              {item.players?.length || 1}/4
            </Text>
          </View>
          <Text style={styles.playerSub}>spelers</Text>
        </View>

      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Wedstrijden', headerShadowVisible: false }} />
      {loading ? (
        <ActivityIndicator size="small" color="#0057FF" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchCard}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="tennisball-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>Geen wedstrijden gevonden</Text>
              <Text style={styles.emptySub}>Maak zelf een match aan!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  leftPart: {
    paddingRight: 15, borderRightWidth: 1, borderRightColor: '#F0F0F0',
    minWidth: 75, alignItems: 'center',
  },
  timeText: { fontSize: 18, fontWeight: '700', color: '#000' },
  dateText: { fontSize: 11, color: '#999', fontWeight: 'bold', marginTop: 2 },
  middlePart: { flex: 1, paddingHorizontal: 15 },
  clubName: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 2 },
  clubCity: { fontSize: 12, color: '#999', marginBottom: 6 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  levelTag: {
    backgroundColor: '#E7F0FF', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 5,
  },
  levelTagText: { color: '#0057FF', fontSize: 11, fontWeight: '700' },
  chatHint: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  chatHintText: { fontSize: 11, color: '#bbb' },
  rightPart: { alignItems: 'center' },
  playerBadge: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2, borderColor: '#0057FF',
    justifyContent: 'center', alignItems: 'center',
  },
  playerNum: { fontSize: 12, fontWeight: '800', color: '#0057FF' },
  playerSub: { fontSize: 10, color: '#999', marginTop: 4, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#ccc' },
  emptySub: { fontSize: 13, color: '#ddd' },
});