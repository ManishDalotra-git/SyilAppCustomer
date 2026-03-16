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
          };

          loadUserName();
      }, [])
  );



  // ✅ Load data from JSON instead of CSV
  // useEffect(() => {
  //   const cleanData = articlesData.filter(
  //     item => item['Article title'] && item['Article body']
  //   );

  //   setArticles(cleanData);
  //   setLoading(false);
  // }, []);




  
// useEffect(() => {
//   const loadArticles = async () => {
//     try {
//       const filePath = `${RNFS.DocumentDirectoryPath}/articles.json`;

//       // Check if file exists
//       const exists = await RNFS.exists(filePath);
//       let rawData = null;

//       if (exists) {
//         const content = await RNFS.readFile(filePath, 'utf8');
//         rawData = JSON.parse(content);
//       } else {
//         // fallback to bundled JSON import
//         rawData = articlesData;
//       }

//       const cleanData = rawData.filter(
//         item => item['Article title'] && item['Article body']
//       );

//       setArticles(cleanData);
//       setLoading(false);
//     } catch (error) {
//       console.error('Failed to load articles:', error);
//       // fallback to bundled JSON import on error
//       const cleanData = articlesData.filter(
//         item => item['Article title'] && item['Article body']
//       );
//       setArticles(cleanData);
//       setLoading(false);
//     }
//   };

//   loadArticles();
// }, []);

useEffect(() => {
  const fetchArticles = async () => {
    try {
      const response = await fetch(
        'https://syilapp-w8ye.onrender.com/articles'
      );
      const data = await response.json();

      const cleanData = data.filter(
        item => item['Article title'] && item['Article body']
      );

      setArticles(cleanData);
    } catch (err) {
      console.log('Fetch error:', err);

      // fallback (offline safety)
      const cleanData = articlesData.filter(
        item => item['Article title'] && item['Article body']
      );
      setArticles(cleanData);
    } finally {
      setLoading(false);
    }
  };

  fetchArticles();
}, []);



  // ✅ Categories (same logic)
  // const categories = useMemo(() => {
  //   const unique = [...new Set(articles.map(a => a.Category))];
  //   return unique;
  //   //return unique.slice(0, 10);
  // }, [articles]);

    const categories = useMemo(() => {
  const unique = [...new Set(articles.map(a => a.Category))];

  return unique
    .filter(Boolean) // null/undefined remove
    .sort((a, b) => a.localeCompare(b));
}, [articles]);

  // ✅ Search + Category filter (unchanged)
  const filteredArticles = useMemo(() => {
  const filtered = articles.filter(item => {
    const matchSearch =
      item['Article title']
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchCategory = selectedCategory
      ? item.Category === selectedCategory
      : true;

    return matchSearch && matchCategory;
  });

    return filtered.sort((a, b) => {
      const titleA = (a['Article title'] || '').trim();
      const titleB = (b['Article title'] || '').trim();

      const numA = parseInt(titleA.match(/^\d+/)?.[0], 10);
      const numB = parseInt(titleB.match(/^\d+/)?.[0], 10);

      const hasNumA = !isNaN(numA);
      const hasNumB = !isNaN(numB);

      if (hasNumA && hasNumB) {
        return numA - numB;
      }

      if (!hasNumA && hasNumB) return -1;
      if (hasNumA && !hasNumB) return 1;

      return titleA.localeCompare(titleB);
    });
  }, [articles, search, selectedCategory]);


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

          <Text style={styles.popularTitle}>Popular Articles</Text>

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
  articleTitle: { fontSize: 14, fontWeight: '600', color: '#000' },
  articleSub: { fontSize: 12, color: '#777' },

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
});