import {
  Platform,
  PermissionsAndroid,
  NativeModules,
  AppState,
  DeviceEventEmitter,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getApp } from '@react-native-firebase/app';

import {
  getInitialNotification,
  getMessaging,
  getToken,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

import {
  openTicketFromNotification,
} from '../navigation/navigationRef';


const { NotificationBadge } = NativeModules;


// ============================================================
// FIREBASE
// ============================================================

const firebaseApp = getApp();

const messaging = getMessaging(firebaseApp);


// ============================================================
// CUSTOMER API
// ============================================================

const API_URL =
  'https://syilappcustomer.onrender.com';


// ============================================================
// TOKEN REFRESH LISTENER
// ============================================================

let tokenRefreshUnsubscribe = null;


// ============================================================
// REQUEST NOTIFICATION PERMISSION
// ============================================================

export const requestNotificationPermission = async () => {

  try {

    // ========================================================
    // ANDROID
    // ========================================================

    if (Platform.OS === 'android') {

      /*
       * Android 13+ requires runtime
       * POST_NOTIFICATIONS permission.
       */

      if (Platform.Version >= 33) {

        const granted =
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title:
                'Allow Notifications',

              message:
                'SYIL Customer App needs notification permission to notify you about new ticket messages.',

              buttonPositive:
                'Allow',

              buttonNegative:
                "Don't Allow",

              buttonNeutral:
                'Ask Me Later',
            }
          );


        if (
          granted ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {

          console.log(
            'Customer notification permission granted'
          );

          return true;
        }


        console.log(
          'Customer notification permission denied'
        );

        return false;
      }


      /*
       * Android below version 13
       * does not need runtime notification permission.
       */

      return true;
    }


    // ========================================================
    // IOS
    // ========================================================

    const authStatus =
      await requestPermission(
        messaging
      );


    const enabled =
      authStatus ===
        AuthorizationStatus.AUTHORIZED ||
      authStatus ===
        AuthorizationStatus.PROVISIONAL;


    console.log(
      'Customer iOS notification permission:',
      enabled
    );


    return enabled;


  } catch (error) {

    console.log(
      'Customer notification permission error:',
      error
    );

    return false;
  }

};


// ============================================================
// HANDLE FIREBASE NOTIFICATION OPEN
// ============================================================

const handleNotificationOpen = (
  remoteMessage
) => {

  try {

    if (!remoteMessage) {
      return;
    }


    const data =
      remoteMessage.data || {};


    const ticketId =
      data.ticketId;


    if (!ticketId) {

      console.log(
        'Notification opened without ticketId'
      );

      return;
    }


    console.log(
      'Opening Customer ticket from FCM notification:',
      ticketId
    );


    openTicketFromNotification({

      ticketId:
        String(ticketId),

      ticketSubject:
        data.ticketSubject || '',

      threadId:
        data.threadId || '',

      fromNotification:
        true,

    });


  } catch (error) {

    console.log(
      'Customer notification open error:',
      error
    );

  }

};


// ============================================================
// CHECK NATIVE PENDING NOTIFICATION
// ============================================================

const checkPendingNotification =
  async () => {

    try {

      if (
        !NotificationBadge ||
        typeof NotificationBadge.getPendingNotification !==
          'function'
      ) {

        return;
      }


      const pendingNotification =
        await NotificationBadge.getPendingNotification();


      if (
        !pendingNotification ||
        !pendingNotification.ticketId
      ) {

        return;
      }


      console.log(
        'Customer pending notification found:',
        pendingNotification.ticketId
      );


      openTicketFromNotification({

        ticketId:
          String(
            pendingNotification.ticketId
          ),

        ticketSubject:
          pendingNotification.ticketSubject || '',

        threadId:
          pendingNotification.threadId || '',

        fromNotification:
          true,

      });


    } catch (error) {

      console.log(
        'Customer pending notification error:',
        error
      );

    }

  };


// ============================================================
// SETUP NOTIFICATION OPEN HANDLERS
// ============================================================

