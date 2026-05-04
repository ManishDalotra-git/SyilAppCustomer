import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Platform,
  Pressable,
  FlatList,
  Linking,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

const ViewTicketDetail = ({ navigation }) => {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');

  const route = useRoute();
  const { ticketId } = route.params || {};
  const { subject } = route.params || {};
  const currentRoute = route.name;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactID, setContactID] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Modal States
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sending, setSending] = useState(false);

  /* ================= USER INFO ================= */
  useFocusEffect(
    useCallback(() => {
      const loadUserName = async () => {
        const userFirstName = await AsyncStorage.getItem('userFirstName');
        const userLastName = await AsyncStorage.getItem('userLastName');
        const userContactID = await AsyncStorage.getItem('userID');
        const savedEmail = await AsyncStorage.getItem('userEmail');
        setEmail(savedEmail || '');
        setFirstName(userFirstName || '');
        setLastName(userLastName || '');
        setContactID(userContactID || '');
      };
      loadUserName();
    }, [])
  );

  const isChen = email === 'manish.dalotra@techstriker.com';

  /* ================= CONVERSATION ================= */
  useFocusEffect(
    useCallback(() => {
      const fetchTicketConversation = async () => {
        if (!ticketId) return;
        try {
          setLoading(true);
          const response = await fetch(
            'https://syilapp-w8ye.onrender.com/get_ticket_conversation',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ticketId }),
            }
          );
          const data = await response.json();
          console.log('Conversation data----- ', data);
          setMessages(data.messages || []);
        } catch (error) {
          console.log('Conversation fetch error', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTicketConversation();
    }, [ticketId])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (!ticketId) return;
      const response = await fetch(
        'https://syilapp-w8ye.onrender.com/get_ticket_conversation',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ ticketId }),
        }
      );
      const data = await response.json();
      console.log('data----- ', data);
      setMessages(data.messages || []);
    } catch (error) {
      console.log('Refresh error', error);
    } finally {
      setRefreshing(false);
    }
  }, [ticketId]);

  const initialMessage = messages[messages.length - 1];
  const dynamicSubject = initialMessage?.subject;
  const outgoingMessage = messages.find(msg => msg.direction === 'OUTGOING');
  const hasOutgoing = messages.some(msg => msg.direction === 'OUTGOING');
  const dynamicEmail = outgoingMessage?.senderName;
  const channelAccountId = outgoingMessage?.channelAccountId;
  const channelId = outgoingMessage?.channelId;
  const conversationsThreadId = outgoingMessage?.conversationsThreadId;

  const incomingMessage = [...messages]
    .reverse()
    .find(msg => msg.direction === 'INCOMING' && msg.senderName?.includes('@'));

  const incomingEmail = incomingMessage?.senderName;
  const incomingSubject = incomingMessage?.subject;

  const hasOutgoings = messages.filter(msg => msg.direction === 'OUTGOING').length;
  const subjectPrefix = hasOutgoings > 1 ? 'Re: ' : '';

  const getSenderName = (item) => item?.senderName || email;

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.charAt(0)?.toUpperCase() || '';
    return `${f}${l}`;
  };

  /* ================= FILE PICKER ================= */
  const pickFiles = () => {
    launchImageLibrary(
      {
        mediaType: 'mixed',
        selectionLimit: 0,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const files = response.assets.map((asset) => ({
            uri: asset.uri,
            name: asset.fileName || `file_${Date.now()}`,
            type: asset.type || 'image/jpeg',
          }));
          setSelectedFiles((prev) => [...prev, ...files]);
        }
      }
    );
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= SEND TO CUSTOMER ================= */
  const sendToCustomer = async () => {
    if (!messageText.trim()) {
      Alert.alert('Error', 'Message likhna zaroori hai');
      return;
    }

    setSending(true);
    try {
      let attachmentIds = [];


      console.log('Step 1: Owner ID fetch kar rahe hain for email:', email);
      const ownerRes = await fetch(
        'https://syilapp-w8ye.onrender.com/get-owner-id',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const ownerData = await ownerRes.json();
      const senderActorId = ownerData.ownerId
        ? `A-${ownerData.ownerId}`
        : 'A-80554724'; // fallback
      console.log('senderActorId:', senderActorId);


      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('files', {
            uri: file.uri,
            name: file.name,
            type: file.type,
          });
        });

        const uploadRes = await fetch(
          'https://syilapp-w8ye.onrender.com/upload-to-hubspot',
          {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        const uploadData = await uploadRes.json();
        attachmentIds = uploadData.files.map((f) => f.id);
      }

      
      const sendRes = await fetch(
        'https://syilapp-w8ye.onrender.com/send-hubspot-message',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: conversationsThreadId,
            text: messageText,
            recipientEmail: incomingEmail,
            attachmentIds,
            channelAccountId: channelAccountId,
            channelId: channelId,
            senderActorId: senderActorId,
          }),
        }
      );

      const sendData = await sendRes.json();

      if (sendData.success) {
        Alert.alert('Success', 'Message sent successfully!');
        setReplyModalVisible(false);
        setMessageText('');
        setSelectedFiles([]);
        attachmentIds = [];
        onRefresh();
      } else {
        Alert.alert('Error', 'Message not sent. Please try again.');
      }
    } catch (err) {
      console.log('Send error', err);
      Alert.alert('Error', 'An error occurred while sending the message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ImageBackground style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.flexClass}>
          <Pressable onPress={() => navigation.navigate('Profile')}>
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>
                {getInitials(firstName, lastName)}
              </Text>
            </View>
          </Pressable>

          <Image
            source={require('../../images/syil_logo_black.png')}
            style={styles.logoSyil}
          />

          <Pressable onPress={() => navigation.navigate('Ticket')}>
            <Image
              source={require('../../images/ticket.png')}
              style={styles.ticketIcon}
            />
          </Pressable>
        </View>

        {/* MESSAGES */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#FFEA00',
              padding: 5,
              paddingHorizontal: 10,
              borderRadius: 8,
              marginBottom: 10,
              alignSelf: 'flex-end',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={onRefresh}
          >
            <Image
              source={require('../../images/refresh.png')}
              style={styles.refreshIcon}
            />
            <Text style={{ color: '#000000', fontWeight: '500' }}>Refresh</Text>
          </TouchableOpacity>

          <Text style={styles.subject}>{subject}</Text>
          <Text style={styles.ticket}>#{ticketId}</Text>

          {loading && (
            <Text style={{ textAlign: 'center', padding: 10 }}>
              Loading conversation...
            </Text>
          )}

          <FlatList
            data={messages}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            style={{ flex: 1, paddingBottom: 0 }}
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 0,
              flexDirection: 'column-reverse',
            }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.direction === 'OUTGOING'
                    ? styles.outgoing
                    : styles.incoming,
                ]}
              >
                <Text style={styles.senderName}>{getSenderName(item)}</Text>
                <Text style={styles.messageText}>{item.text || ''}</Text>

                {item.attachments && item.attachments.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      marginTop: 5,
                    }}
                  >
                    {item.attachments.map((attachment, index) => (
                      <Image
                        key={index}
                        source={{ uri: attachment.url }}
                        style={styles.attachmentImage}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />

          {!loading && messages.length === 0 && (
            <Text style={styles.noTicketText}>No conversation found</Text>
          )}

          
          {isChen ? (
           
            <TouchableOpacity
              style={styles.ReplyStyle}
              onPress={() => setReplyModalVisible(true)}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '500', fontSize: 16 }}>
                Reply to Customer
              </Text>
            </TouchableOpacity>
          ) : messages.length === 1 ? (
            <Text style={[styles.ReplyStyle, { backgroundColor: '#999' }]}>
              Please wait for the support reply.
            </Text>
          ) : hasOutgoing ? (
            
            <Text
              style={styles.ReplyStyle}
              onPress={() =>
                Linking.openURL(
                  `mailto:${dynamicEmail}?subject=Re:%20${encodeURIComponent(
                    dynamicSubject
                  )}&body=${encodeURIComponent('Hello Support SYIL,')}`
                )
              }
            >
              Reply to Support Team
            </Text>
          ) : null}
        </View>
      </View>

     
      <Modal
        visible={replyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setReplyModalVisible(false);
          setMessageText('');
          setSelectedFiles([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
           
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reply to Customer</Text>
              <TouchableOpacity
                onPress={() => {
                  setReplyModalVisible(false);
                  setMessageText('');
                  setSelectedFiles([]);
                }}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            
            <Text style={styles.toLabel}>
              To:{' '}
              <Text style={styles.toEmail}>{incomingEmail}</Text>
            </Text>

            
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              value={messageText}
              onChangeText={setMessageText}
              textAlignVertical="top"
            />

            
            {selectedFiles.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filePreviewScroll}
              >
                {selectedFiles.map((file, index) => (
                  <View key={index} style={styles.filePreviewItem}>
                    <Image
                      source={{ uri: file.uri }}
                      style={styles.filePreviewImage}
                    />
                    <TouchableOpacity
                      style={styles.removeFileBtn}
                      onPress={() => removeFile(index)}
                    >
                      <Text style={styles.removeFileBtnText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.filePreviewName} numberOfLines={1}>
                      {file.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickFiles}>
                <Text style={styles.uploadBtnText}>📎 Attach Files</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sendBtn, sending && { opacity: 0.6 }]}
                onPress={sendToCustomer}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.sendBtnText}>Send to Customer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerItem, currentRoute === 'Home' && styles.activeFooterItem]}
          onPress={() => navigation.navigate('Home')}
        >
          <Image
            source={require('../../images/home.png')}
            style={[styles.footerIcon, currentRoute === 'Home' && styles.activeFooterIcon]}
          />
          <Text style={[styles.footerText, currentRoute === 'Home' && styles.activeFooterText]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerItem, currentRoute === 'KnowledgeBase' && styles.activeFooterItem]}
          onPress={() => navigation.navigate('KnowledgeBase')}
        >
          <Image
            source={require('../../images/knowledge.png')}
            style={[styles.footerIcon, currentRoute === 'KnowledgeBase' && styles.activeFooterIcon]}
          />
          <Text style={[styles.footerText, currentRoute === 'KnowledgeBase' && styles.activeFooterText]}>
            Knowledge
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerItem, currentRoute === 'Ticket' && styles.activeFooterItem]}
          onPress={() => navigation.navigate('Ticket')}
        >
          <Image
            source={require('../../images/submit.png')}
            style={[styles.footerIcon, currentRoute === 'Ticket' && styles.activeFooterIcon]}
          />
          <Text style={[styles.footerText, currentRoute === 'Ticket' && styles.activeFooterText]}>
            Submit Ticket
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerItem, currentRoute === 'ViewTicket' && styles.activeFooterItem]}
          onPress={() => navigation.navigate('ViewTicket')}
        >
          <Image
            source={require('../../images/view.png')}
            style={[styles.footerIcon, currentRoute === 'ViewTicket' && styles.activeFooterIcon]}
          />
          <Text style={[styles.footerText, currentRoute === 'ViewTicket' && styles.activeFooterText]}>
            View Tickets
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerItem, currentRoute === 'More' && styles.activeFooterItem]}
          onPress={() => navigation.navigate('More')}
        >
          <Image
            source={require('../../images/more.png')}
            style={[styles.footerIcon, currentRoute === 'More' && styles.activeFooterIcon]}
          />
          <Text style={[styles.footerText, currentRoute === 'More' && styles.activeFooterText]}>
            More
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default ViewTicketDetail;

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    backgroundColor: '#fff',
  },
  flexClass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  logoSyil: { width: 87.6, height: 24 },
  ticketIcon: { width: 26.88, height: 21.88 },
  initialsAvatar: {
    width: 30,
    height: 30,
    backgroundColor: '#000',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: { fontSize: 14, fontWeight: '500', color: '#FFEA00' },
  messageBubble: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: '90%',
  },
  incoming: {
    backgroundColor: '#FFEA00',
    alignSelf: 'flex-end',
  },
  outgoing: {
    backgroundColor: '#e5e5e5',
    alignSelf: 'flex-start',
  },
  senderName: { fontWeight: '600', marginBottom: 4, color: '#333' },
  messageText: { color: '#000' },
  noTicketText: { textAlign: 'center', marginTop: 20, color: '#999' },
  subject: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
  ticket: { fontSize: 14, fontWeight: '400', marginBottom: 10 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: 5 },
  footerIcon: { width: 22, height: 22, marginBottom: 4, tintColor: '#666666' },
  footerText: { fontSize: 12, color: '#666666' },
  activeFooterItem: { borderTopWidth: 2, borderTopColor: '#FFEA00' },
  activeFooterIcon: { tintColor: '#000' },
  activeFooterText: { color: '#000', fontWeight: '500' },
  ReplyStyle: {
    backgroundColor: '#000',
    padding: 20,
    marginBottom: 110,
    color: '#fff',
    borderRadius: 8,
    textAlign: 'center',
  },
  refreshIcon: { width: 15, height: 16, marginRight: 5 },
  attachmentImage: {
    width: '85%',
    height: 200,
    objectFit: 'contain',
    resizeMode: 'contain',
  },

  // ✅ Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  modalClose: { fontSize: 18, color: '#666', padding: 4 },
  toLabel: { fontSize: 13, color: '#666', marginBottom: 10 },
  toEmail: { color: '#000', fontWeight: '600' },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#000',
    minHeight: 120,
    marginBottom: 12,
  },
  filePreviewScroll: { marginBottom: 12 },
  filePreviewItem: {
    marginRight: 10,
    position: 'relative',
    alignItems: 'center',
  },
  filePreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  removeFileBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFileBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  filePreviewName: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    maxWidth: 80,
  },
  modalActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  uploadBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  uploadBtnText: { color: '#000', fontWeight: '600', fontSize: 14 },
  sendBtn: {
    width: '100%',
    backgroundColor: '#FFEA00',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  sendBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
});