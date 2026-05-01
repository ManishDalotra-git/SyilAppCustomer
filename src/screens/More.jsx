import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground, StatusBar,
  Platform, Pressable, Linking } from 'react-native'
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const More = ({ navigation }) => {

    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setBarStyle('dark-content');

    const route = useRoute();
    const currentRoute = route.name;  
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

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

            {email === 'manish.dalotra@techstriker.com' && (
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('OwnerTickets')} >
                <View style={styles.left}>
                <Image source={require('../../images/ArticleIcon.png')} style={styles.icon} />
                <Text style={styles.text}>Owner Tickets</Text>
                </View>
                <Image source={require('../../images/left_arrow.png')} style={styles.Leftarrow} />
            </TouchableOpacity>
            )}

            {/* Ask Alex */}
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('AskAlex')} >
                <View style={styles.left}>
                <Image source={require('../../images/ask.png')} style={styles.icon} />
                <Text style={styles.text}>Ask Alex</Text>
                </View>
                <Image source={require('../../images/left_arrow.png')} style={styles.Leftarrow} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Chatscreen')} >
                <View style={styles.left}>
                <Image source={require('../../images/ask.png')} style={styles.icon} />
                <Text style={styles.text}>Chat Screen</Text>
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
