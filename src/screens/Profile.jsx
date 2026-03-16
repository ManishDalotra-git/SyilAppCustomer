import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getContactId, setContactId } from '../utils/hiddenFields';
import { Picker } from '@react-native-picker/picker';
import { Alert } from 'react-native';

const Profile = ({ navigation }) => {

  StatusBar.setBarStyle('dark-content');
  StatusBar.setBackgroundColor('#fff');

  const [user, setUser] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userID, setUserID] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    gender: '',
  });

  // 🔹 Load user
  useEffect(() => {
    const getUser = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsed = JSON.parse(data);
        setUser(parsed);
        setContactId(parsed.contactId); // 🔒 hidden
      }
    };
    getUser();
  }, []);

  // 🔹 Fill form
  useEffect(() => {
    if (user) {
      setForm({
        firstName: firstName || '',
        lastName: lastName || '',
        bio: bio || '',
        phone: phone || '',
        gender: gender || '',
      });
    }
  }, [user]);



  useEffect(() => {
    const userData = async () => {
      const userID = await AsyncStorage.getItem('userID');
      const userFirstName = await AsyncStorage.getItem('userFirstName');
      const userLastName = await AsyncStorage.getItem('userLastName');
      const userBio = await AsyncStorage.getItem('userBio');
      const userPhone = await AsyncStorage.getItem('userPhone');
      const userGender = await AsyncStorage.getItem('userGender');
      const savedEmail = await AsyncStorage.getItem('userEmail');
      if (userID) setUserID(userID);
      if (savedEmail) setEmail(savedEmail);
      if (userFirstName) setFirstName(userFirstName);
      if (userLastName) setLastName(userLastName);
      if (userBio) setBio(userBio);
      if (userPhone) setPhone(userPhone);
      if (userGender) setGender(userGender);
      console.log('userID-- ', userID);
      console.log('savedEmail-- ', savedEmail);
      console.log('userFirstName-- ', userFirstName);
      console.log('userLastName-- ', userLastName);
      console.log('userBio-- ', userBio);
      console.log('userPhone-- ', userPhone);
      console.log('userGender-- ', userGender);
      };
    userData();
  }, []);


  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.charAt(0)?.toUpperCase() || '';
    return `${f}${l}`;
  };

  // 🔥 SAVE PROFILE (API CALL)
  const handleSaveProfile = async () => {
    const contactId = getContactId();
    if (!contactId) return alert('Contact ID missing');

    setLoading(true); // show loading

    try {
      const response = await fetch(
        'https://syilapp-w8ye.onrender.com/update-profile',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId,
            firstName: firstName,
            lastName: lastName,
            bio: bio,
            phone: phone,
            gender: gender,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        alert('Profile update failed');
        setLoading(false);
        return;
      }

      alert('Profile updated');

      await AsyncStorage.setItem('userFirstName', String(result.user?.firstName ?? ''));
      await AsyncStorage.setItem('userLastName', String(result.user?.lastName ?? ''));
      await AsyncStorage.setItem('userBio', String(result.user?.bio ?? ''));
      await AsyncStorage.setItem('userPhone', String(result.user?.phone ?? ''));
      await AsyncStorage.setItem('userGender', String(result.user?.gender ?? ''));

      const updatedUser = { ...user, ...result.user };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditVisible(false);
      setLoading(false);

    } catch (e) {
      alert('Network error');
      setLoading(false);
    }
  };

  const handleLogout = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.multiRemove([
            'isLoggedIn',
            'lastLoginTime',
            'userEmail',
            'userData',
            'userID',
            'userFirstName',
            'userLastName',
            'userBio',
            'userPhone',
            'userGender',
          ]);
          setContactId(null);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]
  );
};


  return (
    <View style={styles.container}>

      {/* Header (SAME) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../images/circle_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Section (SAME) */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.initialsAvatar}>
            <Text style={styles.initialsText}>
              {getInitials(firstName, lastName)}
            </Text>
          </View>

          {/* EDIT ICON (same position) */}
          <Pressable
            style={styles.avatar}
            onPress={() => setEditVisible(true)}
          >
            <Image
              source={require('../../images/editorIcon.png')}
              style={styles.avatarIcon}
            />
          </Pressable>
        </View>

        <Text style={styles.name}>
          {firstName} {lastName}
        </Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Logout Button (SAME) */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Image
          source={require('../../images/logout.png')}
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* 🔽 EDIT PROFILE MODAL */}
      <Modal visible={editVisible} animationType="slide">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.modalTitle}>Edit Profile</Text>

          {/* FIELD: First Name */}
          <View style={styles.inputWrapper}>
            <View style={styles.iconText}>
              <Image source={require('../../images/user_icon.png')} style={styles.fieldIcon}/>
              <Text style={styles.label}>First Name</Text>
            </View>
            <TextInput
              placeholder="First Name"
              style={styles.input}
              value={firstName}
              onChangeText={(v) => setFirstName(v)}
              //onChangeText={(v) => setForm({ ...form, firstName: v })}
            />
          </View>

          {/* FIELD: Last Name */}
          <View style={styles.inputWrapper}>
            <View style={styles.iconText}>
              <Image source={require('../../images/user_icon.png')} style={styles.fieldIcon}/>
              <Text style={styles.label}>Last Name</Text>
            </View>
            <TextInput
              placeholder="Last Name"
              style={styles.input}
              value={lastName}
              onChangeText={(v) => setLastName(v)}
              //onChangeText={(v) => setForm({ ...form, lastName: v })}
            />
          </View>

          {/* FIELD: Bio */}
          <View style={styles.inputWrapper}>
            <View style={styles.iconText}>
              <Image source={require('../../images/bio_icon.png')} style={styles.fieldIcon}/>
              <Text style={styles.label}>Bio</Text>
            </View>
            <TextInput
              placeholder="Bio"
              style={styles.input}
              value={bio}
              onChangeText={(v) => setBio(v)}
              //nChangeText={(v) => setForm({ ...form, bio: v })}
            />
          </View>

          {/* FIELD: Phone */}
          <View style={styles.inputWrapper}>
            <View style={styles.iconText}>
              <Image source={require('../../images/phone_icon.png')} style={styles.fieldIcon}/>
              <Text style={styles.label}>Phone</Text>
            </View>
            <TextInput
              placeholder="Phone"
              style={styles.input}
              value={phone}
              onChangeText={(v) => setPhone(v)}
              //onChangeText={(v) => setForm({ ...form, phone: v })}
            />
          </View>

          {/* FIELD: Gender */}
          <View style={styles.inputWrapper}>
            <View style={styles.iconText}>
              <Image source={require('../../images/gender_icon.png')} style={styles.fieldIcon}/>
              <Text style={styles.label}>Gender</Text>
            </View>
            <TextInput
              placeholder="Gender"
              style={styles.input}
              value={gender}
              onChangeText={(v) => setGender(v)}
              //onChangeText={(v) => setForm({ ...form, gender: v })}
            />
          </View>

          {/* SAVE BUTTON */}
          <Pressable style={styles.saveBtn} onPress={handleSaveProfile}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>

          <Pressable style={styles.saveBtnCancel} onPress={() => setEditVisible(false)}>
            <Text style={styles.saveTextCancel}>Cancel</Text>
          </Pressable>

        </ScrollView>
      </Modal>

      {/* 🔽 LOADING MODAL */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 24, fontWeight: '700' }}>Please wait...</Text>
        </View>
      </Modal>

    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 40 : 20 },

  header: { height: 65, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  arrowIcon: { width: 32, height: 32 },
  headerTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center', width: '94%' },

  profileSection: { alignItems: 'center', marginTop: 20 },
  initialsAvatar:{width:104,height:104,backgroundColor:'#000',borderRadius:104,justifyContent:'center', alignItems:'center',position:'relative,'},
  initialsText:{color:'#FFEA00',fontSize:36,fontWeight:'700',},
  avatarWrapper: { position: 'relative', marginBottom: 16, textAlign:'center', justifyContent:'center', alignItems:'center' },
  avatar: { position:'absolute', bottom:0, right:0 },
  avatarIcon: { width: 29, height: 29 },

  name: { fontSize: 18, fontWeight: '600', color: '#000' },
  email: { fontSize: 14, color: '#666', marginTop: 4 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEA00', marginHorizontal: 24, borderRadius: 30, paddingVertical: 14, position: 'absolute', bottom: 40, left: 0, right: 0 },
  logoutIcon: { width: 18, height: 18, marginRight: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#000' },

  // Modal
  modalTitle: { fontSize: 24, fontWeight: '700', textAlign:'center', marginBottom: 20 },
  inputWrapper: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight:'600', marginBottom: 5 },
  input: { borderWidth: 1, borderColor:'#ccc', borderRadius: 8, paddingHorizontal: 10, height: 45 },
  fieldIcon: { width: 20, height: 20, marginRight:5, },
  iconText:{flexDirection:'row',display:'flex'},

  saveBtn: { backgroundColor:'#FFEA00', borderRadius:30, paddingVertical:12, marginTop:10, alignItems:'center' },
  saveText: { fontSize:16, fontWeight:'600', color:'#000' },

  saveBtnCancel: { backgroundColor:'#000', borderRadius:30, paddingVertical:12, marginTop:10, alignItems:'center' },
  saveTextCancel: { fontSize:16, fontWeight:'600', color:'#FFEA00' },

  loadingContainer: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(255, 255, 255, 0.78)' },
});