export const setupNotificationOpenHandlers =
  () => {

    console.log(
      'Setting up Customer notification open handlers'
    );


    // ========================================================
    // CHECK NATIVE PENDING NOTIFICATION
    // ========================================================

    checkPendingNotification();


    // ========================================================
    // NATIVE NOTIFICATION CLICK EVENT
    // ========================================================

    const nativeNotificationListener =
      DeviceEventEmitter.addListener(
        'notificationClicked',
        data => {

          try {

            if (
              !data ||
              !data.ticketId
            ) {

              return;
            }


            console.log(
              'Customer native notification clicked:',
              data.ticketId
            );


            openTicketFromNotification({

              ticketId:
                String(
                  data.ticketId
                ),

              ticketSubject:
                data.ticketSubject || '',

              threadId:
                data.threadId || '',

              fromNotification:
                true,

            });


          } catch (error) {

            console.log(
              'Customer native notification event error:',
              error
            );

          }

        }
      );


    // ========================================================
    // APP OPENED FROM BACKGROUND BY FCM
    // ========================================================

    const notificationOpenedUnsubscribe =
      onNotificationOpenedApp(
        messaging,
        remoteMessage => {

          console.log(
            'Customer notification opened from background'
          );


          handleNotificationOpen(
            remoteMessage
          );

        }
      );


    // ========================================================
    // APP OPENED FROM QUIT STATE
    // ========================================================

    getInitialNotification(
      messaging
    )
      .then(
        remoteMessage => {

          if (remoteMessage) {

            console.log(
              'Customer app opened from quit-state notification'
            );


            handleNotificationOpen(
              remoteMessage
            );

          }

        }
      )
      .catch(
        error => {

          console.log(
            'Customer initial notification error:',
            error
          );

        }
      );


    // ========================================================
    // APP STATE LISTENER
    // ========================================================

    let previousAppState =
      AppState.currentState;


    const appStateSubscription =
      AppState.addEventListener(
        'change',
        nextAppState => {

          /*
           * When app becomes active,
           * check if native Android side has
           * a pending notification click.
           */

          if (
            previousAppState !== 'active' &&
            nextAppState === 'active'
          ) {

            setTimeout(
              () => {

                checkPendingNotification();

              },
              300
            );

          }


          previousAppState =
            nextAppState;

        }
      );


    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {

      console.log(
        'Cleaning Customer notification open handlers'
      );


      if (
        nativeNotificationListener
      ) {

        nativeNotificationListener.remove();

      }


      if (
        notificationOpenedUnsubscribe
      ) {

        notificationOpenedUnsubscribe();

      }


      if (
        appStateSubscription
      ) {

        appStateSubscription.remove();

      }

    };

  };


// ============================================================
// SAVE CUSTOMER FCM TOKEN
// ============================================================

export const saveFCMToken =
  async email => {

    try {

      const normalizedEmail =
        String(email || '')
          .trim()
          .toLowerCase();


      if (!normalizedEmail) {

        console.log(
          'Cannot save Customer FCM token: email missing'
        );

        return null;
      }


      // ======================================================
      // NOTIFICATION PERMISSION
      // ======================================================

      const permissionGranted =
        await requestNotificationPermission();


      if (!permissionGranted) {

        console.log(
          'Customer notification permission not granted'
        );

        return null;
      }


      // ======================================================
      // REGISTER DEVICE
      // ======================================================

      try {

        await registerDeviceForRemoteMessages(
          messaging
        );

      } catch (registerError) {

        /*
         * Some Android versions/builds may
         * already be registered.
         */

        console.log(
          'Customer FCM device registration:',
          registerError?.message ||
            registerError
        );

      }


      // ======================================================
      // GET TOKEN
      // ======================================================

      const token =
        await getToken(
          messaging
        );


      if (!token) {

        console.log(
          'Customer FCM token is empty'
        );

        return null;
      }


      /*
       * Do not print the complete FCM token
       * in production logs.
       */

      console.log(
        'Customer FCM token generated successfully'
      );


      // ======================================================
      // SAVE TOKEN LOCALLY
      // ======================================================

      await AsyncStorage.setItem(
        'customer_fcm_token',
        token
      );


      // ======================================================
      // SAVE TOKEN IN HUBSPOT THROUGH BACKEND
      // ======================================================

      const response =
        await fetch(
          `${API_URL}/save-fcm-token`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({

                email:
                  normalizedEmail,

                fcmToken:
                  token,

                platform:
                  Platform.OS,

              }),
          }
        );


      const responseText =
        await response.text();


      if (!response.ok) {

        console.log(
          'Customer FCM backend save failed:',
          responseText
        );


        throw new Error(
          'Unable to save Customer FCM token'
        );

      }


      console.log(
        'Customer FCM token saved successfully'
      );


      return token;


    } catch (error) {

      console.log(
        'Customer save FCM token error:',
        error
      );


      /*
       * Re-throw so Login.jsx can log it,
       * without blocking login.
       */

      throw error;

    }

  };


