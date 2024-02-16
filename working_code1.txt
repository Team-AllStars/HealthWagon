import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Accelerometer, Gyroscope } from 'expo-sensors';

function HomeScreen({ accelerometerData, gyroscopeData }) {
  return (
    <View style={homeScreenStyles.container}>
      <Text style={homeScreenStyles.text}>Accelerometer Data:</Text>
      <Text style={homeScreenStyles.text}>X: {accelerometerData.x.toFixed(2)}</Text>
      <Text style={homeScreenStyles.text}>Y: {accelerometerData.y.toFixed(2)}</Text>
      <Text style={homeScreenStyles.text}>Z: {accelerometerData.z.toFixed(2)}</Text>
      <Text style={homeScreenStyles.text}>Gyroscope Data:</Text>
      <Text style={homeScreenStyles.text}>X: {gyroscopeData.x.toFixed(2)}</Text>
      <Text style={homeScreenStyles.text}>Y: {gyroscopeData.y.toFixed(2)}</Text>
      <Text style={homeScreenStyles.text}>Z: {gyroscopeData.z.toFixed(2)}</Text>
    </View>
  );
}

function MyHealthScreen() {
  return (

    <LinearGradient
      colors={['#0093E9', '#80D0C7']} // Gradient colors
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={myHealthStyles.card}>

        <View style={myHealthStyles.title}>
          <Ionicons name="person-circle-outline" size={80} color="#0093E9" />
          <Text style={myHealthStyles.name}>Arunachalam </Text>
        </View>

        <View style={myHealthStyles.detailsContainer}>
          <View style={myHealthStyles.infoContainer}>
            <Text style={myHealthStyles.label}>Date of Birth</Text>
            <Text style={myHealthStyles.value}>10/12/2002</Text>
          </View>
          <View style={myHealthStyles.infoContainer}>
            <Text style={myHealthStyles.label}>Phone Number</Text>
            <Text style={myHealthStyles.value}>9889891092</Text>
          </View>
          <View style={myHealthStyles.infoContainer}>
            <Text style={myHealthStyles.label}>Gender</Text>
            <Text style={myHealthStyles.value}>Male</Text>
          </View>
          <View style={myHealthStyles.infoContainer}>
            <Text style={myHealthStyles.label}>Marital Status</Text>
            <Text style={myHealthStyles.value}>Single</Text>
          </View>
          <View style={myHealthStyles.infoContainer}>
            <Text style={myHealthStyles.label}>Ethinicity</Text>
            <Text style={myHealthStyles.value}>Indian</Text>
          </View>
          <View style={myHealthStyles.infoContainer}>
            <Text style={myHealthStyles.label}>Language</Text>
            <Text style={myHealthStyles.value}>Tamil</Text>
          </View>
        </View>
        {/* Add more patient details as needed */}

      </View>
    </LinearGradient>
  );
}

function SettingsScreen() {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogout}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Log out</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'abc' && password === 'pass') {
      navigation.replace('MainApp');
    } else {
      console.log('Invalid credentials');
      Alert.alert('Login Failed', 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Ionicons name="medkit-outline" size={32} color="#4CAF50" />
          <Text style={styles.title}>HealthWagon</Text>
        </View>
        {/* Login box */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Welcome</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Login</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// Tab navigation and heading Styling
function MainApp() {
  const [accelerometerData, setAccelerometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [gyroscopeData, setGyroscopeData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const _subscribeToAccelerometer = () => {
    Accelerometer.setUpdateInterval(1000);
    Accelerometer.addListener(accelerometerData => {
      setAccelerometerData(accelerometerData);
    });
  };

  const _subscribeToGyroscope = () => {
    Gyroscope.setUpdateInterval(1000);
    Gyroscope.addListener(gyroscopeData => {
      setGyroscopeData(gyroscopeData);
    });
  };

  useEffect(() => {
    _subscribeToAccelerometer();
    _subscribeToGyroscope();
    return () => {
      Accelerometer.removeAllListeners();
      Gyroscope.removeAllListeners();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: { backgroundColor: '#011754' },
      }}>
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
          headerStyle: { backgroundColor: '#011754' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontSize: 23,
          },
        }}>
        {() => <HomeScreen accelerometerData={accelerometerData} gyroscopeData={gyroscopeData} />}
      </Tab.Screen>
      <Tab.Screen
        name="My Health"
        component={MyHealthScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size} />
          ),
          headerStyle: { backgroundColor: '#011754' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontSize: 23,
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-outline" color={color} size={size} />
          ),
          headerStyle: { backgroundColor: '#011754' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontSize: 23,
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const colors = {
  darkBlue: '#011754',
  lightBlue: '#0093E9',
  mediumBlue: '#80D0C7'
};

const pageStyle = StyleSheet.create({
  homeScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkBlue,
  },
  container: {
    flex: 1,
    backgroundColor: colors.darkBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#fff',
  },
  loginContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  inputField: {
    padding: 20,
    borderWidth: 0.5,
    margin: 10,
    marginBottom: 20,
    borderRadius: 15,
  },
  loginTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24,
    marginVertical: 10,
  },
  loginButton: {
    backgroundColor: colors.darkBlue,
    borderRadius: 15,
    padding: 20,
    margin: 10,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const myHealthStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 25, // Rounded corners at the top
    borderTopRightRadius: 25, // Rounded corners at the top
    borderBottomLeftRadius: 0, // No rounded corners at the bottom
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 40
  },
  gradient: {
    flex: 1,
    borderRadius: 10, // Ensure the gradient respects the border radius
  },
  name: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 15
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 20,
    width: 150, // Set a fixed width for the labels
    textAlign: 'left', // Align the text to the right
    color: colors.darkBlue
  },
  value: {
    flex: 1,
    fontSize: 18,
    textAlign: 'right',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsContainer: {
    marginTop: 15,
  }
});

const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
