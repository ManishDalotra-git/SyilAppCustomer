import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground, StatusBar,
  Platform, Pressable, Linking } from 'react-native'
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Footer from './components/Footer';

const More = ({ navigation }) => {

    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setBarStyle('dark-content');

    const route = useRoute();
    const currentRoute = route.name;  
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [appSupportTeamMember, setAppSupportTeamMember] = useState(false);

    // const [user, setUser] = useState(null);

    // useEffect(() => {
    //     const getUser = async () => {
    //     const data = await AsyncStorage.getItem('userData');
    //     if (data) {
    //         setUser(JSON.parse(data));
    //     }
    //     };
    //     getUser();
    // }, []);

    // useEffect(() => {
    //     const userData = async () => {
    //     const userFirstName = await AsyncStorage.getItem('userFirstName');
    //     const userLastName = await AsyncStorage.getItem('userLastName');
    //     if (userFirstName) setFirstName(userFirstName);
    //     if (userLastName) setLastName(userLastName);
    //     console.log('userFirstName-- ', userFirstName);
    //     console.log('userLastName-- ', userLastName);
    //     };
    //     userData();
    // }, []);


    useFocusEffect(
        useCallback(() => {
            const loadUserName = async () => {
            const userFirstName = await AsyncStorage.getItem('userFirstName');
            const userLastName = await AsyncStorage.getItem('userLastName');
            const savedEmail = await AsyncStorage.getItem('userEmail');

            console.log('FOCUS firstName:', userFirstName);
            console.log('FOCUS lastName:', userLastName);
            console.log('FOCUS savedEmail:', savedEmail);

            setFirstName(userFirstName || '');
            setLastName(userLastName || '');
            setEmail(savedEmail || '');

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

            
            
            {/* Ask Alex */}
            {email === 'manish.dalotra@techstriker.com' && (
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('UploadArticles')} >
                <View style={styles.left}>
                <Image source={require('../../images/ArticleIcon.png')} style={styles.icon} />
                <Text style={styles.text}>Add New Article</Text>
                </View>
                <Image source={require('../../images/left_arrow.png')} style={styles.Leftarrow} />
            </TouchableOpacity>
            )}

            
            {/* Ask Alex */}
            {/* <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('AskAlex')} >
                <View style={styles.left}>
                <Image source={require('../../images/ask.png')} style={styles.icon} />
                <Text style={styles.text}>Ask Alex</Text>
                </View>
                <Image source={require('../../images/left_arrow.png')} style={styles.Leftarrow} />
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Chatscreen')} >
                <View style={styles.left}>
                <Image source={require('../../images/ask.png')} style={styles.icon} />
                <Text style={styles.text}>Ask Alex</Text>
                </View>
                <Image source={require('../../images/left_arrow.png')} style={styles.Leftarrow} />
            </TouchableOpacity>

            {/* Feedback */}
            <TouchableOpacity onPress={() => navigation.navigate('Feedback')} style={styles.row}>
                <View style={styles.left}>
                <Image source={require('../../images/feedback.png')} style={styles.icon} />
                <Text style={styles.text}>Feedback</Text>
                </View>
                <Image source={require('../../images/left_arrow.png')} style={styles.Leftarrow} />
            </TouchableOpacity>

            {/* Request Quote */}
            <TouchableOpacity style={styles.row} 
                    onPress={() => {
                    const url = 'https://syil.com/contact-us';
                    Linking.canOpenURL(url)
                    .then(supported => {
                        if (supported) {
                        Linking.openURL(url);
                        } else {
                        console.log("Don't know how to open URI: " + url);
                        }
                    })
                    .catch(err => console.error('An error occurred', err));
                }}>
                <View style={styles.left}>
                <Image source={require('../../images/quote.png')} style={styles.icon} />
                <Text style={styles.text}>Request Quote</Text>
                </View>
                <Image source={require('../../images/left_arrow.png')} style={styles.Leftarrow} />
            </TouchableOpacity>

            {/* Customer Stories */}
            <TouchableOpacity style={styles.row} onPress={() => {
                    const url = 'https://syil.com/customer-stories-form';
                    Linking.canOpenURL(url)
                    .then(supported => {
                        if (supported) {
                        Linking.openURL(url);
                        } else {
                        console.log("Don't know how to open URI: " + url);
                        }
                    })
                    .catch(err => console.error('An error occurred', err));
                }}>
                <View style={styles.left}>
                <Image source={require('../../images/customer.png')} style={styles.icon} />
                <Text style={styles.text}>Customer Stories</Text>
                </View>
                <Image source={require('../../images/left_arrow.png')} style={styles.Leftarrow} />
            </TouchableOpacity>

        </View>
    </View>

    <Footer appSupportTeamMember={appSupportTeamMember} currentRoute={currentRoute} />
</ImageBackground>
  )
}

export default More

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
    marginBottom:26,
  },
  rightarrowIcon: { width: 11.86, height: 21.21 },
  logoSyil: { width: 87.6, height: 24 },
  ticketIcon: { width: 26.88, height: 21.88 },
  initialsAvatar:{width:30,height:30,backgroundColor:'#000',borderRadius:100,justifyContent:'center',alignItems:'center',},
  initialsText:{fontSize:14,fontWeight:500,color:'#FFEA00'},
  profileImage:{width:30,height:30,},

  Leftarrow: { width: 11.86, height: 21.21 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    backgroundColor:'#F2F2F2'
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: '#000',
    fontWeight:500,
  },
  arrow: {
    width: 14,
    height: 14,
    tintColor: '#999',
  },
 
})
