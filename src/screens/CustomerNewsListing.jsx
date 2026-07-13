import React, { useEffect, useState, useMemo , useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Platform,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView, 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Footer from './components/Footer';
const CustomerNewsListing = ({ navigation }) => {

    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor('#fff');

  const [appSupportTeamMember, setAppSupportTeamMember] = useState(false);

  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const route = useRoute();
  const currentRoute = route.name;  

  useEffect(() => {
    fetchNews();
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


  const fetchNews = async () => {
  try {
    setLoading(true);

    const response = await fetch(
      'https://syilappcustomer.onrender.com/customer-news'
    );

    const data = await response.json();

    const sortedData = (data.results || []).sort(
      (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
    );

    setNews(sortedData);
    setFilteredNews(sortedData);
  } catch (error) {
    console.log('News Error:', error);
  } finally {
    setLoading(false);
  }
};


  const handleSearch = (text) => {
    setSearch(text);

    if (text.trim() === '') {
      setFilteredNews(news);
      return;
    }

    const filtered = news.filter((item) =>
      item.htmlTitle
        ?.toLowerCase()
        .includes(text.toLowerCase())
    );

    setFilteredNews(filtered);
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

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('CustomerNewsDetail', {
            id: item.id,
          })
        }
      >
        <Image
          source={{ uri: item.featuredImage }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={
            item.featuredImageAltText || item.htmlTitle
          }
        />

        <Text style={styles.date}>
          {formatDate(item.publishDate)}
        </Text>

        <Text style={styles.title} numberOfLines={2}>
          {item.htmlTitle}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.background}>

    <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // adjust if you have headers
                  >
    <View style={styles.container}>

        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
                source={require('../../images/circle_arrow.png')}
                style={styles.arrowIcon}
            />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Customer News Listing</Text>
        </View>
        <View style={styles.containerInner}>

    <View style={styles.searchBox}>
      <Image  
            source={require('../../images/search_icon.png')}
            style={styles.searchIcon}
          />
        <TextInput
          placeholder="Search Blog"
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
      </View>
      

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#000"x
        />
      ) : (
        <FlatList
          //data={filteredNews}
          data={filteredNews.filter(item => item.currentState === 'PUBLISHED')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }} 
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          ListFooterComponent={<View style={{ height: 130 }} />}
        />
      )}
      </View>

    </View>

    
    </KeyboardAvoidingView>
      <Footer appSupportTeamMember={appSupportTeamMember} currentRoute={currentRoute} />
    </View>
  );
};

export default CustomerNewsListing;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },

  header: { height: 65, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  arrowIcon: { width: 32, height: 32, },
  headerTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center', width: '82%' },

  containerInner: { paddingHorizontal: 16,},

  // searchContainer: {
  //   marginBottom: 20,
  // },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    marginTop: 0,
    marginBottom: 20,
    borderRadius: 25,
    height: 45,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginHorizontal: 16,
    tintColor: '#777',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#000' },


  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 20,
  },

  card: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: 150,
  },

  date: {
    fontSize: 12,
    color: '#777',
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 10,
    paddingBottom: 12,
    paddingTop: 4,
  },
});