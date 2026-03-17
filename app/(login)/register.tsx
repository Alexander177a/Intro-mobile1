import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Image, ActivityIndicator
} from "react-native";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { app } from "../../src/firebase/firebaseConfig";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const auth = getAuth(app);
const db = getFirestore(app);

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Toestemming nodig", "Geef toegang tot je fotobibliotheek.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const registerUser = async () => {
    if (!username.trim()) return Alert.alert("Fout", "Kies een gebruikersnaam.");
    if (!email.trim()) return Alert.alert("Fout", "Vul je e-mailadres in.");
    if (password.length < 6) return Alert.alert("Fout", "Wachtwoord moet minstens 6 tekens zijn.");

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(user, {
        displayName: username,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        photoURL: photoBase64 ?? null, // Opgeslagen als base64 in Firestore
        level: 1.5,
        createdAt: serverTimestamp(),
        matchesPlayed: 0,
        wins: 0,
      });

      Alert.alert("Welkom!", `Hoi ${username}, je account is aangemaakt!`);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Registratie mislukt", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.brand}>Play Padel</Text>
          <Text style={styles.headerSub}>Maak je account aan</Text>
        </View>

        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera-outline" size={28} color="#0057FF" />
                <Text style={styles.avatarLabel}>Foto</Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="add" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tik om een profielfoto te kiezen</Text>
        </View>

        <View style={styles.form}>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>GEBRUIKERSNAAM</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.atSign}>@</Text>
              <TextInput
                style={styles.inputInner}
                placeholder="jouw_naam"
                placeholderTextColor="#bbb"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-MAILADRES</Text>
            <TextInput
              style={styles.input}
              placeholder="naam@voorbeeld.com"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>WACHTWOORD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputInner}
                placeholder="Minstens 6 tekens"
                placeholderTextColor="#bbb"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#bbb"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.levelCard}>
            <View>
              <Text style={styles.levelTitle}>Startniveau</Text>
              <Text style={styles.levelSub}>Alle nieuwe spelers beginnen op 1.5</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>1.5</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={registerUser} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Account aanmaken</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/(login)")} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Heb je al een account?{" "}
              <Text style={styles.loginLinkBold}>Inloggen</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingBottom: 40 },
  header: {
    backgroundColor: "#0057FF",
    paddingTop: 50, paddingBottom: 50,
    paddingHorizontal: 28, alignItems: "center",
  },
  brand: { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  avatarSection: { alignItems: "center", marginTop: -36, marginBottom: 24 },
  avatarWrapper: { position: "relative" },
  avatarImage: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: "#fff" },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "#E7F0FF",
    borderWidth: 2, borderColor: "#0057FF", borderStyle: "dashed",
    justifyContent: "center", alignItems: "center",
  },
  avatarLabel: { fontSize: 11, color: "#0057FF", fontWeight: "600", marginTop: 2 },
  avatarBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#0057FF",
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  avatarHint: { fontSize: 12, color: "#999", marginTop: 8 },
  form: { paddingHorizontal: 24 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 11, color: "#999", fontWeight: "600", letterSpacing: 0.5, marginBottom: 6 },
  input: {
    backgroundColor: "#F7F7F7", borderRadius: 14,
    padding: 16, fontSize: 15, color: "#000",
    borderWidth: 1, borderColor: "#eee",
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F7F7F7", borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: "#eee",
  },
  inputInner: { flex: 1, fontSize: 15, color: "#000" },
  atSign: { fontSize: 16, color: "#0057FF", fontWeight: "600", marginRight: 8 },
  levelCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#F7F0FF", borderRadius: 14, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: "#E8D5FF",
  },
  levelTitle: { fontSize: 14, fontWeight: "700", color: "#333" },
  levelSub: { fontSize: 12, color: "#999", marginTop: 2 },
  levelBadge: { backgroundColor: "#9C27B0", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  levelBadgeText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  submitBtn: { backgroundColor: "#0057FF", borderRadius: 16, padding: 18, alignItems: "center", marginBottom: 16 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loginLink: { alignItems: "center", padding: 8 },
  loginLinkText: { fontSize: 13, color: "#999" },
  loginLinkBold: { color: "#0057FF", fontWeight: "700" },
});