// ============================================================
// START TOKEN REFRESH LISTENER
// ============================================================

export const startFCMTokenRefreshListener =
  email => {

    const normalizedEmail =
      String(email || '')
        .trim()
        .toLowerCase();


    if (!normalizedEmail) {

      console.log(
        'Cannot start Customer FCM refresh listener: email missing'
      );

      return;

    }


    /*
     * Prevent duplicate listeners.
     */

    if (
      tokenRefreshUnsubscribe
    ) {

      console.log(
        'Customer FCM refresh listener already active'
      );

      return;

    }


    console.log(
      'Starting Customer FCM token refresh listener'
    );


    tokenRefreshUnsubscribe =
      onTokenRefresh(
        messaging,
        async newToken => {

          try {

            if (!newToken) {
              return;
            }


            console.log(
              'Customer FCM token refreshed'
            );


            // =================================================
            // SAVE NEW TOKEN LOCALLY
            // =================================================

            await AsyncStorage.setItem(
              'customer_fcm_token',
              newToken
            );


            // =================================================
            // UPDATE HUBSPOT TOKEN THROUGH BACKEND
            // =================================================

            const response =
              await fetch(
                `${API_URL}/save-fcm-token`,
                {
                  method:
                    'POST',

                  headers: {
                    'Content-Type':
                      'application/json',
                  },

                  body:
                    JSON.stringify({

                      email:
                        normalizedEmail,

                      fcmToken:
                        newToken,

                      platform:
                        Platform.OS,

                    }),
                }
              );


            const responseText =
              await response.text();


            if (!response.ok) {

              console.log(
                'Customer refreshed FCM token backend update failed:',
                responseText
              );

              return;
            }


            console.log(
              'Customer refreshed FCM token saved successfully'
            );


          } catch (error) {

            console.log(
              'Customer FCM token refresh error:',
              error
            );

          }

        }
      );

  };


// ============================================================
// STOP TOKEN REFRESH LISTENER
// ============================================================

export const stopFCMTokenRefreshListener =
  () => {

    if (
      tokenRefreshUnsubscribe
    ) {

      tokenRefreshUnsubscribe();

      tokenRefreshUnsubscribe =
        null;


      console.log(
        'Customer FCM token refresh listener stopped'
      );

    }

  };


// ============================================================
// REMOVE FCM TOKEN FROM BACKEND
// ============================================================

export const removeFCMTokenFromBackend =
  async email => {

    try {

      const normalizedEmail =
        String(email || '')
          .trim()
          .toLowerCase();


      if (!normalizedEmail) {

        return;

      }


      const response =
        await fetch(
          `${API_URL}/remove-fcm-token`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                email:
                  normalizedEmail,
              }),
          }
        );


      const responseText =
        await response.text();


      if (!response.ok) {

        console.log(
          'Customer FCM backend remove failed:',
          responseText
        );

        return;

      }


      console.log(
        'Customer FCM token removed from backend'
      );


    } catch (error) {

      console.log(
        'Customer remove FCM token backend error:',
        error
      );

    }

  };


// ============================================================
// DELETE LOCAL FIREBASE TOKEN
// ============================================================

export const deleteLocalFCMToken =
  async () => {

    try {

      /*
       * Keep same behavior as the working
       * Dealer implementation.
       */

      if (
        typeof messaging.deleteToken ===
        'function'
      ) {

        await messaging.deleteToken();

      }


      await AsyncStorage.removeItem(
        'customer_fcm_token'
      );


      console.log(
        'Customer local FCM token deleted'
      );


    } catch (error) {

      console.log(
        'Customer local FCM token delete error:',
        error
      );

    }

  };


// ============================================================
// CUSTOMER LOGOUT FCM CLEANUP
// ============================================================

export const logoutFCM =
  async email => {

    try {

      console.log(
        'Starting Customer FCM logout cleanup'
      );


      // Stop refresh listener first
      stopFCMTokenRefreshListener();


      // Remove token from HubSpot/backend
      await removeFCMTokenFromBackend(
        email
      );


      // Remove token locally
      await deleteLocalFCMToken();


      console.log(
        'Customer FCM logout cleanup completed'
      );


    } catch (error) {

      console.log(
        'Customer FCM logout cleanup error:',
        error
      );

    }

  };