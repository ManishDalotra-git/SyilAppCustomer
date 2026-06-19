import React, { useEffect, useState, useCallback} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  KeyboardAvoidingView, 
} from 'react-native';

import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Footer from './components/Footer';

import RenderHtml from 'react-native-render-html';

const CustomerNewsDetail = ({ route, navigation }) => {

  const [appSupportTeamMember, setAppSupportTeamMember] = useState(false);

  StatusBar.setBarStyle('dark-content');
  StatusBar.setBackgroundColor('#fff');

  const { id } = route.params;

  const [newsDetail, setNewsDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();

  const currentRoute = route.name; 

  useEffect(() => {
    fetchDetail();
  }, []);

  
    useFocusEffect(
      useCallback(() => {
          const loadUserName = async () => {
          const userFirstName = await AsyncStorage.getItem('userFirstName');
          const userLastName = await AsyncStorage.getItem('userLastName');

          console.log('FOCUS firstName:', userFirstName);
          console.log('FOCUS lastName:', userLastName);


          const AppSupportTeamMember = await AsyncStorage.getItem('app_support_team_member');
    console.log('AppSupportTeamMember:', AppSupportTeamMember);
    

    if(AppSupportTeamMember === 'Yes'){
      setAppSupportTeamMember(true);
      console.log('AppSupportTeamMember---yes:', AppSupportTeamMember);
    }
          };

          loadUserName();
      }, [])
  );

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        'https://syilappcustomer.onrender.com/customer-news'
      );

      const data = await response.json();

      const matchedNews = data.results.find(
        (item) => item.id === id
      );

      setNewsDetail(matchedNews);

    } catch (error) {
      console.log('Detail Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const tagsStyles = {

    p: {
      marginBottom: 20,
      lineHeight: 28,
      fontSize: 16,
      color: '#333',
    },

    h1: {
      marginTop: 25,
      marginBottom: 20,
      fontSize: 30,
      fontWeight: '700',
      color: '#000',
      lineHeight: 40,
    },

    h2: {
      marginTop: 22,
      marginBottom: 18,
      fontSize: 24,
      fontWeight: '700',
      color: '#000',
      lineHeight: 34,
    },

    h3: {
      marginTop: 20,
      marginBottom: 16,
      fontSize: 20,
      fontWeight: '700',
      color: '#000',
      lineHeight: 30,
    },

    img: {
      marginVertical: 20,
      borderRadius: 10,
    },

    ul: {
      marginBottom: 20,
      paddingLeft: 20,
    },

    li: {
      marginBottom: 10,
      lineHeight: 24,
      fontSize: 16,
      color: '#333',
    },

    a: {
      color: '#0066cc',
      textDecorationLine: 'underline',
    },
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color="#000"
        />
      </View>
    );
  }

  if (!newsDetail) {
    return (
      <View style={styles.center}>
        <Text>No Detail Found</Text>
      </View>
    );
  }

  const topHtml = (
  newsDetail.widgets?.module_17448073638533?.body?.html || ''
).replace(/\{\{[\s\S]*?\}\}/g, '');


const cleanedPostBody = (
  newsDetail.postBody || ''
).replace(/\{\{[\s\S]*?\}\}/g, '');

  return (
    <View style={styles.background}>
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../../images/circle_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Customer News Detail
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >

        {/* TITLE */}

        <Text style={styles.title}>
          {newsDetail.htmlTitle}
        </Text>

        {/* DATE */}

        <Text style={styles.date}>
          Latest Updated:{' '}
          {formatDate(newsDetail.publishDate)}
        </Text>

        {/* TOP HTML */}

        <RenderHtml
          contentWidth={width - 32}
          source={{
            html:topHtml,  
          }}
          tagsStyles={tagsStyles}
          renderersProps={{
            img: {
              enableExperimentalPercentWidth: true,
            },
          }}
        />

        {/* FEATURE IMAGE */}

        <Image
          source={{
            uri: newsDetail.featuredImage,
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* POST BODY */}

        <RenderHtml
          contentWidth={width - 32}
          source={{
            html: cleanedPostBody || '',
          }}
          tagsStyles={tagsStyles}
          renderersProps={{
            img: {
              enableExperimentalPercentWidth: true,
            },
          }}
        />

        {/* BUTTON */}

        {newsDetail.widgets
          ?.module_17447901888127
          ?.body?.link?.url?.href && (

          <TouchableOpacity
  style={styles.button}
  onPress={() => {
    const path =
      newsDetail.widgets
        ?.module_17447901888127
        ?.body?.link?.url?.href;

    const fullUrl = `https://us.syil.com${path}`;

    Linking.openURL(fullUrl);
  }}
>
  <Text style={styles.buttonText}>
    Get Pricing
  </Text>
</TouchableOpacity>
        )}

      </ScrollView>

    </View>
    <Footer appSupportTeamMember={appSupportTeamMember} currentRoute={currentRoute} />
    </View>
  );
};

export default CustomerNewsDetail;

const styles = StyleSheet.create({

  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:
      Platform.OS === 'android' ? 40 : 20,
      paddingHorizontal: 16,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    //paddingHorizontal: 16,
  },

  arrowIcon: {
    width: 32,
    height: 32,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    width: '82%',
    textAlign: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 42,
    marginTop: 10,
  },

  date: {
    fontSize: 14,
    color: '#777',
    marginBottom: 25,
  },

  image: {
    width: '100%',
    height: 260,
    marginVertical: 25,
  },

  button: {
    backgroundColor: '#000',
    marginHorizontal: 16,
    marginTop: 30,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

});