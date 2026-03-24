import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../../../src/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';

// ✅ Type
type Location = {
  id: string;
  name?: string;
  address?: string;
};

const db = getFirestore(app);

export default function LocationsScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'locations'),
      (snapshot) => {
        const data: Location[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Location, 'id'>),
        }));

        setLocations(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderLocationCard = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/features/lane/[id]",
          params: { id: item.id },
        })
      }
    >
      <View style={styles.cardContent}>

        <View style={styles.leftPart}>
          <Ionicons name="location-outline" size={24} color="#0057FF" />
        </View>

        <View style={styles.middlePart}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.address} numberOfLines={2}>
            {item.address}
          </Text>
        </View>

        <View style={styles.rightPart}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>

      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Locations', headerShadowVisible: false }} />

      {loading ? (
        <ActivityIndicator size="small" color="#0057FF" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id}
          renderItem={renderLocationCard}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="map-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>Geen locaties gevonden</Text>
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
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftPart: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  middlePart: {
    flex: 1,
    paddingHorizontal: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },

  address: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  rightPart: {
    alignItems: 'center',
  },

  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: 8,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ccc',
  },
});