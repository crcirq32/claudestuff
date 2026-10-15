import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import { AppProvider } from './src/context/AppContext';
import TabNavigator from './src/navigation/TabNavigator';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import ZipCodeSearchScreen from './src/screens/ZipCodeSearchScreen';
import JobDetailScreen from './src/screens/JobDetailScreen';
import AccountLinkingScreen from './src/screens/AccountLinkingScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import MyDutiesScreen from './src/screens/MyDutiesScreen';

import { colors } from './src/theme/colors';

const Stack = createStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary.lavenderDark} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.primary.lavender,
              },
              headerTintColor: colors.text.inverse,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ZipCodeSearch"
              component={ZipCodeSearchScreen}
              options={{ title: 'Browse Jobs', headerShown: false }}
            />
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
              options={{ title: 'Job Details' }}
            />
            <Stack.Screen
              name="AccountLinking"
              component={AccountLinkingScreen}
              options={{ title: 'Link Account' }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{ title: 'Add Account ($0.99)' }}
            />
            <Stack.Screen
              name="MyDuties"
              component={MyDutiesScreen}
              options={{ title: 'My Duties' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
