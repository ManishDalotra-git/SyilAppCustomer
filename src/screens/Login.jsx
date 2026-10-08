import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView, Modal, Linking,  StatusBar, Platform, KeyboardAvoidingView, 
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { setContactId } from '../utils/hiddenFields';
import {
  saveFCMToken,
  startFCMTokenRefreshListener,
} from '../utils/fcm';

const Login = () => {


  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('light-content');

  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {

  // =====================================================
  // VALIDATION
  // =====================================================

  if (!username.trim() || !password) {
    alert('Please enter email and password');
    return;
  }


  setLoading(true);


  try {

    // =====================================================
    // NORMALIZE EMAIL
    // =====================================================

    const normalizedEmail =
      username.trim().toLowerCase();


    console.log(
      '=========================================='
    );

    console.log(
      'CUSTOMER LOGIN START'
    );

    console.log(
      'Email:',
      normalizedEmail
    );

    console.log(
      '=========================================='
    );


    // =====================================================
    // LOGIN API
    // =====================================================

    const response = await fetch(
      'https://syilappcustomer.onrender.com/check_login_detail',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email: normalizedEmail,
          password: password,
        }),
      }
    );


    // =====================================================
    // READ SERVER RESPONSE
    // =====================================================

    const responseText =
      await response.text();

    let result = {};

    try {

      result =
        responseText
          ? JSON.parse(responseText)
          : {};

    } catch (parseError) {

      console.log(
        'Login JSON parse error:',
        parseError
      );

      setLoading(false);

      alert(
        'Invalid server response'
      );

      return;
    }


    // =====================================================
    // SERVER LOGIN FAILED
    // =====================================================

    if (!response.ok) {

      console.log(
        'Customer login failed:',
        result
      );

      setLoading(false);

      alert(
        result.message ||
        'Login failed'
      );

      return;
    }


    // =====================================================
    // GET MOBILE APP PERMISSION
    // =====================================================

    const mobileAppPermission =
      String(
        result.user?.mobile_app_permission ?? ''
      )
        .trim()
        .toLowerCase();


        console.log('LOGIN RESPONSE STATUS:', response.status);

        console.log(
          'LOGIN RESPONSE STRUCTURE:',
          JSON.stringify({
            success: result.success,
            topLevelPermission: result.mobile_app_permission,
            userPermission: result.user?.mobile_app_permission,
            userPropertyKeys: Object.keys(result.user || {}),
          })
        );


    console.log(
      'Mobile App Permission:',
      mobileAppPermission
    );


    // =====================================================
    // CUSTOMER APP PERMISSION CHECK
    // =====================================================

    const hasCustomerAppPermission =
      mobileAppPermission === 'customer app' ||
      mobileAppPermission === 'customer_app';


    if (!hasCustomerAppPermission) {

      console.log(
        'LOGIN BLOCKED: Customer App permission missing'
      );

      setLoading(false);

      alert(
        'You are not authorized to use the Customer App.'
      );

      return;
    }


    // =====================================================
    // LOGIN SUCCESS
    // =====================================================

    console.log(
      '=========================================='
    );

    console.log(
      'CUSTOMER LOGIN SUCCESS'
    );

    console.log(
      'Contact ID:',
      result.contactId
    );

    console.log(
      'Permission:',
      result.user?.mobile_app_permission
    );

    console.log(
      '=========================================='
    );


    // =====================================================
    // SAVE LOGIN STATE
    // =====================================================

    await AsyncStorage.setItem(
      'isLoggedIn',
      'true'
    );

    await AsyncStorage.setItem(
      'lastLoginTime',
      Date.now().toString()
    );

    await AsyncStorage.setItem(
      'userEmail',
      normalizedEmail
    );


    // =====================================================
    // SAVE MOBILE APP PERMISSION
    // =====================================================

    await AsyncStorage.setItem(
      'mobile_app_permission',
      String(
        result.user?.mobile_app_permission ?? ''
      )
    );


    // =====================================================
    // SAVE CONTACT ID
    // =====================================================

    setContactId(
      result.contactId
    );


    // =====================================================
    // SAVE COMPLETE USER DATA
    // =====================================================

    await AsyncStorage.setItem(
      'userData',
      JSON.stringify({
        ...result.user,
        contactId:
          result.contactId,
      })
    );


    // =====================================================
    // SAVE INDIVIDUAL USER DATA
    // =====================================================

    await AsyncStorage.setItem(
      'userID',
      String(
        result.contactId ?? ''
      )
    );

    await AsyncStorage.setItem(
      'userFirstName',
      String(
        result.user?.firstName ?? ''
      )
    );

    await AsyncStorage.setItem(
      'userLastName',
      String(
        result.user?.lastName ?? ''
      )
    );

    await AsyncStorage.setItem(
      'userBio',
      String(
        result.user?.bio ?? ''
      )
    );

    await AsyncStorage.setItem(
      'userPhone',
      String(
        result.user?.phone ?? ''
      )
    );

    await AsyncStorage.setItem(
      'userGender',
      String(
        result.user?.gender ?? ''
      )
    );

    await AsyncStorage.setItem(
      'app_support_team_member',
      String(
        result.user?.app_support_team_member ?? ''
      )
    );


    // =====================================================
    // SAVE FCM TOKEN
    // =====================================================

    try {

      console.log(
        'Saving Customer FCM token...'
      );

      await saveFCMToken(
        normalizedEmail
      );

      console.log(
        'Customer FCM token save completed'
      );

    } catch (fcmError) {

      console.log(
        'Customer FCM token save error:',
        fcmError
      );

      /*
       * IMPORTANT:
       * Notification setup fail hone par
       * login block nahi hoga.
       */

    }


    // =====================================================
    // FCM TOKEN REFRESH LISTENER
    // =====================================================

    try {

      startFCMTokenRefreshListener(
        normalizedEmail
      );

      console.log(
        'Customer FCM token refresh listener started'
      );

    } catch (fcmRefreshError) {

      console.log(
        'Customer FCM refresh listener error:',
        fcmRefreshError
      );

    }


    // =====================================================
    // GO TO HOME
    // =====================================================

    setLoading(false);

    navigation.replace(
      'Home'
    );


  } catch (error) {

    console.log(
      'Customer login error:',
      error
    );

    setLoading(false);

    alert(
      'Network error'
    );

  }

};




  return (
    <ImageBackground
      source={require('../../images/Login_System.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} 
              >
      <ScrollView contentContainerStyle={styles.container}
        // keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoAlign} >
        <Image
          source={require('../../images/syil_logo_white.png')}
          style={styles.logo}
        />
        </View> 

        {/* Welcome Text */}
        <Text style={styles.welcome}>Welcome back!</Text>

        {/* White Card */}
        <View style={styles.card}>
          <Text style={styles.signIn}>Sign In</Text>
          <Text style={styles.subText}>
            Enter Your email address and password to sign in the Customer Portal.
          </Text>

          {/* Username */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Email Address"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#999"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
                style={styles.passwordInput}
                placeholder="Enter Your Password"
                secureTextEntry={secure}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
            />

            <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Image
                    source={
                        secure
                        ? require('../../images/hide_icon.png')
                        : require('../../images/show_icon.png')
                    }
                    style={[
                        styles.eyeIcon,
                        secure ? styles.hideIcon : styles.showIcon
                    ]}
                />
            </TouchableOpacity>
          </View>

          <Text onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}>Forgot Password?</Text>

          {/* Login Button */}
          <TouchableOpacity disabled={loading} 
          style={[
            styles.button, loading && { opacity: 0.6 }
          ]} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer} onPress={() => Linking.openURL('mailto:support@syil.com')} >
          Need Help? <Text style={styles.support}>Contact Support</Text>
        </Text>


        

      </ScrollView>

      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          {/* You can uncomment the GIF if you want */}
          {/* <Image source={require('../../images/loading.gif')} style={styles.loadingGif} /> */}
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Login;

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
    alignSelf: 'center',
    marginLeft: 0,
    marginVertical:'auto',
    justifyContent:'center',
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
  signIn: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color:"#000",
  },
  subText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
    fontSize:20,
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 100,
    paddingHorizontal: 15,
    height: 48,
    fontSize:16,
    textTransform:'lowercase',
  },
  forgot: {
    textAlign: 'right',
    color: '#555',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#FFEA00',
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
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
    passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 100,
    paddingHorizontal: 15,
    height: 48,
    },
    passwordInput: {
    flex: 1,
    fontSize: 16,
    color:'#000',
    },
    eyeIcon: {
    width: 22,
    resizeMode: 'contain',
    },
    hideIcon: {
    height: 19,
    },
    showIcon: {
    height: 16,
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

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
});
