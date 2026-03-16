import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView, Linking , Modal, StatusBar, Platform,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

const ForgotPassword = () => {

  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('light-content');
  
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert('Email is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://syilapp-w8ye.onrender.com/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || 'Please enter a valid email.');
      } else {
        //alert(result.message); // Thank you message
        Alert.alert(     
        'Success',    
        result.message,
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login'),
          },
        ],
        { cancelable: false }
      );
      }
    } catch (error) {
      alert('Network request failed.');
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={require('../../images/Login_System.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Logo */}
        <Image
          source={require('../../images/syillogo1.png')}
          style={styles.logo}
        />

        {/* Welcome Text */}
        <Text style={styles.welcome}>Welcome back!</Text>

        {/* White Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address to receive a password reset email.
          </Text>

          {/* Email Input */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          {/* Submit Button */}
          <TouchableOpacity disabled={loading} 
          style={[
            styles.button, loading && { opacity: 0.6 }
          ]} onPress={handleForgotPassword}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        
        <Text style={styles.footer} onPress={() => Linking.openURL('mailto:support@syil.com')} >
          Need Help? <Text style={styles.support}>Contact Support</Text>
        </Text>

        <Modal visible={loading} transparent animationType="fade">
            <View style={styles.loadingContainer}>
                {/* <Image
                source={require('../../images/loading.gif')}
                style={styles.loadingGif}
                /> */}
                <Text style={{ fontSize:24,fontWeight:700 }}>Please wait...</Text>
            </View>
        </Modal>
        
      </ScrollView>
    </ImageBackground>
  );
};

export default ForgotPassword;

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
  logo: {
    width: 120,
    height: 50,
    resizeMode: 'contain',
    marginTop: 0,
    alignSelf: 'flex-start',
    marginLeft: 0,
  },
  welcome: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 50,
    textAlign:'center'
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 25,
    padding: 20,
    marginVertical: 20,
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal:40
  },
  label: {
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 100,
    height: 48,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#FFEA00',
    borderRadius: 30,
    height: 50,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#000',
  },
  footer: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  support: {
    color: '#FFEA00',
    fontWeight: '700',
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    },
    loadingGif: {
    width: 150,
    height: 150,
    },
});
