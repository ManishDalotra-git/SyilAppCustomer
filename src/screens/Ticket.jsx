import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity, Image, Modal, ActivityIndicator, StatusBar, Platform, ImageBackground, Pressable, PermissionsAndroid, KeyboardAvoidingView, 
} from 'react-native';
import { Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Ticket = () => {

  const insets = useSafeAreaInsets();
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');

  const navigation = useNavigation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  

  
  


//   const requestGalleryPermission = async () => {
//   if (Platform.OS !== 'android') return true;

//   try {
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//       {
//         title: 'Gallery Permission',
//         message: 'App needs access to your photos and videos',
//         buttonPositive: 'Allow',
//         buttonNegative: 'Cancel',
//       }
//     );

//     return granted === PermissionsAndroid.RESULTS.GRANTED;
//   } catch (err) {
//     console.warn(err);
//     return false;
//   }
// };

// const pickFiles = async () => {
//   const hasPermission = await requestGalleryPermission();

//   if (!hasPermission) {
//     Alert.alert(
//       'Permission Required',
//       'Please allow gallery access to upload photos/videos'
//     );
//     return;
//   }

//   launchImageLibrary(
//     {
//       mediaType: 'mixed',
//       selectionLimit: 0,
//     },
//     response => {
//       if (!response.didCancel && response.assets) {
//         setFiles(response.assets);
//       }
//     }
//   );
// };

const pickFiles = () => {
  launchImageLibrary(
    {
      mediaType: 'mixed',
      selectionLimit: 0,
    },
    response => {
      if (response.didCancel) return;

      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Something went wrong');
        return;
      }

      if (response.assets) {
        setFiles(response.assets);
      }
    }
  );
};


const formatCategoryLabel = (key) => {
  return key
    .replace(/_/g, ' ')       
    .toLowerCase()             
    .replace(/\b\w/g, char => char.toUpperCase()); 
};

  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [machineType, setMachineType] = useState('');
  const [controller, setController] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [salesOrder, setSalesOrder] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');


  useEffect(() => {
    const loadEmail = async () => {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      if (savedEmail) setEmail(savedEmail);
    };
    loadEmail();
  }, []);


  const [categories, setCategories] = useState({
    Safety_issue: false,
    PLC_issue: false,
    Operating_issue: false,
    Quality_issue: false,
    Shipping_issue: false,
    FEATURE_REQUEST: false,
  });

  const [warranty, setWarranty] = useState(false);

  const [errors, setErrors] = useState({});

  const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};


  const getSelectedCategories = () => {
    return Object.keys(categories).filter(key => categories[key]);
  };








  const uploadToServer = async (files) => {
    if (!files || files.length === 0) return [];

    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', {
        uri: file.uri,
        name: file.fileName,
        type: file.type,
      });
    });

    const res = await fetch('https://syilapp-w8ye.onrender.com/upload-to-hubspot', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.json();
  };








 const handleSubmit = async () => {
    let newErrors = {};
    setLoading(true);


    const uploadResult = await uploadToServer(files);
      console.log('Upload result:', uploadResult);



    if (!email.trim()) {
      newErrors.email = 'Email is required';
      setLoading(false);
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Enter a valid email address';
      setLoading(false);
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
      setLoading(false);
    }

    if (!description.trim()) {
      newErrors.description = 'Describe the problem is required';
      setLoading(false);
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true); 
      const ticketData = {
        email,
        company,
        machineType,
        controller,
        serialNo,
        salesOrder,
        subject,
        description,
        priority,
        warranty,
        categories: getSelectedCategories(),
        files,
      };

      try {
        const responseEmail = await fetch('https://syilapp-w8ye.onrender.com/get-contact-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: ticketData.email }),
        });


        let emailResult;
        emailResult = await responseEmail.json(); // read once
        console.log('emailResult--- ' , emailResult.contactId);

      if (!responseEmail.ok) {
        console.log('Backend Error (contact-email):', emailResult);
        alert('Failed to validate contact email');
        return;
      }

      const contactId = emailResult.contactId;
      if (!contactId) {
        alert('No contact found with this email');
        return;
      }



      // 2️⃣ Create Ticket
      const responseTicket = await fetch('https://syilapp-w8ye.onrender.com/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, ticketData }),
      });

      let dataTest = JSON.stringify({ contactId, ticketData });
      console.log('dataTest---- ' , dataTest);

      const textTicket = await responseTicket.json(); // read once
      console.log('textTicket--- ' , textTicket);
      let ticketResult;
      if (responseTicket.ok) {
        //alert('Ticket created successfully!');
        setLoading(false);
        console.log('textTicket---- ' , textTicket.mobile_ticket_id)
        Alert.alert(
          'Success',
          'Ticket created successfully!',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('ThankYou', {
                  ticketId: textTicket.mobile_ticket_id,
                }),
            },
          ],
          { cancelable: false }
        );
      } else {
        setLoading(false);
        console.log('Backend Error (create-ticket):', ticketResult);
        alert('Failed to create ticket');
      }

      } catch (error) {
        setLoading(false);
        console.log('Network Error:', error);
        alert('Network request failed. Check your backend and network.');
      }
    }
  };

  return (
    
    <SafeAreaView
          style={[styles.safeArea]}
        >
      <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // adjust if you have headers
            >
      <View style={[styles.header, { height: 60, paddingTop: 0 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
        >
          <Image
              source={require('../../images/circle_arrow.png')}
              style={styles.arrowIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Ticket</Text>
      </View>
        
    <ScrollView contentContainerStyle={styles.container} >


      


      {/* <Pressable
      onPress={() => navigation.navigate('Home')} 
      style={styles.card} hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}>
      <View style={styles.flexClass}>
        <Image
          source={require('../../images/right_arrow.png')}
          style={styles.arrowIcon}
        />
        <Text style={styles.labelText}>New Ticket</Text>
      </View>
      </Pressable> */}
      
      <View style={styles.containerStyle}>
      <Text style={styles.label}>Your Email <Text style={styles.errorColor}>*</Text></Text>
      <Text>Enter the email of the partner contact person creating the ticket</Text>
      <TextInput
        style={[
          styles.inputEmail,
          errors.email && styles.errorInput
        ]}
        value={email}
        placeholderTextColor="#999"
        onChangeText={text => {
          setEmail(text);
          setErrors({ ...errors, email: null });
        }}
        editable={false}
        selectTextOnFocus={false}
        placeholder="Enter your email"
      />
      {errors.email && (
        <Text style={styles.errorText}>{errors.email}</Text>
      )}

      <Text style={styles.label}>On Behalf of End-Customer (Company) Name</Text>
      <Text>Enter the (company) name of the end-customer that is having the issue</Text>
      <TextInput
        style={styles.input}
        value={company}
        onChangeText={setCompany}
        placeholder="Company Name"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Machine Type</Text>
      <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={machineType}
        onValueChange={setMachineType}
        style={[
          styles.picker,
          {
            color: machineType === '' ? '#999' : '#000'
          }
        ]}
      >
        <Picker.Item color="#999" style={styles.pickerItems} label="Please Select" value="" />
        <Picker.Item style={styles.pickerItems} label="X5" value="X5" />
        <Picker.Item style={styles.pickerItems} label="X7" value="X7" />
        <Picker.Item style={styles.pickerItems} label="X9" value="X9" />
        <Picker.Item style={styles.pickerItems} label="X11" value="X11" />
        <Picker.Item style={styles.pickerItems} label="L2" value="L2" />
        <Picker.Item style={styles.pickerItems} label="L3" value="L3" />
      </Picker>
      </View>

      <Text style={styles.label}>Controller</Text>
      <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={controller}
        onValueChange={setController}
        style={[
          styles.picker,
          {
            color: controller === '' ? '#999' : '#000'
          }
        ]}
      >
        <Picker.Item color="#999" style={styles.pickerItems} label="Please Select" value="" />
        <Picker.Item style={styles.pickerItems} label="SINUMERIK" value="SINUMERIK" />
        <Picker.Item style={styles.pickerItems} label="FANUC" value="FANUC" />
        <Picker.Item style={styles.pickerItems} label="Syntec" value="Syntec" />
      </Picker>
      </View> 

      <Text style={styles.label}>Machine Serial Number</Text>
      <TextInput
        style={styles.input}
        value={serialNo}
        onChangeText={setSerialNo}
      />

      <Text style={styles.label}>Sales Order Number</Text>
      <TextInput
        style={styles.input}
        value={salesOrder}
        onChangeText={setSalesOrder}
        
      />
      <Text style={styles.label}>Category</Text>

      {Object.keys(categories).map(key => (
        <View key={key} style={styles.checkboxRow}>
          <CheckBox
            style={styles.checkboxStyle}
            value={categories[key]}
            onValueChange={value =>
              setCategories({ ...categories, [key]: value })
            }
            tintColors={{ false: '#000', true: '#000' }}
          />
          <Text style={styles.checkboxText}>
            {formatCategoryLabel(key)}
          </Text>
        </View>
      ))}

      <Text style={styles.label}>Subject <Text style={styles.errorColor}>*</Text></Text>
      <TextInput
        style={[
          styles.input,
          errors.subject && styles.errorInput
        ]}
        value={subject}
        onChangeText={text => {
          setSubject(text);
          setErrors({ ...errors, subject: null });
        }}
      />
      {errors.subject && (
        <Text style={styles.errorText}>{errors.subject}</Text>
      )}

      <Text style={styles.label}>Describe the Problem <Text style={styles.errorColor}>*</Text></Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          errors.description && styles.errorInput
        ]}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={text => {
          setDescription(text);
          setErrors({ ...errors, description: null });
        }}
      />
      {errors.description && (
        <Text style={styles.errorText}>{errors.description}</Text>
      )}


      <Text style={styles.label}>Upload Photos / Videos</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickFiles}>
        <Text style={styles.uploadText}>Choose files</Text>
      </TouchableOpacity>



      {files.length === 0 ? (
        <Text style={styles.noFile}>No file chosen</Text>
      ) : (
        files.map((file, index) => (
          <Text key={index} style={styles.fileName}>
            {file.fileName}
          </Text>
        ))
      )}

      <View style={styles.checkboxRow}>
        <CheckBox value={warranty} tintColors={{ false: '#000', true: '#000' }} onValueChange={setWarranty} />
        <Text style={styles.checkboxText}>Warranty</Text>
      </View>

      <Text style={styles.label}>Priority</Text>
      <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={priority}
        onValueChange={setPriority}
        style={[
          styles.picker,
          {
            color: priority === '' ? '#999' : '#000'
          }
        ]}
      >
        <Picker.Item color="#999" style={styles.pickerItems} label="Please Select" value="" />
        <Picker.Item style={styles.pickerItems} label="Low" value="low" />
        <Picker.Item style={styles.pickerItems} label="Medium" value="medium" />
        <Picker.Item style={styles.pickerItems} label="High" value="high" />
      </Picker>
      </View>

      <TouchableOpacity
        disabled={loading}
        style={[
            styles.button, loading && { opacity: 0.6 },
            (errors.email || errors.subject || errors.description) && styles.disabledButton
          ]}
          onPress={handleSubmit}
        >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      </View>


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
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Ticket;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  arrowIcon:{
    width:32,
    height:32,
  },
  header: {
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    marginRight: 5,
  },
  backArrow: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign:'center',
    flexBasis:'87%',
  },

  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 20,
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
    marginBottom:10,
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
  checkboxStyle: {
    border:1,
    borderColor:'#000',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
    fontSize:20,
  },
  input: {
    borderRadius: 6,
    padding: 15,
    marginTop: 6,
    backgroundColor:'#F5F5F7',
  },
  inputEmail:{
    borderRadius: 6,
    padding: 15,
    marginTop: 6,
    backgroundColor:'#F5F5F7',
    textTransform:'lowercase',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 0,
    borderRadius: 6,
    marginTop: 6,
    overflow: 'hidden',
    backgroundColor:'#F5F5F7',
    paddingLeft:7,
    paddingRight: 7,
  },
  picker: {
    fontSize:14,
    paddingLeft:15,
    paddingRight: 15,
  },
  pickerItems: {
    fontSize:14,
    paddingLeft:15,
    paddingRight: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginRight:0
  },
  checkboxText: {
    marginLeft: 0,
    marginRight:0
  },
  button: {
    backgroundColor: '#FFEA00',
    padding: 14,
    borderRadius: 100,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadText: {
    backgroundColor: '#F5F5F7',
    width: 'auto',
    color: '#000',
    textAlign:'center',
    padding: 15,
    borderRadius:6,
    marginTop:6,
    marginBottom:6,
    fontWeight:600
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  errorInput: {
    borderWidth: 1,
    borderColor: 'red',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText:{
    color:'#000',
    fontSize:20,
    fontWeight:700,
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
  errorColor: {
    color:'red'
  }
});
