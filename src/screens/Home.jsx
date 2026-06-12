import { StyleSheet, Text, View, ImageBackground , Pressable, Image, ScrollView, StatusBar, Platform,TouchableOpacity,  } from 'react-native'
import React, { useEffect, useState, useMemo, useCallback } from 'react';
//import { useNavigation } from '@react-navigation/native';
import { useNavigation, useRoute, useFocusEffect  } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from './components/Footer';

const Home = () => {

  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('light-content'); 
   

  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;  
  const [newCount, setNewCount] = useState(0);
  const [showBell, setShowBell] = useState(false);
  const [latestId, setLatestId] = useState(null);
  const [appSupportTeamMember, setAppSupportTeamMember] = useState(false);

  useEffect(() => {
  const fetchArticles = async () => {
    try {

      // http://192.168.0.91:3000/
      // https://syilapp-w8ye.onrender.com
      const res = await fetch('http://192.168.0.32:3000/articles');
      const data = await res.json();

      // const count = data.filter(item => {
      //   return String(item.newArticle).toLowerCase() === 'true';
      // }).length;

      const newArticles = data.filter(item =>
        String(item.newArticle).toLowerCase() === 'true'
      );

      const latestNewArticle = newArticles[newArticles.length - 1];

      setNewCount(newArticles.length);

      if (latestNewArticle && latestNewArticle["Last modified date"]) {
        setLatestId(String(latestNewArticle["Last modified date"]));
      }

    } catch (e) {
      console.log('Home fetch error', e);

      const count = articlesData.filter(item => {
        return String(item.newArticle).toLowerCase() === 'true';
      }).length;

      setNewCount(count);
    }
  };

  fetchArticles();
}, []);



useFocusEffect(
  useCallback(() => {
    const init = async () => {
      try {
        // 1️⃣ USER STATUS API CALL
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) return;

        // http://192.168.0.41:3000/
      // https://syilapp-w8ye.onrender.com

        const res = await fetch(
          'http://192.168.0.32:3000/get-user-data',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          }
        );

        const data = await res.json();

        console.log('API AppSupportTeamMember:', data.app_support_team_member);

        let supportValue = 'No';

        if (data.app_support_team_member === 'Yes') {
          setAppSupportTeamMember(true);
          supportValue = 'Yes';
        } else {
          setAppSupportTeamMember(false);
        }

        await AsyncStorage.setItem('app_support_team_member', supportValue);

        // 2️⃣ BELL STATUS CHECK (API ke baad)
        const storedId = await AsyncStorage.getItem('lastSeenArticleId');

        if (!latestId) return;

        if (storedId !== latestId) {
          setShowBell(true);
        } else {
          setShowBell(false);
        }

      } catch (err) {
        console.log('Init error:', err);
      }
    };

    init();
  }, [latestId])
);



// useEffect(() => { 
//   const checkBellStatus = async () => {

//     const storedId = await AsyncStorage.getItem('lastSeenArticleId');
//     const AppSupportTeamMember = await AsyncStorage.getItem('app_support_team_member');
//     console.log('AppSupportTeamMember:', AppSupportTeamMember);
    

//     if(AppSupportTeamMember === 'Yes'){
//       setAppSupportTeamMember(true);
//       console.log('AppSupportTeamMember---yes:', AppSupportTeamMember);
//     }

    

//     if (!latestId) return;

//     if (storedId !== latestId) {
//       setShowBell(true);
//     } else {
//       setShowBell(false);
//     }
//   };

//   checkBellStatus();
// }, [latestId]);


  return (
    <ImageBackground source={require('../../images/Login_System.png')}  style={styles.background}
      resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* <View>
        <Image source={require('../../images/syil_logo_white.png')} style={styles.logo} />
      </View> */}

      <View style={styles.headerRow}>
        <Image
          source={require('../../images/syil_logo_white.png')}
          style={styles.logo}
        />

  {newCount > 0 && showBell && (
    <TouchableOpacity
      style={styles.bellWrapper}
      onPress={async () => {
        if (!latestId) return;

        await AsyncStorage.setItem('lastSeenArticleId', String(latestId));
        setShowBell(false);

        navigation.navigate('KnowledgeBase', { tab: 'new' });
      }}
    >
      <Image
        source={require('../../images/bell.png')}
        style={styles.bellIcon}
      />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{newCount}</Text>
      </View>
    </TouchableOpacity>
  )}
</View>

      <Text style={styles.welcome}>Customer Portal</Text>

      <Pressable onPress={() => navigation.navigate('KnowledgeBase')} style={styles.card}>
        <View style={styles.cardFlex} >
          <Image style={styles.cardImage} source={require('../../images/knowledge-base.png')} /> 
          <Image style={styles.arrow} source={require('../../images/arrow.png')} /> 
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Knowledge Base</Text>
          <Text style={styles.cardDesc}>
            Sales presentations, Manuals, Technical Files and more.
          </Text>
        </View>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Ticket')} style={styles.card}>
        <View style={styles.cardFlex}>
          <Image style={styles.cardImage} source={require('../../images/Contact_support.png')} /> 
          <Image style={styles.arrow} source={require('../../images/arrow.png')} /> 
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Contact Support</Text>
          <Text style={styles.cardDesc}>
            Submit a support ticket and get a fast response.
          </Text>
        </View>
      </Pressable>

      </ScrollView>

      <Footer appSupportTeamMember={appSupportTeamMember} currentRoute={currentRoute} />

    </ImageBackground>
  )
}

export default Home

const styles = StyleSheet.create({
  background: { 
    flex:1, 
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    paddingBottom: 150,
  },
  heightAuto:{
    alignItems: 'center',
    paddingBottom: 40,
    height:'100%',
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: 'contain',
    marginTop: 0,
    alignSelf: 'center',
    marginLeft: 0,
    marginVertical:'auto',
    justifyContent:'center',
  },
  welcome: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 40,
    textAlign:'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 22,
    height:'auto',
    minHeight:185,
  },
  cardImage:{
    width:50,
    height:50,
  },
  cardFlex:{
    display:'flex',
    flexWrap:'nowrap',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    marginTop:10
  },
  cardDesc: {
    fontSize: 16,
    color: '#000',
  },
  arrow: {
    fontSize: 26,
    color: '#000',
    marginLeft: 10,
  },



  headerRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
},

bellWrapper: {
  position: 'absolute',
  top: 4,
  right: 0,
},

bellIcon: {
  width: 36,
  height: 36,
},

badge: {
  position: 'absolute',
  top: 3,
  right: 3,
  backgroundColor: 'red',
  borderRadius: 10,
  minWidth: 18,
  height: 18,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 4,
},

badgeText: {
  color: '#fff',
  fontSize: 8,
  fontWeight: '700',
},

})