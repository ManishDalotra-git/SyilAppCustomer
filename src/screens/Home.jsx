import { StyleSheet, Text, View, ImageBackground , Pressable, Image, ScrollView, StatusBar, Platform,TouchableOpacity,  } from 'react-native'
import React, { useEffect, useState, useMemo, useCallback } from 'react';
//import { useNavigation } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {

  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('light-content'); 
   

  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;  
  const [newCount, setNewCount] = useState(0);
  const [showBell, setShowBell] = useState(true);
  const [latestId, setLatestId] = useState(null);


  useEffect(() => {
  const fetchArticles = async () => {
    try {
      const res = await fetch('https://syilapp-w8ye.onrender.com/articles');
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

useEffect(() => {
  const checkBellStatus = async () => {
    const storedId = await AsyncStorage.getItem('lastSeenArticleId');

    if (!latestId) return;

    if (storedId !== latestId) {
      setShowBell(true);
    } else {
      setShowBell(false);
    }
  };

  checkBellStatus();
}, [latestId]);


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

      <Text style={styles.welcome}>Dealer Portal</Text>

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

      <View style={styles.footer}>
                <TouchableOpacity style={[
                    styles.footerItem,
                    currentRoute === 'Home' && styles.activeFooterItem,
                ]} 
                onPress={() => navigation.navigate('Home')}
                >
                <Image source={require('../../images/home.png')} style={[
                    styles.footerIcon,
                    currentRoute === 'Home' && styles.activeFooterIcon,
                    ]} />
                <Text style={[
                    styles.footerText,
                    currentRoute === 'Home' && styles.activeFooterText,
                    ]}>Home</Text>
                </TouchableOpacity>
      
                <TouchableOpacity
                style={[
                    styles.footerItem,
                    currentRoute === 'KnowledgeBase' && styles.activeFooterItem,
                ]}
                onPress={() => navigation.navigate('KnowledgeBase')}
                >
                <Image
                    source={require('../../images/knowledge.png')}
                    style={[
                    styles.footerIcon,
                    currentRoute === 'KnowledgeBase' && styles.activeFooterIcon,
                    ]}
                />
                <Text
                    style={[
                    styles.footerText,
                    currentRoute === 'KnowledgeBase' && styles.activeFooterText,
                    ]}
                >
                    Knowledge
                </Text>
                </TouchableOpacity>
      
      
                <TouchableOpacity style={[
                    styles.footerItem,
                    currentRoute === 'Ticket' && styles.activeFooterItem,
                ]}
                onPress={() => navigation.navigate('Ticket')}
                >
                <Image source={require('../../images/submit.png')} style={[
                    styles.footerIcon,
                    currentRoute === 'Ticket' && styles.activeFooterIcon,
                    ]} />
                <Text style={[
                    styles.footerText,
                    currentRoute === 'Ticket' && styles.activeFooterText,
                    ]}>Submit Ticket</Text>
                </TouchableOpacity>
      
                <TouchableOpacity style={[
                    styles.footerItem,
                    currentRoute === 'ViewTicket' && styles.activeFooterItem,
                ]} 
                onPress={() => navigation.navigate('ViewTicket')}
                >
                <Image source={require('../../images/view.png')} style={[
                    styles.footerIcon,
                    currentRoute === 'ViewTicket' && styles.activeFooterIcon,
                    ]} />
                <Text style={[
                    styles.footerText,
                    currentRoute === 'ViewTicket' && styles.activeFooterText,
                    ]}>View Tickets</Text>
                </TouchableOpacity>
      
                <TouchableOpacity style={[
                    styles.footerItem,
                    currentRoute === 'More' && styles.activeFooterItem,
                ]} onPress={() => navigation.navigate('More')}> 
                <Image source={require('../../images/more.png')} style={[
                    styles.footerIcon,
                    currentRoute === 'More' && styles.activeFooterIcon,
                    ]} />
                <Text style={[
                    styles.footerText,
                    currentRoute === 'More' && styles.activeFooterText,
                    ]}>More</Text>
                </TouchableOpacity>
            </View>

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



  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    //height: 80,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal:16,
    boxShadow:'0 0 5px 0px #dfdfdf'
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical:16,
    paddingBottom:25,
  },
  footerIcon: {
    width: 22,
    height: 22,
    marginBottom: 4,
    tintColor: '#666666',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
  },
  activeFooterItem:{
    boxShadow:'0px -2px 0px 0px #FFEA00'
  },
  activeFooterIcon:{
    tintColor: '#000',
  },
  activeFooterText:{
    color:'#000',
    fontWeight:500,
  },
})