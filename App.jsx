import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';

import React, { useEffect } from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  NavigationContainer,
} from '@react-navigation/native';


// ============================================================
// SCREENS
// ============================================================

import Home from './src/screens/Home';
import Profile from './src/screens/Profile';
import Ticket from './src/screens/Ticket';
import ThankYou from './src/screens/ThankYou';
import Loading from './src/screens/Loading';
import Login from './src/screens/Login';
import ForgotPassword from './src/screens/ForgotPassword';
import KnowledgeBase from './src/screens/KnowledgeBase';
import KnowledgeDetail from './src/screens/KnowledgeDetail';
import More from './src/screens/More';
import Feedback from './src/screens/Feedback';
import AskAlex from './src/screens/AskAlex';
import ViewTicket from './src/screens/ViewTicket';
import ViewTicketDetail from './src/screens/ViewTicketDetail';
import UploadArticles from './src/screens/UploadArticles';
import OwnerTickets from './src/screens/OwnerTickets';
import Chatscreen from './src/screens/Chatscreen';
import CustomerNewsListing from './src/screens/CustomerNewsListing';
import CustomerNewsDetail from './src/screens/CustomerNewsDetail';
import WebViewScreen from './src/screens/WebViewScreen';


// ============================================================
// NOTIFICATION NAVIGATION
// ============================================================

import {
  navigationRef,
  openPendingTicket,
} from './src/navigation/navigationRef';

import {
  setupNotificationOpenHandlers,
} from './src/utils/fcm';


// ============================================================
// STACK NAVIGATOR
// ============================================================

const Stack =
  createNativeStackNavigator();


// ============================================================
// APP
// ============================================================

const App = () => {


  // ==========================================================
  // SETUP NOTIFICATION CLICK HANDLERS
  // ==========================================================

  useEffect(() => {

    console.log(
      'Setting up Customer App notification handlers'
    );


    const cleanup =
      setupNotificationOpenHandlers();


    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {

      if (
        typeof cleanup === 'function'
      ) {

        cleanup();

      }

    };

  }, []);


  // ==========================================================
  // APP UI
  // ==========================================================

  return (

    <NavigationContainer

      ref={navigationRef}

      onReady={() => {

        console.log(
          'Customer NavigationContainer ready'
        );


        /*
         * Agar app notification se cold start hua tha
         * aur navigation ready hone se pehle ticket
         * pending save hua tha, to ab usko open karo.
         */

        openPendingTicket();

      }}

    >

      <Stack.Navigator>


        {/* ====================================================
            LOADING
        ==================================================== */}

        <Stack.Screen
          name="Loading"
          component={Loading}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            HOME
        ==================================================== */}

        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            PROFILE
        ==================================================== */}

        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            CREATE TICKET
        ==================================================== */}

        <Stack.Screen
          name="Ticket"
          component={Ticket}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            THANK YOU
        ==================================================== */}

        <Stack.Screen
          name="ThankYou"
          component={ThankYou}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            LOGIN
        ==================================================== */}

        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            FORGOT PASSWORD
        ==================================================== */}

        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            KNOWLEDGE BASE
        ==================================================== */}

        <Stack.Screen
          name="KnowledgeBase"
          component={KnowledgeBase}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            KNOWLEDGE DETAIL
        ==================================================== */}

        <Stack.Screen
          name="KnowledgeDetail"
          component={KnowledgeDetail}
          options={{
            title: 'Article',
            headerShown: false,
          }}
        />


        {/* ====================================================
            MORE
        ==================================================== */}

        <Stack.Screen
          name="More"
          component={More}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            FEEDBACK
        ==================================================== */}

        <Stack.Screen
          name="Feedback"
          component={Feedback}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            ASK ALEX
        ==================================================== */}

        <Stack.Screen
          name="AskAlex"
          component={AskAlex}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            VIEW TICKETS
        ==================================================== */}

        <Stack.Screen
          name="ViewTicket"
          component={ViewTicket}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            TICKET DETAIL
        ==================================================== */}

        <Stack.Screen
          name="ViewTicketDetail"
          component={ViewTicketDetail}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            UPLOAD ARTICLES
        ==================================================== */}

        <Stack.Screen
          name="UploadArticles"
          component={UploadArticles}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            OWNER TICKETS
        ==================================================== */}

        <Stack.Screen
          name="OwnerTickets"
          component={OwnerTickets}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            CHAT SCREEN
        ==================================================== */}

        <Stack.Screen
          name="Chatscreen"
          component={Chatscreen}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            CUSTOMER NEWS LISTING
        ==================================================== */}

        <Stack.Screen
          name="CustomerNewsListing"
          component={CustomerNewsListing}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            CUSTOMER NEWS DETAIL
        ==================================================== */}

        <Stack.Screen
          name="CustomerNewsDetail"
          component={CustomerNewsDetail}
          options={{
            headerShown: false,
          }}
        />


        {/* ====================================================
            WEB VIEW
        ==================================================== */}

        <Stack.Screen
          name="WebViewScreen"
          component={WebViewScreen}
          options={{
            headerShown: false,
          }}
        />


      </Stack.Navigator>

    </NavigationContainer>

  );

};


export default App;