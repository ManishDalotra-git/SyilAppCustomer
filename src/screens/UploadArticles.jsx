import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  StatusBar,
  Platform,
} from 'react-native';

import * as DocumentPicker from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { SafeAreaView } from 'react-native-safe-area-context';

const UploadArticle = ({ navigation }) => {
  const [jsonContent, setJsonContent] = useState(null);
  const [fileName, setFileName] = useState('');
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');


  const API_URL = 'https://syilapp-w8ye.onrender.com/upload-articles';


  const handleSelectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: ['application/json'], 
      });

      const file = res[0];

      if (!file) {
        Alert.alert('Error', 'File not selected');
        return;
      }

      const isJsonByName = file.name?.toLowerCase().endsWith('.json');
      if (!isJsonByName) {
        Alert.alert('Invalid File', 'Please select a JSON file');
        return;
      }

      const fileUri = file.uri;
      const destPath = `${RNFS.CachesDirectoryPath}/${file.name}`;

      await RNFS.copyFile(fileUri, destPath);
      const content = await RNFS.readFile(destPath, 'utf8');
      const parsed = JSON.parse(content);

      setJsonContent(parsed);
      setFileName(file.name);

      Alert.alert('Success', 'JSON file loaded successfully');
    } catch (err) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('User cancelled document picker');
        return;
      }

      console.log('JSON Pick Error:', err);
      Alert.alert('Error', 'Invalid JSON file or error occurred');
    }
  };

  // ✅ REPLACE articles.json
  // const handleReplaceArticle = async () => {
  //   if (!jsonContent) {
  //     Alert.alert('Error', 'Please select a JSON file first');
  //     return;
  //   }

  //   try {
  //     // Save file to DocumentDirectoryPath (persistent)
  //     const destPath = `${RNFS.DocumentDirectoryPath}/articles.json`;

  //     await RNFS.writeFile(
  //       destPath,
  //       JSON.stringify(jsonContent, null, 2),
  //       'utf8'
  //     );

  //     Alert.alert('Success', 'articles.json updated successfully');
  //     navigation.goBack();
  //   } catch (err) {
  //     console.log('Write Error:', err);
  //     Alert.alert('Error', 'Failed to update articles.json');
  //   }
  // };

  const handleReplaceArticle = async () => {
  if (!jsonContent) {
    Alert.alert('Error', 'Please select a JSON file first');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', {
      uri: `file://${RNFS.CachesDirectoryPath}/${fileName}`,
      name: fileName,
      type: 'application/json',
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    Alert.alert('Success', 'Articles updated for all users');
    navigation.goBack();
  } catch (err) {
    console.log(err);
    Alert.alert('Error', 'Failed to upload articles');
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../../images/circle_arrow.png')} style={styles.arrowIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Article</Text>
      </View>

    <View style={styles.container}>

      

      {/* <Text style={styles.title}>Upload Articles JSON</Text> */}

      <TouchableOpacity style={styles.button} onPress={handleSelectFile}>
        <Text style={styles.buttonText}>Select JSON File</Text>
      </TouchableOpacity>

      {fileName ? (
        <Text style={styles.fileInfo}>Selected: {fileName}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, styles.greenButton]}
        onPress={handleReplaceArticle}
      >
        <Text style={styles.buttonText}>Replace articles.json</Text>
      </TouchableOpacity>

      <Text style={styles.note}>⚠️ Only valid JSON file is allowed</Text>
    </View>
    </SafeAreaView>
  );
};

export default UploadArticle;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
  },


  arrowIcon: { width: 32, height: 32 },
  header: { width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60, backgroundColor: '#fff' },
  backButton: { marginRight: 0 },
  headerTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center', width: '87%', },


  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 12,
  },
  greenButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    marginTop: 12,
    fontSize: 14,
    color: '#333',
  },
  note: {
    marginTop: 24,
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
});
