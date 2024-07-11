import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, Camera } from "expo-camera/next";
import { ScrollView } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';


const EMTStyles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  notesInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#0093E9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  insuranceContainer: {
    marginBottom: 20,
  },
  immunizationContainer: {
    marginBottom: 20,
  },
  diagnosisContainer: {
    marginBottom: 20,
  },
  medicationContainer: {
    marginBottom: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    marginTop: 25,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    marginBottom: 10,
  },
});


function ScannedDataScreen({ route }) {
  const { data } = route.params;
  const parsedData = JSON.parse(data)
  const Allergies = parsedData.Allergies
  const Medical_history = parsedData.Medical_history

  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log('Location permission status:', status);

    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      console.log('Location:', location);
      setLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleSubmit = async () => {

    // Handle submission logic here
    console.log('Notes:', notes);
    console.log('Location:', location);

    try {
      const latitudeString = String(location.latitude);
      const longitudeString = String(location.longitude);
      console.log(location.coords.latitude)
      console.log(String(location.coords.latitude))
      const requestBody = {
        "Lattitude": String(location.coords.latitude),
        "Longitude": String(location.coords.longitude)
      };
      console.log(requestBody)
      Alert.alert('Success', 'Patient Record and Notes has been sent successfully!', [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
    } catch (error) {
      console.error('Error:', error.message);
      // Handle error if fetch fails
    }
  };


  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={EMTStyles.gradient}>
        <View style={EMTStyles.card}>
          <Text style={EMTStyles.sectionTitle}>Patient Information</Text>
          <Text style={EMTStyles.label}>Name:</Text>
          <Text style={EMTStyles.value}>{parsedData.Name}</Text>

          <View style={EMTStyles.divider} />

          <View style={EMTStyles.allergyContainer}>
            <Text style={EMTStyles.sectionTitle}>Allergies</Text>

            <View>
              <Text style={EMTStyles.label}>Date of Diagnosis:</Text>
              <Text style={EMTStyles.value}>{Allergies.Date_of_diagnosis}</Text>
              <Text style={EMTStyles.label}>Allergen:</Text>
              <Text style={EMTStyles.value}>{Allergies.allergen}</Text>
              <Text style={EMTStyles.label}>Reaction:</Text>
              <Text style={EMTStyles.value}>{Allergies.Reaction}</Text>
              <Text style={EMTStyles.label}>Severity:</Text>
              <Text style={EMTStyles.value}>{Allergies.Severity}</Text>
              <View style={EMTStyles.divider} />
            </View>

          </View>

          <View style={EMTStyles.medicalHistoryContainer}>
            <Text style={EMTStyles.sectionTitle}>Medical History</Text>

            <View>
              <Text style={EMTStyles.label}>Family History:</Text>
              <Text style={EMTStyles.value}>{Medical_history.Family_History}</Text>
              <Text style={EMTStyles.label}>Major Illness:</Text>
              <Text style={EMTStyles.value}>{Medical_history.Major_illness}</Text>
              <Text style={EMTStyles.label}>Treatments:</Text>
              <Text style={EMTStyles.value}>{Medical_history.Teatments}</Text>
              <View style={EMTStyles.divider} />
            </View>

          </View>
          {/* Text input for notes */}
          <TextInput
            style={[EMTStyles.value, EMTStyles.notesInput]}
            multiline
            placeholder="Enter your notes here..."
            value={notes}
            onChangeText={setNotes}
          />

          {/* Submit button */}
          <TouchableOpacity style={EMTStyles.submitButton} onPress={handleSubmit}>
            <Text style={EMTStyles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView >
  );
}

function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData(data); // Store the scanned data
    navigation.navigate('ScannedData', { data });
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={cameraStyle.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barCodeTypes: ["qr", "pdf417"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Tap to Scan QR Code"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}
const cameraStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 40,
  },
  cameraContainer: {
    width: '80%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 40,
  },
  camera: {
    flex: 1,
  },
  button: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

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
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: { backgroundColor: '#000000' },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
          headerStyle: { backgroundColor: '#801604' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontSize: 23,
          },
        }}>
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-outline" color={color} size={size} />
          ),
          headerStyle: { backgroundColor: '#801604' },
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
        <Stack.Screen name="ScannedData" component={ScannedDataScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const colors = {
  darkBlue: '#801604',
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

const fallStyles = StyleSheet.create({
  fallText: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  callingHelpText: {
    marginTop: 50,
    fontSize: 22,
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
    marginHorizontal: 5
  },
  fallSubText: {
    fontSize: 20,
    textAlign: 'center',
    marginHorizontal: 5
  },
  returnButton: {
    marginTop: 20,
    backgroundColor: colors.darkBlue,
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 24, // Horizontal padding
    borderRadius: 8, // Border radius
    alignItems: 'center'
  },
  returnButtonText: {
    color: 'white',
  }
});
