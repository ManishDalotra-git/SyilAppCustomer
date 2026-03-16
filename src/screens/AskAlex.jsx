import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,  Keyboard, KeyboardAvoidingView, Platform 
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultMessages = [
  {
    id: '1',
    sender: 'bot',
    text: `Hello! Welcome to SYIL Support. I'm Alex, your AI assistant 🙂.\n\nHow are you today? How may I assist you?`
  }
];



const renderFormattedText = (text, isTyping = false) => {
  if (!text) return null;
  if (isTyping) {
    return <Text style={{ height: 0 }} />;
  }
  const lines = text.split('\n');
  const bulletIndices = lines
    .map((line, idx) => (line.trim().startsWith('- ') ? idx : -1))
    .filter(idx => idx !== -1);
  const bulletGroupStarts = [];
  bulletIndices.forEach((idx, i) => {
    if (i === 0 || idx !== bulletIndices[i - 1] + 1) {
      bulletGroupStarts.push(idx);
    }
  });
  const boldIndices = new Set();
  bulletGroupStarts.forEach(bulletStartIdx => {
    for (let i = bulletStartIdx - 1; i >= 0; i--) {
      if (lines[i].trim() !== '') {
        boldIndices.add(i);
        break;
      }
    }
  });

  

  return lines.map((line, index) => {
    const trimmed = line.trim();
    const isLastLine = index === lines.length - 1;
    const suffix = isLastLine ? '' : '\n';

    if (index === 0 && trimmed.startsWith('📘')) {
      return (
        <Text key={index} style={{ fontWeight: '700' }}>
          {line + suffix}
        </Text>
      );
    }

    if (boldIndices.has(index)) {
      return (
        <Text key={index} style={{ fontWeight: '700', color: '#000' }}>
          {line + suffix}
        </Text>
      );
    }

    if (trimmed.startsWith('- ')) {
      return (
        <Text key={index} style={{ fontWeight: '400', color: '#000' }}>
          {line + suffix}
        </Text>
      );
    }

    // Normal lines
    return (
      <Text key={index} style={{ fontWeight: '400', color: '#000' }}>
        {line + suffix}
      </Text>
    );
  });
};



const AskAlex = () => {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useFocusEffect(
        useCallback(() => {
            const loadUserName = async () => {
            const userFirstName = await AsyncStorage.getItem('userFirstName');
            const userLastName = await AsyncStorage.getItem('userLastName');

            console.log('FOCUS firstName:', userFirstName);
            console.log('FOCUS lastName:', userLastName);

            setFirstName(userFirstName || '');
            setLastName(userLastName || '');
            };

            loadUserName();
        }, [])
    );

    const getInitials = (firstName = '', lastName = '') => {
        const f = firstName?.charAt(0)?.toUpperCase() || '';
        const l = lastName?.charAt(0)?.toUpperCase() || '';
        return `${f}${l}`;
    };


  const navigation = useNavigation();
  const route = useRoute();
  //const currentRoute = route.name;
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [typingMessageId, setTypingMessageId] = useState(null);

  const removeMarkdownLinks = (text) => {
  let cleaned = text.replace(/\[.*?\]\(.*?\)/g, '');
  cleaned = cleaned.replace(/\([^()]*https?:\/\/[^()]*\)/g, '');
  cleaned = cleaned.replace(/\(\s*\)/g, '');
  cleaned = cleaned.trim();

  return cleaned;
};
  useEffect(() => {
    if (!isLoading) {
      setLoadingDots('');
      return;
    }

    const dotsArray = ['.', '..', '...'];
    let index = 0;

    const interval = setInterval(() => {
      setLoadingDots(dotsArray[index]);
      index = (index + 1) % dotsArray.length;
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;

    const userId = Date.now().toString();
    const botId = (Date.now() + 1).toString();

    setMessages(prev => [
      ...prev,
      { id: userId, sender: 'user', text: userText, firstName: firstName, lastName: lastName },
      { id: botId, sender: 'bot', text: '' }
    ]);

    setInput('');
    setIsLoading(true);
    setTypingMessageId(botId);

    try {
      const response = await fetch('https://syilapp-w8ye.onrender.com/ask-alex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText }),
      });

      const result = await response.json();
      console.log('SERVER RESPONSE:', result);
      setIsLoading(false);

      const finalText =
        (result.title ? `📘 ${result.title}\n\n` : '') +
        (result.text || '');

      const cleanedFinalText = removeMarkdownLinks(finalText);

      let index = 0;
      let temp = '';

      const interval = setInterval(() => {
        temp += cleanedFinalText[index];
        index++;

        setMessages(prev =>
          prev.map(msg =>
            msg.id === botId
              ? { ...msg, text: temp }
              : msg
          )
        );

        if (index >= cleanedFinalText.length) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 10);

    } catch (error) {
      console.log('FETCH ERROR:', error);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === botId
            ? { ...msg, text: '❌ Network error. Please try again.' }
            : msg
        )
      );

      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => {
  const isBot = item.sender === 'bot';
  const isUser = item.sender === 'user';
  const name = item.firstName;
  

  return (
    <View style={styles.mainContent}>
      {isBot && (
        <View style={styles.loadingIndicator}>
          <Image
            source={require('../../images/Alexa.png')} 
            style={styles.loadingIcon}
          />
          <Text style={styles.alexaText}>Alex</Text>
        </View>
      )}


        {isUser && (
          <View style={styles.loadingIndicatorUser}>
            <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>
                {getInitials(firstName, lastName)}
                </Text>
            </View>
              <Text style={styles.alexaText}>{firstName}</Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble, isBot && isLoading && styles.messageDisable,
            isBot ? styles.botBubble : styles.userBubble
          ]}
        >

        {isBot && item.id === typingMessageId && isLoading ? (
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#999', fontStyle: 'italic' }}>
            Alex is typing {loadingDots}
          </Text>
        ) : (
          <Text style={styles.messageText}>
            {renderFormattedText(item.text)}
          </Text>
        )}
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // adjust if you have headers
        >

        
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../images/circle_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ask Alex</Text>
      </View>

      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <FlatList
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContainer}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your message..."
            value={input}
            onChangeText={setInput}
            placeholderTextColor="#999"
            multiline={true}
            style={[
              styles.input,
              isLoading && styles.inputDisabled,
              { minHeight: 44, textAlignVertical: 'top' }
            ]}
            editable={!isLoading}
          />
          <TouchableOpacity style={[
            styles.sendButton,
            isLoading && styles.inputDisabled
          ]} disabled={isLoading} onPress={sendMessage}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AskAlex;

// 🎨 Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 0,
  },
  header: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  arrowIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '85%',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  chatContainer: {
    padding: 16
  },
  messageBubble: {
    maxWidth: '90%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 6
  },
  
  botBubble: {
    adding: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F2'
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFEA00'
  },
  messageText: {
    fontSize: 14,
    color: '#000',
    lineHeight:18,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
  },
  loadingIndicatorUser:{
    justifyContent:'flex-end',
    alignContent:'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
  },
  initialsAvatar:{width:30,height:30,backgroundColor:'#000',borderRadius:100,justifyContent:'center',alignItems:'center',},
  initialsText:{fontSize:14,fontWeight:500,color:'#FFEA00'},
  alexaText:{marginLeft:5,fontSize:16,fontWeight:700,},
  loadingIcon: {
    width: 32,
    height: 32,
  },
  loadingDots: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 6,
    color: '#666',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 100,
    textAlignVertical: 'top'
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#FFEA00',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  inputDisabled:{
    opacity:0.5,
  },
  sendText: {
    fontSize: 18,
    fontWeight: 'bold'
  },

});
