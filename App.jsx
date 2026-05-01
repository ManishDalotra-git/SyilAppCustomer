import { StyleSheet, Text, View, ImageBackground , TouchableOpacity, Image  } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();
  
const App = () => {
  return (
     <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Loading" component={Loading} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }}  />
        <Stack.Screen name="Ticket" component={Ticket} options={{ headerShown: false }}  />
        <Stack.Screen name="ThankYou" component={ThankYou} options={{ headerShown: false }}  />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
        <Stack.Screen name="KnowledgeBase" component={KnowledgeBase} options={{ headerShown: false }} />
        <Stack.Screen name="KnowledgeDetail" component={KnowledgeDetail} options={{ title: 'Article', headerShown: false }} />
        <Stack.Screen name="More" component={More} options={{ headerShown: false }} />
        <Stack.Screen name="Feedback" component={Feedback} options={{ headerShown: false }} />
        <Stack.Screen name="AskAlex" component={AskAlex} options={{ headerShown: false }} />
        <Stack.Screen name="ViewTicket" component={ViewTicket} options={{ headerShown: false }} />
        <Stack.Screen name="ViewTicketDetail" component={ViewTicketDetail} options={{ headerShown: false }} />
        <Stack.Screen name="UploadArticles" component={UploadArticles} options={{ headerShown: false }} />
        <Stack.Screen name="OwnerTickets" component={OwnerTickets} options={{ headerShown: false }} />
        <Stack.Screen name="Chatscreen" component={Chatscreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
 
export default App