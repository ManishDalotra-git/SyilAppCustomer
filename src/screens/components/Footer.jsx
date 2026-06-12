import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const Footer = ({ appSupportTeamMember, currentRoute }) => {
  const navigation = useNavigation();
  //const route = useRoute();
  //const currentRoute = route.name;

  return (
    <View style={styles.footer}>
      
      <TouchableOpacity
        style={[styles.footerItem, currentRoute === 'Home' && styles.activeFooterItem]}
        onPress={() => navigation.navigate('Home')}
      >
        <Image source={require('../../../images/home.png')} style={[styles.footerIcon, currentRoute === 'Home' && styles.activeFooterIcon]} />
        <Text style={[styles.footerText, currentRoute === 'Home' && styles.activeFooterText]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.footerItem, currentRoute === 'KnowledgeBase' && styles.activeFooterItem]}
        onPress={() => navigation.navigate('KnowledgeBase')}
      >
        <Image source={require('../../../images/knowledge.png')} style={[styles.footerIcon, currentRoute === 'KnowledgeBase' && styles.activeFooterIcon]} />
        <Text style={[styles.footerText, currentRoute === 'KnowledgeBase' && styles.activeFooterText]}>Knowledge</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.footerItem, currentRoute === 'Ticket' && styles.activeFooterItem]}
        onPress={() => navigation.navigate('Ticket')}
      >
        <Image source={require('../../../images/submit.png')} style={[styles.footerIcon, currentRoute === 'Ticket' && styles.activeFooterIcon]} />
        <Text style={[styles.footerText, currentRoute === 'Ticket' && styles.activeFooterText]}>Submit Ticket</Text>
      </TouchableOpacity>

      {appSupportTeamMember ? (
        <TouchableOpacity
          style={[styles.footerItem, currentRoute === 'OwnerTickets' && styles.activeFooterItem]}
          onPress={() => navigation.navigate('OwnerTickets')}
        >
          <Image source={require('../../../images/view.png')} style={[styles.footerIcon, currentRoute === 'OwnerTickets' && styles.activeFooterIcon]} />
          <Text style={[styles.footerText, currentRoute === 'OwnerTickets' && styles.activeFooterText]}>View Tickets</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.footerItem, currentRoute === 'ViewTicket' && styles.activeFooterItem]}
          onPress={() => navigation.navigate('ViewTicket')}
        >
          <Image source={require('../../../images/view.png')} style={[styles.footerIcon, currentRoute === 'ViewTicket' && styles.activeFooterIcon]} />
          <Text style={[styles.footerText, currentRoute === 'ViewTicket' && styles.activeFooterText]}>View Tickets</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.footerItem, currentRoute === 'More' && styles.activeFooterItem]}
        onPress={() => navigation.navigate('More')}
      >
        <Image source={require('../../../images/more.png')} style={[styles.footerIcon, currentRoute === 'More' && styles.activeFooterIcon]} />
        <Text style={[styles.footerText, currentRoute === 'More' && styles.activeFooterText]}>More</Text>
      </TouchableOpacity>

    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingBottom: 25,
  },
  footerIcon: {
    width: 22,
    height: 22,
    marginBottom: 4,
    tintColor: '#666',
    objectFit: 'contain',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  activeFooterItem:{
  boxShadow:'0px -2px 0px 0px #FFEA00'
},
  activeFooterIcon: {
    tintColor: '#000',
  },
  activeFooterText: {
    color: '#000',
    fontWeight: '500',
  },
});