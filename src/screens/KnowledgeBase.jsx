import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image,
  Pressable,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';

// ✅ JSON import
import articlesData from '../../assets/articles.json';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Footer from './components/Footer';

const KnowledgeBase = ({ navigation }) => {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [appSupportTeamMember, setAppSupportTeamMember] = useState(false);


  const route = useRoute();
  const currentRoute = route.name;  





  useFocusEffect(
      useCallback(() => {
          const loadUserName = async () => {
          const userFirstName = await AsyncStorage.getItem('userFirstName');
          const userLastName = await AsyncStorage.getItem('userLastName');

          console.log('FOCUS firstName:', userFirstName);
          console.log('FOCUS lastName:', userLastName);

          setFirstName(userFirstName || '');
          setLastName(userLastName || '');

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


useEffect(() => {
  const fetchArticles = async () => {
    try {

      // http://192.168.0.58:3000/
      // https://syilapp-w8ye.onrender.com

      const response = await fetch(
        'http://192.168.0.32:3000/articles'
      );
      const data = await response.json();

      // const cleanData = data.filter(
      //   item => item['Article title'] && item['Article body']
      // );

      const cleanData = data
  .filter(item => item['Article title'] && item['Article body'])
  .map(item => ({
    ...item,
    newArticle: String(item.newArticle).toLowerCase() === 'true',
  }));

      setArticles(cleanData);
    } catch (err) {
      console.log('Fetch error:', err);

      const cleanData = articlesData
  .filter(item => item['Article title'] && item['Article body'])
  .map(item => ({
    ...item,
    newArticle: String(item.newArticle).toLowerCase() === 'true',
  }));
      setArticles(cleanData);
    } finally {
      setLoading(false);
    }
  };

  fetchArticles();
}, []);

useEffect(() => {
  if (route.params?.tab === 'new') {
    setActiveTab('new');
  }
}, [route.params]);



    const categories = useMemo(() => {
  const unique = [...new Set(articles.map(a => a.Category))];

  return unique
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}, [articles]);



  const [activeTab, setActiveTab] = useState('all');

  const hasNewArticles = useMemo(() => {
  return articles.some(item => item.newArticle === true);
}, [articles]);


  const filteredArticles = useMemo(() => {
  const filtered = articles.filter(item => {
    const matchSearch =
      item['Article title']
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchCategory = selectedCategory
      ? item.Category === selectedCategory
      : true;

    const matchTab =
  activeTab === 'new'
    ? String(item.newArticle).toLowerCase() === 'true'
    : true;

    return matchSearch && matchCategory && matchTab;
  });

  return filtered.sort((a, b) => {
    const titleA = (a['Article title'] || '').trim();
    const titleB = (b['Article title'] || '').trim();

    const numA = parseInt(titleA.match(/^\d+/)?.[0], 10);
    const numB = parseInt(titleB.match(/^\d+/)?.[0], 10);

    const hasNumA = !isNaN(numA);
    const hasNumB = !isNaN(numB);

    if (hasNumA && hasNumB) return numA - numB;
    if (!hasNumA && hasNumB) return -1;
    if (hasNumA && !hasNumB) return 1;

    return titleA.localeCompare(titleB);
  });
}, [articles, search, selectedCategory, activeTab]);


  console.log('articles----- ' , articles);


  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() =>
        navigation.navigate('KnowledgeDetail', { article: item })
      }
    >
      <Image
        source={require('../../images/catg_list_icon.png')}
        style={styles.articleIcon}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.articleTitle}>
          {item['Article title']}
        </Text>
        <Text style={styles.articleSub}>
          {item.Subcategory?.trim()
            ? item.Subcategory
            : item.Category}
        </Text>
      </View>

      <Image
        source={require('../../images/left_arrow.png')}
        style={styles.Leftarrow}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }


  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.charAt(0)?.toUpperCase() || '';
    return `${f}${l}`;
  };


  return (
    <ImageBackground style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        <View style={styles.containerInner}>

          {/* HEADER */}
          <View style={styles.flexClass}>
            <Pressable onPress={() => navigation.navigate('Profile')}>
              {/* <Image
                source={require('../../images/right_arrow.png')}
                style={styles.rightarrowIcon}
              /> */}

                {/* <Image
                  source={require('../../images/profile_icon.png')}
                  style={styles.profileImage}
                /> */}
                
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

          {/* SEARCH */}
          <View style={styles.searchBox}>
            <Image
              source={require('../../images/search_icon.png')}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search Knowledge Base"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
          </View>

          {/* CATEGORY LIST */}
          <View style={styles.categoryList}>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.categoryRow}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryCardBase,
                    selectedCategory === item && styles.activeCategory,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === item ? null : item
                    )
                  }
                >
                  <Image
                    source={require('../../images/catg_icon.png')}
                    style={styles.categoryIcon}
                  />
                  <Text style={styles.categoryText} numberOfLines={2}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          

          {hasNewArticles && (
  <View style={styles.tabContainer}>
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === 'all' && styles.activeTab,
      ]}
      onPress={() => setActiveTab('all')}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === 'all' && styles.activeTabText,
        ]}
      >
        All Articles
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === 'new' && styles.activeTab,
      ]}
      onPress={() => setActiveTab('new')}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === 'new' && styles.activeTabText,
        ]}
      >
        New Articles
      </Text>
    </TouchableOpacity>
  </View>
)}

