import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,KeyboardAvoidingView,Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Footer from './components/Footer';

const Feedback = () => {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');

  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name; 
  const [appSupportTeamMember, setAppSupportTeamMember] = useState(false);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ---------------- Load Email ---------------- */
  useEffect(() => {
    const loadEmail = async () => {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      if (savedEmail) setEmail(savedEmail);

      const AppSupportTeamMember = await AsyncStorage.getItem('app_support_team_member');
    console.log('AppSupportTeamMember:', AppSupportTeamMember);
    

    if(AppSupportTeamMember === 'Yes'){
      setAppSupportTeamMember(true);
      console.log('AppSupportTeamMember---yes:', AppSupportTeamMember);
    }
    
    };
    loadEmail();
  }, []);

  /* ---------------- Submit Feedback ---------------- */
  const handleSubmit = async () => {
    let newErrors = {};
    if (!subject) newErrors.subject = true;
    if (!message.trim()) newErrors.message = true;
    if (!rating) newErrors.rating = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length !== 0) return;

    try {
      setLoading(true);

      const response = await fetch('https://syilapp-w8ye.onrender.com/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, rating, email }),
      });

      const result = await response.json();
      console.log('Feedback Response:', result);

      setLoading(false);

      if (response.ok) {
        console.log('if----ok');
        Alert.alert(
                  'Success',
                  'Your feedback has been submitted successfully!',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack(),
                    },
                  ],
                  { cancelable: false }
                );

        // Reset form fields
        setSubject('');
        setMessage('');
        setRating('');
      } else {
        console.log('else----ok');
        alert(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      setLoading(false);
      console.log('catch----ok');
      alert('Network Error. Please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ---------- Header ---------- */}
      <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // adjust if you have headers
                  >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../images/circle_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* ---------- Subject ---------- */}
        <View style={[styles.input, errors.subject && styles.errorInput, { padding: 0 }]}>
          <Picker
            selectedValue={subject}
            onValueChange={value => {
              setSubject(value);
              setErrors({ ...errors, subject: null });
            }}
            style={{ height: 53, color: subject === '' ? '#999' : '#000' }}
          >
            <Picker.Item label="Choose Your Subject" value="" color="#999" />
            <Picker.Item label="Bug Report" value="bug" />
            <Picker.Item label="Suggestion" value="suggestion" />
            <Picker.Item label="UI Issue" value="ui" />
            <Picker.Item label="Performance Issue" value="performance" />
          </Picker>
        </View>

        {/* ---------- Message ---------- */}
        <TextInput
          style={[styles.input, styles.textArea, errors.message && styles.errorInput]}
          placeholder="What went wrong?"
          placeholderTextColor="#999"
          multiline
          value={message}
          onChangeText={text => {
            setMessage(text);
            setErrors({ ...errors, message: null });
          }}
        />

        {/* ---------- Rating ---------- */}
        <View style={[styles.input, errors.rating && styles.errorInput, { padding: 0 }]}>
          <Picker
            selectedValue={rating}
            onValueChange={value => {
              setRating(value);
              setErrors({ ...errors, rating: null });
            }}
            style={{ height: 53, color: rating === '' ? '#999' : '#000' }}
          >
            <Picker.Item label="What rating would you give the app?" value="" color="#999" />
            <Picker.Item label="⭐ 1" value="1" />
            <Picker.Item label="⭐ 2" value="2" />
            <Picker.Item label="⭐ 3" value="3" />
            <Picker.Item label="⭐ 4" value="4" />
            <Picker.Item label="⭐ 5" value="5" />
          </Picker>
        </View>

        {/* ---------- Email (Locked) ---------- */}
        <TextInput
          style={styles.inputEmail}
          value={email}
          editable={false}
          selectTextOnFocus={false}
        />

        {/* ---------- Submit Button ---------- */}
        <TouchableOpacity
          disabled={loading}
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ---------- Loader ---------- */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      )}


      <Footer appSupportTeamMember={appSupportTeamMember} currentRoute={currentRoute} />

    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Feedback;

/* ================== STYLES ================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  arrowIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '85%',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 6,
    padding: 15,
    marginTop: 12,
    fontSize: 16,
  },
  inputEmail: {
    backgroundColor: '#F5F5F7',
    borderRadius: 6,
    padding: 15,
    marginTop: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FFEA00',
    padding: 14,
    borderRadius: 100,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  errorInput: {
    borderWidth: 1,
    borderColor: 'red',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
  },
  footers: {
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

});
