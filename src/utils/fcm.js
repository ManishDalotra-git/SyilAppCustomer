import { getApp } from '@react-native-firebase/app';
// import { getInstallations, getId } from '@react-native-firebase/installations';

import {
  getMessaging,
  getToken,
  requestPermission,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';



const app = getApp();

console.log("Firebase Config:", app.options);

// const installations = getInstallations(app);

// const fid = await getId(installations);

// console.log("Firebase Installation ID:", fid);


export const saveFCMToken = async (email) => {

  try {

    const app = getApp();

    const messaging = getMessaging(app);


    // Register device
    await registerDeviceForRemoteMessages(messaging);


    // Permission
    const authStatus = await requestPermission(messaging);


    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;


    if (!enabled) {
      console.log("FCM permission denied");
      return;
    }


    // Get FCM Token
    const token = await getToken(messaging);


    console.log("🔥 FCM TOKEN:", token);



    if(!token){
      console.log("FCM token empty");
      return;
    }



    // Send token to backend
    const response = await fetch(
      'https://syilappcustomer.onrender.com/save-fcm-token',
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          email:email,
          fcmToken:token
        })
      }
    );


    
    const text = await response.text();

  console.log("Response:", text);


  } catch(error){

    console.log("FCM Save Error:",error);

  }

};