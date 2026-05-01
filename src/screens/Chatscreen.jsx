import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native'
import React, { useState, useCallback } from 'react'
import { WebView } from 'react-native-webview'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Chatscreen = () => {

  const [loaded, setLoaded] = useState(false);
  const [chatReady, setChatReady] = useState(false);

  const navigation = useNavigation();

  // 🔥 3 sec delay before opening chat
  const injectedJS = `
    setTimeout(() => {
      function openChat() {
        if (window.HubSpotConversations) {
          window.HubSpotConversations.widget.load();
          window.HubSpotConversations.widget.open();
        } else {
          setTimeout(openChat, 500);
        }
      }
      openChat();
    }, 2000);

    true;
  `;

  return (
    <View style={{ flex: 1 }}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../images/circle_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ask Alex</Text>
      </View>

      {/* LOADING OVERLAY */}
      {!chatReady && (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      )}

      {/* WEBVIEW */}
      <WebView
        source={{ uri: 'https://syil.com/mobile-chat-support-for-kb' }}

        javaScriptEnabled={true}
        domStorageEnabled={true}

        injectedJavaScript={injectedJS}

        onLoadEnd={() => {
          // show loading for 3 sec minimum
          setTimeout(() => {
            setChatReady(true);
          }, 3000);
        }}

        style={{ flex: 1 }}
      />

    </View>
  )
}

export default Chatscreen

const styles = StyleSheet.create({

  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingTop: 50,
  },

  arrowIcon: {
    width: 32,
    height: 32,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '81%',
  },

  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },

  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555'
  }

})