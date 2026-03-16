import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, StatusBar, Platform, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ThankYou = ({ route }) => {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');
  const navigation = useNavigation();
const { ticketId } = route.params || {};
  return (
   <ImageBackground
          style={styles.background}
          resizeMode="cover"
        >
    <ScrollView contentContainerStyle={styles.container} >
    <View >

      <Pressable onPress={() => navigation.navigate('Home')} >
      <View style={styles.flexClass}>
        <Image
          source={require('../../images/circle_arrow.png')}
          style={styles.arrowIcon}
        />
        <Text style={styles.labelText}>Done</Text>
      </View>
      </Pressable>

      <Image source={require('../../images/thankyou_image.png')} style={styles.logo} />
      <Text style={styles.title}>Your Ticket Has Been  Submitted</Text>
      <Text style={styles.text}>
        Our team will reply to your ticket soon. You can track the conversation in View Tickets.
      </Text>
        {ticketId && (
            <Text style={styles.ticketId}>
            Reference Number : {ticketId}
            </Text>
        )} 

        <Pressable onPress={() => navigation.navigate('KnowledgeBase')} style={styles.card}>
            <View style={styles.button} >
            <Text style={styles.buttonText}>Explore Knowledge Base</Text>
            </View>
        </Pressable>
    </View>
    </ScrollView>
    </ImageBackground>
  );
};

export default ThankYou;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    paddingBottom: 30,
  },
  flexClass:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:0,
    paddingVertical:16,
    marginHorizontal:0,
    boxShadow:'0px 0px 0px 0px #ccccccff',
    marginBottom:30,
  },
  labelText:{
    fontSize:24,
    fontWeight:700,
    textAlign:'center'
  },
  arrowIcon:{
    width:32,
    height:32,
  },
  logo:{
    textAlign:'center',
    marginHorizontal: 'auto'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign:'center',
    marginTop:16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    textAlign:'center'
  },
  ticketId:{
    backgroundColor: '#F5F5F7',
    padding:16,
    width:'100%',
    borderRadius:8,
    fontSize:16
  },
  card: {
    backgroundColor: '#FFEA00',
    padding: 15,
    borderRadius: 100,
    width: '100%',
    marginTop:45,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign:'center'
  },
});
