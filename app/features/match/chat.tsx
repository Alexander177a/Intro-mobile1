import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image,
} from 'react-native';
import {
  getFirestore, collection, addDoc, query,
  orderBy, onSnapshot, serverTimestamp, doc, getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../src/firebase/firebaseConfig';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const db = getFirestore(app);
const auth = getAuth(app);

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  createdAt: any;
};

type MatchInfo = {
  clubName: string;
  time: string;
  date: number;
  month: string;
  players: string[];
};

const getAvatarColor = (uid: string) => {
  const colors = [
    { bg: '#E7F0FF', text: '#0057FF' },
    { bg: '#E8F5E9', text: '#4CAF50' },
    { bg: '#FFF4E5', text: '#FF9500' },
    { bg: '#F3E5F5', text: '#9C27B0' },
    { bg: '#FFF0F0', text: '#FF4B4B' },
  ];
  const index = uid.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function MatchChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!matchId) return;
    getDoc(doc(db, 'matches', matchId)).then((snap) => {
      if (snap.exists()) setMatchInfo(snap.data() as MatchInfo);
    });
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    const q = query(
      collection(db, 'matches', matchId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => unsubscribe();
  }, [matchId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !user || !matchId) return;
    setSending(true);
    const text = inputText.trim();
    setInputText('');
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const senderName = userData?.username ?? user.email ?? 'Speler';
      const senderPhoto = userData?.photoURL ?? null;

      await addDoc(collection(db, 'matches', matchId, 'messages'), {
        text,
        senderId: user.uid,
        senderName,
        senderPhoto,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Bericht sturen mislukt:', e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const d = timestamp.toDate();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === user?.uid;
    const avatarColor = getAvatarColor(item.senderId);
    const initials = item.senderName.slice(0, 2).toUpperCase();
    const prevMsg = messages[index - 1];
    const showName = !isMe && (!prevMsg || prevMsg.senderId !== item.senderId);

    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          <View style={styles.avatarCol}>
            {showName ? (
              item.senderPhoto ? (
                <Image source={{ uri: item.senderPhoto }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarCircle, { backgroundColor: avatarColor.bg }]}>
                  <Text style={[styles.avatarText, { color: avatarColor.text }]}>{initials}</Text>
                </View>
              )
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        <View style={[styles.msgBubbleWrap, isMe && styles.msgBubbleWrapMe]}>
          {showName && !isMe && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.timeText, isMe && styles.timeTextMe]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: matchInfo
            ? `${matchInfo.clubName} • ${matchInfo.date} ${matchInfo.month} • ${matchInfo.time}`
            : 'Chat',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#0057FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700', fontSize: 14 },
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0057FF" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ddd" />
              <Text style={styles.emptyChatText}>Nog geen berichten</Text>
              <Text style={styles.emptyChatSub}>Stuur het eerste bericht naar je medespelers!</Text>
            </View>
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Schrijf een bericht..."
          placeholderTextColor="#bbb"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="send" size={18} color="#fff" />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  messagesList: { padding: 16, paddingBottom: 8, gap: 4 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },

  avatarCol: { width: 28, alignItems: 'center' },
  avatarImg: { width: 28, height: 28, borderRadius: 14 },
  avatarCircle: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 10, fontWeight: '700' },
  avatarSpacer: { width: 28 },

  msgBubbleWrap: { maxWidth: '72%' },
  msgBubbleWrapMe: { alignItems: 'flex-end' },

  senderName: { fontSize: 11, color: '#999', marginBottom: 3, marginLeft: 4 },

  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#0057FF', borderBottomRightRadius: 4 },
  bubbleThem: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    borderWidth: 0.5, borderColor: '#eee',
  },
  bubbleText: { fontSize: 15, color: '#111', lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },

  timeText: { fontSize: 10, color: '#bbb', marginTop: 3, marginLeft: 4 },
  timeTextMe: { marginLeft: 0, marginRight: 4 },

  emptyChat: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, gap: 8,
  },
  emptyChatText: { fontSize: 16, fontWeight: '700', color: '#ccc' },
  emptyChatSub: { fontSize: 13, color: '#ddd', textAlign: 'center', paddingHorizontal: 40 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 12, paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 0.5, borderTopColor: '#eee',
  },
  input: {
    flex: 1, backgroundColor: '#F5F5F5',
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: '#111', maxHeight: 100,
    borderWidth: 0.5, borderColor: '#eee',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#0057FF',
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#ccc' },
});