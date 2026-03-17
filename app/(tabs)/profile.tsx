import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator,
} from "react-native";
import { getAuth, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { app } from "../../src/firebase/firebaseConfig";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const auth = getAuth(app);
const db = getFirestore(app);

type UserProfile = {
  username: string;
  email: string;
  photoURL: string | null;
  level: number;
  matchesPlayed: number;
  wins: number;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
      setLoading(false);
    });
  }, []);

  const changePhoto = async () => {
    console.log("1. changePhoto gestart");

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("2. Permission status:", status);
    if (status !== "granted") return Alert.alert("Toestemming nodig", "Geef toegang tot je foto's.");

    console.log("3. ImagePicker openen...");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
      base64: true,
    });

    console.log("4. Result canceled:", result.canceled);
    console.log("5. User:", user?.uid);
    console.log("6. Base64 aanwezig:", !!result.assets?.[0]?.base64);

    if (result.canceled || !user || !result.assets[0].base64) {
      console.log("7. GESTOPT - reden:",
        result.canceled ? "geannuleerd" :
          !user ? "geen user" :
            "geen base64"
      );
      return;
    }

    setUploadingPhoto(true);
    try {
      console.log("8. Opslaan in Firestore...");
      const photoURL = `data:image/jpeg;base64,${result.assets[0].base64}`;
      console.log("9. photoURL lengte:", photoURL.length);
      await setDoc(doc(db, "users", user.uid), { photoURL }, { merge: true });
      console.log("10. Opgeslagen!");
      setProfile((prev) => prev ? { ...prev, photoURL } : prev);
      Alert.alert("Gelukt!", "Je profielfoto is bijgewerkt.");
    } catch (e: any) {
      console.error("FOUT:", e.message);
      Alert.alert("Fout", e.message);
    } finally {
      setUploadingPhoto(false);
    }
  };
  const resetPassword = () => {
    if (!user?.email) return;
    sendPasswordResetEmail(auth, user.email)
      .then(() => Alert.alert("Verstuurd!", "Controleer je inbox voor de reset-link."))
      .catch(() => Alert.alert("Fout", "Reset-mail kon niet verstuurd worden."));
  };

  const logout = () => {
    Alert.alert("Uitloggen", "Weet je zeker dat je wilt uitloggen?", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Uitloggen", style: "destructive",
        onPress: () => signOut(auth).then(() => router.replace("/(login)")),
      },
    ]);
  };

  const getInitials = () => {
    if (!profile?.username) return "?";
    return profile.username.slice(0, 2).toUpperCase();
  };

  const winRate = profile && profile.matchesPlayed > 0
    ? Math.round((profile.wins / profile.matchesPlayed) * 100)
    : 0;

  const levelPercent = profile
    ? ((profile.level - 0.5) / (7 - 0.5)) * 100
    : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0057FF" style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mijn Profiel</Text>
          <TouchableOpacity onPress={changePhoto} style={styles.avatarWrapper} disabled={uploadingPhoto}>
            {profile?.photoURL ? (
              <Image source={{ uri: profile.photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              {uploadingPhoto
                ? <ActivityIndicator size="small" color="#0057FF" />
                : <Ionicons name="camera" size={14} color="#0057FF" />
              }
            </View>
          </TouchableOpacity>
          <Text style={styles.displayName}>{profile?.username ?? "Speler"}</Text>
          <Text style={styles.displayHandle}>@{profile?.username?.toLowerCase().replace(" ", "_")}</Text>
        </View>

        <View style={styles.statsCard}>
          <StatItem label="Niveau" value={profile?.level?.toString() ?? "1.5"} color="#0057FF" />
          <View style={styles.statDivider} />
          <StatItem label="Matchen" value={String(profile?.matchesPlayed ?? 0)} color="#333" />
          <View style={styles.statDivider} />
          <StatItem label="Gewonnen" value={String(profile?.wins ?? 0)} color="#4CAF50" />
          <View style={styles.statDivider} />
          <StatItem label="Win %" value={`${winRate}%`} color="#FF9500" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NIVEAU VOORTGANG</Text>
          <View style={styles.levelCard}>
            <View style={styles.levelRow}>
              <Text style={styles.levelCurrent}>Niveau {profile?.level ?? 1.5}</Text>
              <Text style={styles.levelMax}>max 7.0</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${levelPercent}%` as any }]} />
            </View>
            <View style={styles.levelEnds}>
              <Text style={styles.levelEndText}>0.5</Text>
              <Text style={styles.levelEndText}>7.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              iconBg="#E7F0FF"
              iconColor="#0057FF"
              title="Persoonlijke gegevens"
              subtitle={profile?.email ?? ""}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="camera-outline"
              iconBg="#E8F5E9"
              iconColor="#4CAF50"
              title="Profielfoto wijzigen"
              subtitle="Foto uploaden of aanpassen"
              onPress={changePhoto}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="lock-closed-outline"
              iconBg="#FFF4E5"
              iconColor="#FF9500"
              title="Wachtwoord wijzigen"
              subtitle="Reset-link ontvangen via e-mail"
              onPress={resetPassword}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#FF4B4B" />
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({
  icon, iconBg, iconColor, title, subtitle, onPress,
}: {
  icon: any; iconBg: string; iconColor: string;
  title: string; subtitle: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub} numberOfLines={1}>{subtitle}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color="#bbb" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scroll: { paddingBottom: 48 },
  header: {
    backgroundColor: "#0057FF",
    paddingTop: 50, paddingBottom: 80,
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#fff", marginBottom: 20 },
  avatarWrapper: { position: "relative" },
  avatarImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: "#fff" },
  avatarFallback: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3, borderColor: "#fff",
    justifyContent: "center", alignItems: "center",
  },
  avatarInitials: { fontSize: 32, fontWeight: "700", color: "#fff" },
  cameraBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2, borderColor: "#0057FF",
    justifyContent: "center", alignItems: "center",
  },
  displayName: { fontSize: 22, fontWeight: "800", color: "#fff", marginTop: 12 },
  displayHandle: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 3 },
  statsCard: {
    flexDirection: "row", backgroundColor: "#fff",
    borderRadius: 20, marginHorizontal: 16, marginTop: -32,
    padding: 16, borderWidth: 0.5, borderColor: "#eee",
    elevation: 4, marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#999", marginTop: 2 },
  statDivider: { width: 0.5, backgroundColor: "#eee" },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionLabel: { fontSize: 11, color: "#999", fontWeight: "600", letterSpacing: 0.5, marginBottom: 10, paddingLeft: 4 },
  levelCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: "#eee" },
  levelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  levelCurrent: { fontSize: 14, fontWeight: "700", color: "#0057FF" },
  levelMax: { fontSize: 13, color: "#bbb" },
  progressBg: { backgroundColor: "#F0F0F0", borderRadius: 8, height: 8, overflow: "hidden" },
  progressFill: { backgroundColor: "#0057FF", height: "100%", borderRadius: 8 },
  levelEnds: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  levelEndText: { fontSize: 10, color: "#bbb" },
  menuCard: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 0.5, borderColor: "#eee" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  menuIcon: { width: 38, height: 38, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: "700", color: "#111" },
  menuSub: { fontSize: 12, color: "#bbb", marginTop: 1 },
  menuDivider: { height: 0.5, backgroundColor: "#f5f5f5", marginLeft: 68 },
  logoutBtn: {
    marginHorizontal: 16, backgroundColor: "#FFF0F0",
    borderRadius: 16, padding: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 8, borderWidth: 0.5, borderColor: "#FFD5D5",
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#FF4B4B" },
});