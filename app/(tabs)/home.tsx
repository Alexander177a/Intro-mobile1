import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PlaytomicHome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Play Padel</Text>
          <Text style={styles.subtitle}>AP Hogeschool - Intro Mobile</Text>
        </View>

        {/* 1. WEDSTRIJD ZOEKEN (Kernfunctionaliteit 3) */}
        <TouchableOpacity 
          style={styles.mainCard}
          onPress={() => router.push('/features/competition')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#E7F0FF' }]}>
            <Ionicons name="search" size={28} color="#0057FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Wedstrijd zoeken</Text>
            <Text style={styles.cardSub}>Vind matches op jouw niveau (0,5 - 7,0)</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#BBB" />
        </TouchableOpacity>

        {/* 2. VELD BOEKEN (Kernfunctionaliteit 2) */}
        <TouchableOpacity 
          style={styles.mainCard}
          onPress={() => router.push('/features/lane')} 
        >
          <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="calendar" size={28} color="#4CAF50" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Veld boeken</Text>
            <Text style={styles.cardSub}>Reserveer een veld voor eigen gebruik</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#BBB" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Beheer</Text>
        </View>

        <View style={styles.gridRow}>
          {/* 3. WEDSTRIJD AANMAKEN (Kernfunctionaliteit 1) */}
          <TouchableOpacity 
            style={styles.smallCard}
            onPress={() => router.push('/features/match')}
          >
            <View style={[styles.smallIcon, { backgroundColor: '#FFF4E5' }]}>
              <Ionicons name="add" size={26} color="#FF9500" />
            </View>
            <Text style={styles.smallLabel}>Match aanmaken</Text>
          </TouchableOpacity>

          {/* 4. BERICHTEN (Kernfunctionaliteit 4) */}
          <TouchableOpacity 
            style={styles.smallCard}
            onPress={() => router.push('/features/chat')}
          >
            <View style={[styles.smallIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="chatbubbles-outline" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.smallLabel}>Berichten</Text>
          </TouchableOpacity>
        </View>

        {/* Info over niveau (eis uit opdracht) */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#0057FF" />
          <Text style={styles.infoText}>
            Nieuwe spelers starten op level **1,5**. Je niveau wordt aangepast na competitieve matchen.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginTop: 20, marginBottom: 30 },
  brandTitle: { fontSize: 32, fontWeight: '800', color: '#000', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#888', fontWeight: '600' },
  
  mainCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20,
    marginBottom: 15,
    borderWidth: 1, 
    borderColor: '#F2F2F2',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2
  },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  cardSub: { fontSize: 13, color: '#999', marginTop: 2 },

  sectionHeader: { marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#000' },

  gridRow: { flexDirection: 'row', gap: 15 },
  smallCard: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#F2F2F2', 
    alignItems: 'center' 
  },
  smallIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  smallLabel: { fontSize: 13, fontWeight: '700', color: '#444', textAlign: 'center' },

  infoBox: { 
    marginTop: 40, 
    backgroundColor: '#E7F0FF', 
    padding: 20, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12
  },
  infoText: { flex: 1, fontSize: 13, color: '#0057FF', lineHeight: 18 }
});