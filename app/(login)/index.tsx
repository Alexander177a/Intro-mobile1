import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  Alert, ActivityIndicator,
} from "react-native";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../../src/firebase/firebaseConfig";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const auth = getAuth(app);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) return Alert.alert("Fout", "Vul je e-mail en wachtwoord in.");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("../(tabs)/home");
    } catch (error: any) {
      Alert.alert("Inloggen mislukt", error.message);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = () => {
    if (!email.trim()) {
      return Alert.alert("E-mail nodig", "Vul eerst je e-mailadres in, dan sturen we een reset-link.");
    }
    sendPasswordResetEmail(auth, email)
      .then(() => Alert.alert("Verstuurd!", "Controleer je inbox voor de reset-link."))
      .catch((error: any) => Alert.alert("Fout", error.message));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.title}>Welkom terug</Text>
          <Text style={styles.subtitle}>Log in op Play Padel</Text>
        </View>

        {/* Formulier kaart */}
        <View style={styles.card}>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-MAILADRES</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={16} color="#bbb" style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                placeholder="naam@voorbeeld.com"
                placeholderTextColor="#bbb"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Wachtwoord */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>WACHTWOORD</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={16} color="#bbb" style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                placeholder="Jouw wachtwoord"
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

          {/* Wachtwoord vergeten */}
          <TouchableOpacity onPress={forgotPassword} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Wachtwoord vergeten?</Text>
          </TouchableOpacity>

          {/* Login knop */}
          <TouchableOpacity style={styles.submitBtn} onPress={login} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Inloggen</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>of</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Nog geen account? </Text>
          <Link href="/register">
            <Text style={styles.registerLink}>Registreren</Text>
          </Link>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingBottom: 48 },

  header: {
    backgroundColor: "#0057FF",
    paddingTop: 60,
    paddingBottom: 72,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  avatarCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 },

  card: {
    marginHorizontal: 20,
    marginTop: -32,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 0.5,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },

  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 11, color: "#999", fontWeight: "600",
    letterSpacing: 0.5, marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 0.5, borderColor: "#eee",
  },
  inputIcon: { marginRight: 10 },
  inputInner: { flex: 1, fontSize: 15, color: "#000" },

  forgotBtn: { alignSelf: "flex-end", marginBottom: 20 },
  forgotText: { fontSize: 13, color: "#0057FF", fontWeight: "600" },

  submitBtn: {
    backgroundColor: "#0057FF",
    borderRadius: 16, padding: 18,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  divider: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 24, marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: "#eee" },
  dividerText: { fontSize: 12, color: "#bbb", marginHorizontal: 12 },

  registerRow: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
  },
  registerText: { fontSize: 14, color: "#999" },
  registerLink: { fontSize: 14, color: "#0057FF", fontWeight: "700" },
});