import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground, StatusBar,
  Platform, Pressable, FlatList, } from 'react-native'
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const ViewTicket = ({ navigation }) => {

    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setBarStyle('dark-content');

    const route = useRoute();
    const currentRoute = route.name;  
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contactID, setContactID] = useState('');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);


    useFocusEffect(
        useCallback(() => {
            const loadUserName = async () => {
            const userFirstName = await AsyncStorage.getItem('userFirstName');
            const userLastName = await AsyncStorage.getItem('userLastName');
            const userContactID = await AsyncStorage.getItem('userID');

            console.log('FOCUS firstName:', userFirstName);
            console.log('FOCUS lastName:', userLastName);
            console.log('FOCUS contactID:', userContactID);

            setFirstName(userFirstName || '');
            setLastName(userLastName || '');
            setContactID(userContactID || '');
            };

            loadUserName();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            const fetchTickets = async () => {
                if (!contactID) return;

                try {
                    setLoading(true);
                    const response = await fetch('https://syilapp-w8ye.onrender.com/get_contact_tickets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contactId: contactID,
                    }),
                    });

                    const data = await response.json();
                    setTickets(data.tickets || []);
                    setLoading(false);
                } catch (error) {
                    console.log('Ticket fetch error', error);
                    setLoading(false);
                }
            };

            fetchTickets();
        }, [contactID])
    );

    console.log('tickets--- ' , tickets);
    console.log('contactID--- ' , contactID);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusText = (ownerId) => {
        switch (ownerId) {
            case '3565407':
            return 'Tech Striker';
            case '4179990':
            return 'Pete Nicholls';
            case '18263262':
            return 'Jorge Murillo';
            case '28520943':
            return 'Paavo Laaksonen';
            case '31659248':
            return 'Mr. Xushuo';
            case '34789817':
            return 'Frans Buikema';
            case '35998790':
            return 'Mr. Chen';
            case '37497897':
            return 'Wesley Wang';
            case '39025454':
            return 'Ulises Rivera';
            case '60897705':
            return 'Ken Zhong';
            case '75260402':
            return 'Petr Dostálek';
            case '75329423':
            return 'Ashot Margaryan';
            case '75539833':
            return 'Nico Hugo';

            case '75539885':
            return 'Lev Levaneusky';
            case '76556861':
            return 'ANTOINE CAGLIOTI';
            case '76783421':
            return 'Gergő Peresztegi-Nagy';
            case '77228346':
            return 'Adinath Parmaj';
            case '77549745':
            return 'Yolyn Sam';
            case '78114697':
            return 'Nicola Roberts';
            case '78929149':
            return 'Doris Zhang';
            case '79421375':
            return 'Alex';
            case '80841596':
            return 'Xiaoyi Wu';
            case '81074581':
            return 'Luka Kljajić';
            case '81074588':
            return 'Renaud Perrin';
            case '81074589':
            return 'Manuel Weiss';
            case '81952028':
            return 'Marc Kneeshaw';
            case '81952029':
            return 'Gary Kneeshaw';
            case '82116023':
            return 'Ludwin Lai';
            case '82335884':
            return 'Mavis Xu';
            case '82335897':
            return 'Molly Che';
            case '82431058':
            return 'Fawad Khawaja';
            case '82472467':
            return 'Ramya Poobathy';
            case '82573946':
            return 'Dimitris Orfanidis';
            case '84095697':
            return 'gary.wallace@syil.com';
            case '84095698':
            return 'andrew.boyd@syil.com';
            case '85488871':
            return 'procurement@gmtgulf.com';
            case '85722551':
            return 'otorres@hartmetallgroup.com';
            case '85722552':
            return 'ivan.campos@campostools.com';
            case '85722553':
            return 'Radu Florin Plaiasu';
            case '85722554':
            return 'yossi@amg-machinery.com';
            case '85722555':
            return 'Walid MEZGHANI';
            case '85722556':
            return 'dan radulescu';
            case '85917932':
            return 'subhi jain';
            case '86106481':
            return 'GMT SYIL Support';
            case '86405174':
            return 'Anna Avetisyan';
            case '86405237':
            return 'Christian Scott';
            case '86405372':
            return 'sales@gmtgulf.com';
            case '86406673':
            return 'Yew Yeen Lee';
            case '87350983':
            return 'eric@syil.com';
            case '149082415':
            return 'Lee Wilkinson';
            case '347885886':
            return 'Brian Ang';
            case '561953197':
            return 'Evgeniya Ustyuzhanina';
            case '562969186':
            return 'Stefan Remde';
            case '685062721':
            return 'ROXANA CARRETO';
            case '730476349':
            return 'Marcus Refsgaard-Schuhmacher';

            case '739253069':
            return 'Richard Chagnon';
            case '972378267':
            return 'mentari@3dzaiku.com';
            case '1041824695':
            return 'Michal Pecina';
            case '1161041533':
            return 'James Mak';
            case '1532728806':
            return 'Joosia Miettinen';
            case '1560210639':
            return 'Tom Marshallsay';
            case '1682515558':
            return 'Chris Keller';
            case '1785961231':
            return 'Siarhei Melianchuk';
            case '1801645151':
            return 'Ivan Cavalera';
            case '1920062735':
            return 'Kaan Mehmetoğlu';
            case '1982134575':
            return 'Jan Crispyn';
            case '2065838673':
            return "Patrick O'Connor";
            case '2101352153':
            return 'Vaibhav Bhujbal';

            default:
            return 'In Progress';
        }
    };


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


            <View style={styles.ticketContainer}>
                {/* TABLE HEADER */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.cell, styles.headerText]}>Ticket ID</Text>
                    <Text style={[styles.cell, styles.headerText]}>Subject</Text>
                    <Text style={[styles.cell, styles.headerText]}>Created</Text>
                    <Text style={[styles.cell, styles.headerText]}>Ticket Owner</Text>
                </View>
                {loading && <Text style={{ textAlign:'center' , padding:10, }}>Loading ticket...</Text>}
                {/* TICKET LIST */}
                <FlatList
                    data={tickets}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.ticketId}
                    //contentContainerStyle={{ paddingBottom: 200, }}
                    contentContainerStyle={{ paddingBottom: 300, paddingTop: 0, flexDirection: 'column-reverse',}}
                    //ListFooterComponent={<View style={{ height: 290 }} />}
                    renderItem={({ item }) => (
                    <Pressable
                        onPress={() =>
                        navigation.navigate('ViewTicketDetail', {
                            ticketId: item.ticketId,
                            subject: item.subject,
                        })
                        }
                    >
                        <View style={styles.tableRow}>
                            <Text style={styles.cellID}>#{item.ticketId}</Text>
                            <Text style={styles.cell}>{item.subject}</Text>
                            <Text style={styles.cell}>{formatDate(item.createdDate)}</Text>
                            <Text
                            style={styles.cell}
                            // style={[
                            //     styles.cell,
                            //     item.status === '173580713' && styles.closedStatus,
                            // ]}
                            >
                            {getStatusText(item.ownerId)}
                            </Text>
                        </View>
                    </Pressable>

                    )}
                />

                {!loading && tickets.length === 0 && (
                    <Text style={styles.noTicketText}>No tickets found</Text>
                )}


                




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
  )
}

export default ViewTicket

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



    ticketContainer: {
        //flex: 1,
        marginTop: 10,
    },

    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },

    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    }, 

    cellID:{
        flex: '0 0 25%',
        width:'25%',
        fontSize: 12,
        color: '#333',
        padding:5,
        fontWeight:700,
    },

    cell: {
        flex: '0 0 25%',
        width:'25%',
        fontSize: 12,
        color: '#333',
        padding:5,
    },

    headerText: {
        fontWeight: '600',
        color: '#000',
    },

    closedStatus: {
        color: '#2e7d32',
        fontWeight: '600',
    },

    noTicketText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
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