<Text style={styles.popularTitle}>
  {activeTab === 'new' ? 'New Articles' : 'All Articles'}
</Text>

          {/* ARTICLE LIST */}
          <View style={styles.articleListWrapper}>
            <FlatList
              data={filteredArticles}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.articleListContent}
              ListFooterComponent={<View style={{ height: 580 }} />}
            />
          </View>
        </View>
      </View>

      <Footer appSupportTeamMember={appSupportTeamMember} currentRoute={currentRoute} />
    </ImageBackground>
  );
};

export default KnowledgeBase;

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    backgroundColor: '#fff',
  },
  containerInner: {},
  flexClass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightarrowIcon: { width: 11.86, height: 21.21 },
  logoSyil: { width: 87.6, height: 24 },
  ticketIcon: { width: 26.88, height: 21.88 },
  initialsAvatar:{width:30,height:30,backgroundColor:'#000',borderRadius:100,justifyContent:'center',alignItems:'center',},
  initialsText:{fontSize:14,fontWeight:500,color:'#FFEA00'},
  profileImage:{width:30,height:30,},


  categoryRow: { marginTop: 15, height: 100 },
  activeCategory: {
    backgroundColor: '#FFEA00',
    padding: 10,
    borderRadius: 10,
    height: 96,
  },
  categoryCardBase: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    width: 90,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F5F5F7',
    backgroundColor: '#fff',
    height: 96,
  },
  categoryIcon: { width: 41, height: 41, marginBottom: 6 },
  categoryText: { fontSize: 12, textAlign: 'center' },

  popularTitle: { fontSize: 20, fontWeight: '700', marginVertical: 10 },

  articleListWrapper: { backgroundColor: '#F5F5F7', marginTop: 10 },
  articleListContent: { paddingTop: 10, paddingBottom: 30 },

  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#FFF',
  },
  articleIcon: { width: 41, height: 41, marginRight: 8 },
  Leftarrow: { width: 11.86, height: 21.21 },
  articleTitle: { fontSize: 14, fontWeight: '600', color: '#000', paddingRight:10, },
  articleSub: { fontSize: 12, color: '#777', paddingRight:10, },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    marginTop: 26,
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





  tabContainer: {
  flexDirection: 'row',
  marginTop: 10,
  marginBottom: 5,
},

tabButton: {
  flex: 1,
  paddingVertical: 10,
  borderBottomWidth: 2,
  borderBottomColor: 'transparent',
  alignItems: 'center',
},

activeTab: {
  borderBottomColor: '#FFEA00',
},

tabText: {
  fontSize: 14,
  color: '#777',
},

activeTabText: {
  color: '#000',
  fontWeight: '600',
},

});