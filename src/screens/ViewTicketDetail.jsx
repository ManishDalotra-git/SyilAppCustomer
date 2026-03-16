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
  RefreshControl ,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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
          setMessages(data.messages || []);
          setLoading(false);
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
    setMessages(data.messages || []);
  } catch (error) {
    console.log('Refresh error', error);
  } finally {
    setRefreshing(false);
  }
}, [ticketId]);

  console.log('messages---- ' , messages);

  const initialMessage = messages[messages.length - 1];
  const dynamicSubject = initialMessage?.subject;
  const outgoingMessage = messages.find(msg => msg.direction === 'OUTGOING');
  const hasOutgoing = messages.some(msg => msg.direction === 'OUTGOING');
  const dynamicEmail = outgoingMessage?.senderName;
  console.log('dynamicSubject---- ', dynamicSubject);
  console.log('dynamicEmail---- ', dynamicEmail);

  const getSenderName = (item) => item?.senderName || email;

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.charAt(0)?.toUpperCase() || '';
    return `${f}${l}`;
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
              paddingHorizontal:10,
              borderRadius: 8,
              marginBottom: 10,
              alignSelf: 'flex-end',
              display:'flex',
              flexDirection:'row',
              alignItems:'center',
            }}
            onPress={onRefresh}
          >
            <Image
              source={require('../../images/refresh.png')}
              style={styles.refreshIcon}
            /><Text style={{ color: '#000000', fontWeight: '500' }}>Refresh</Text>
          </TouchableOpacity>
          <Text style={styles.subject}>{subject}</Text>
          <Text style={styles.ticket}>#{ticketId}</Text>

          {loading && <Text style={{ textAlign:'center' , padding:10, }}>Loading conversation...</Text>}

          <FlatList
            data={messages}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            style={{ flex: 1, paddingBottom: 0 }}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 0, flexDirection: 'column-reverse' }}
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

                 {/* Attachments */}
                  {/* <Text >{item.attachments}</Text> */}
                

                {item.attachments && item.attachments.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5,  }}>
                    {item.attachments.map((attachment, index) => (
                      <Image
                        key={index}
                        source={{ uri: attachment.url }}
                        style={styles.attachmentImage}
                      />
                      // <Text>{attachment.url}</Text>
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

          {messages.length === 1 ? (
            <Text style={[styles.ReplyStyle, { backgroundColor: '#999' }]}>
              Please wait for the support reply.
            </Text>
          ) : hasOutgoing ? (
            <Text
              style={styles.ReplyStyle}
              onPress={() =>
                Linking.openURL(
                  `mailto:${dynamicEmail}?subject=Re:%20${encodeURIComponent(dynamicSubject)}&body=${encodeURIComponent("Hello Support SYIL,")}`
                )
              }
            >
              Reply to Support Team
            </Text>
          ) : null}

          

          
        </View>

      </View>

      

      

      {/* FOOTER */}
      <View style={styles.footer}>
        {/** Home */}
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

        {/** KnowledgeBase */}
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

        {/** Submit Ticket */}
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

        {/** View Tickets */}
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

        {/** More */}
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
    maxWidth:'90%',
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

  subject:{fontSize:24,fontWeight:700,marginBottom:2,},
  ticket:{fontSize:14,fontWeight:400,marginBottom:10,},

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

  ReplyStyle:{
    backgroundColor:'#000',
    padding:20,
    marginBottom:110,
    color:'#fff',
    borderRadius:8,
    textAlign:'center'
  },
  refreshIcon:{
    width:15,
    height:16,
    marginRight:5,
  },
  attachmentImage:{
    width:'85%',
    height:200,
    objectFit:'contain',
    resizeMode: 'contain',
  },

});
