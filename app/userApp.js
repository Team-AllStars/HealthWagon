import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import QRCode from 'react-native-qrcode-svg';
import { ScrollView } from 'react-native';
import * as Location from 'expo-location';

const colors = {
  darkBlue: '#011754',
  lightBlue: '#0093E9',
  mediumBlue: '#80D0C7'
};

// remove comment at playAlarmSound to work
// remove comment at sendSMSCoordinates to work
// api request at https://flaskapi-ruddy.vercel.app/patients

import axios from 'axios';
import { encode as base64Encode } from 'base-64';



//     if (response && response.data) {
//       console.log('Message sent successfully:', response.data);
//     } else {
//       console.error('Error sending message: Response data is undefined');
//       // Handle the error appropriately
//     }
//   } catch (error) {
//     console.error('Error sending message:', error.response ? error.response.data : error.message);
//     // Handle the error appropriately
//   }
// };

const sendSMSWithCoordinates = async () => {
  const accountSid = '';
  const authToken = '';
  const fromNumber = '';
  const toNumber = '';
  const toNumber1 = "";

  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    const messageBody = `Fall detected! Patient requires immediate assistance. Location: Latitude: ${latitude}, Longitude: ${longitude}`;

    // Send SMS to the first number
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Body: messageBody,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${base64Encode(`${accountSid}:${authToken}`)}`,
        },
      }
    );

    // Send SMS to the second number
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: fromNumber,
        To: toNumber1,
        Body: messageBody,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${base64Encode(`${accountSid}:${authToken}`)}`,
        },
      }
    );

    console.log('Messages sent successfully');

  } catch (error) {
    console.error('Error sending messages:', error.response ? error.response.data : error.message);
    // Handle the error appropriately
  }
};


// Gyroscope
// x-axis: This represents the rotation or angular velocity around the device's x-axis. Depending on the orientation of the device, this could correspond to tilting or rotating the device along its lengthwise axis (from left to right).
// y-axis: This represents the rotation or angular velocity around the device's y-axis. This could correspond to tilting or rotating the device along its widthwise axis (from bottom to top).
// z-axis: This represents the rotation or angular velocity around the device's z-axis. This could correspond to spinning the device along its vertical axis (clockwise or counterclockwise).

// Accelorometer
// x-axis: This represents the acceleration along the device's x-axis. Depending on the orientation of the device, this could correspond to acceleration in the horizontal direction (from left to right or right to left).
// y-axis: This represents the acceleration along the device's y-axis. This could correspond to acceleration in the vertical direction (from bottom to top or top to bottom).
// z-axis: This represents the acceleration along the device's z-axis. This could correspond to acceleration along the depth of the device (towards or away from the screen).

let mainEmail = ""
let jsonString = null

function FallDetectionScreen({ onDismiss }) {
  const [alarmSound, setAlarmSound] = useState();
  const [showButton, setShowButton] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [showQRAndText, setShowQRAndText] = useState(false);

  const playAlarmSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/alarm.mp3')
      );
      await sound.playAsync();
      setAlarmSound(sound);
    } catch (error) {
      console.log('Error playing alarm sound:', error);
    }
  };

  const stopAlarmSound = async () => {
    if (alarmSound) {
      await alarmSound.stopAsync();
    }
  };

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    // Stop the alarm sound and remove the button after 5 seconds
    setTimeout(() => {
      clearInterval(timer);
      stopAlarmSound();
      setShowButton(false);
      setShowQRAndText(true); // Show QR code and text after 5 seconds
      //playAlarmSound(); // Play the alarm sound after 5 seconds
      sendSMSWithCoordinates()
    }, 5000);

    return () => {
      clearInterval(timer);
      stopAlarmSound(); // Stop the alarm sound when component unmounts
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={fallStyles.fallText}>Potential Fall Detected!</Text>
      <Text style={fallStyles.fallSubText}>It seems like a fall has been detected. Please confirm whether you need assistance.</Text>

      {/* rendering this only after countdown */}
      {showQRAndText && (
        <>
          <View style={{ marginTop: 20 }}>
            <QRCode value={jsonString} size={200} />
          </View>
          <Text style={fallStyles.callingHelpText}>CONTACTING EMERGENCY SERVICES FOR IMMEDIATE ASSISTANCE</Text>
        </>
      )}

      {showButton ? (
        <TouchableOpacity onPress={onDismiss} style={fallStyles.returnButton}>
          <Text style={fallStyles.returnButtonText}>
            {`Dismiss (${countdown}s)`}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}


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
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const emailApi = 'https://flaskapi-ruddy.vercel.app/email/' + mainEmail;
        const emailResponse = await axios.get(emailApi);
        // console.log(emailResponse)
        const patientId = emailResponse.data.Patient_id;
        // console.log(patientId)
        const patientApi = 'https://flaskapi-ruddy.vercel.app/patient_all/' + patientId;
        const patientResponse = await axios.get(patientApi);
        // console.log(patientResponse.data.result)
        setUserData(patientResponse.data.result);

        const medicalHistory = patientResponse.data.result.medical_history[0];
        const allergies = patientResponse.data.result.allergies[0];
        const patientInfo = patientResponse.data.result.patient_demographics[0].Name

        const combinedData = {
          Name: patientInfo,
          Medical_history: medicalHistory,
          Allergies: allergies
        }
        jsonString = JSON.stringify(combinedData)
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#0093E9', '#80D0C7']}
      style={myHealthStyles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView style={myHealthStyles.scrollView}>
        <View style={myHealthStyles.card}>
          {/* Patient Demographics */}
          <Text style={myHealthStyles.sectionTitle}>General Information</Text>
          <View>

            <Text style={myHealthStyles.label}>EHR ID:</Text>
            <Text style={myHealthStyles.value}>{userData.patient_demographics[0].Patient_id}</Text>

            <Text style={myHealthStyles.label}>Name:</Text>
            <Text style={myHealthStyles.value}>{userData.patient_demographics[0].Name}</Text>

            <Text style={myHealthStyles.label}>Date of Birth:</Text>
            <Text style={myHealthStyles.value}>{userData.patient_demographics[0].DOB}</Text>

            <Text style={myHealthStyles.label}>Email:</Text>
            <Text style={myHealthStyles.value}>{userData.patient_demographics[0].Email}</Text>

            <Text style={myHealthStyles.label}>Ethinicity:</Text>
            <Text style={myHealthStyles.value}>{userData.patient_demographics[0].Ethinicity}</Text>

            <Text style={myHealthStyles.label}>Gender:</Text>
            <Text style={myHealthStyles.value}>{userData.patient_demographics[0].Gender}</Text>

            <Text style={myHealthStyles.label}>Language:</Text>
            <Text style={myHealthStyles.value}>{userData.patient_demographics[0].Language}</Text>

            <Text style={myHealthStyles.label}>Marital Status:</Text>
            <Text style={myHealthStyles.value}>{userData.patient_demographics[0].Marital_Status}</Text>
          </View>

          {/* Allergies */}
          <Text style={myHealthStyles.sectionTitle}>Allergies</Text>
          {userData.allergies.map((allergy, index) => (
            <View key={index}>
              <Text style={myHealthStyles.label}>Allergen:</Text>
              <Text style={myHealthStyles.value}>{allergy.allergen}</Text>
              <Text style={myHealthStyles.label}>Reaction:</Text>
              <Text style={myHealthStyles.value}>{allergy.Reaction}</Text>
              <Text style={myHealthStyles.label}>Severity:</Text>
              <Text style={myHealthStyles.value}>{allergy.Severity}</Text>
            </View>
          ))}

          {/* Medical History */}
          <Text style={myHealthStyles.sectionTitle}>Medical History</Text>
          {userData.medical_history.map((a, index) => (
            <View key={index}>
              <Text style={myHealthStyles.label}>Family History</Text>
              <Text style={myHealthStyles.value}>{a.Family_History}</Text>
              <Text style={myHealthStyles.label}>Major Illness:</Text>
              <Text style={myHealthStyles.value}>{a.Major_illness}</Text>
              <Text style={myHealthStyles.label}>Treatments:</Text>
              <Text style={myHealthStyles.value}>{a.Teatments}</Text>
            </View>
          ))}

          {/* Vitals */}
          <Text style={myHealthStyles.sectionTitle}>Vitals</Text>
          {userData.vitals.map((vital, index) => (
            <View key={index}>
              <Text style={myHealthStyles.label}>Blood Glucose:</Text>
              <Text style={myHealthStyles.value}>{vital.Blood_Glucose}</Text>
              <Text style={myHealthStyles.label}>Blood Pressure:</Text>
              <Text style={myHealthStyles.value}>{vital.Blood_Pressure}</Text>
              <Text style={myHealthStyles.label}>Heart Rate:</Text>
              <Text style={myHealthStyles.value}>{vital.Heart_Rate}</Text>
              <Text style={myHealthStyles.label}>Respiration Rate:</Text>
              <Text style={myHealthStyles.value}>{vital.Respiration_Rate}</Text>
              <Text style={myHealthStyles.label}>SPO2:</Text>
              <Text style={myHealthStyles.value}>{vital.SPO2}</Text>
              <Text style={myHealthStyles.label}>Temperature:</Text>
              <Text style={myHealthStyles.value}>{vital.Temperature}</Text>
            </View>
          ))}

          {/* Medication history */}
          <Text style={myHealthStyles.sectionTitle}>Medication History</Text>
          {userData.medication_history.map((medication, index) => (
            <View key={index} style={myHealthStyles.medicationContainer}>
              <Text style={myHealthStyles.label}>Medication Name:</Text>
              <Text style={myHealthStyles.value}>{medication.M_Name}</Text>
              <Text style={myHealthStyles.label}>Dosage:</Text>
              <Text style={myHealthStyles.value}>{medication.Dosage}</Text>
              <Text style={myHealthStyles.label}>Reason:</Text>
              <Text style={myHealthStyles.value}>{medication.M_Reason}</Text>
              <Text style={myHealthStyles.label}>Route:</Text>
              <Text style={myHealthStyles.value}>{medication.Route}</Text>
              {index !== userData.medication_history.length - 1 && <View style={myHealthStyles.divider}></View>}
            </View>
          ))}

          {/* Immunization History */}
          <Text style={myHealthStyles.sectionTitle}>Immunization History</Text>
          {userData.immunization_history.map((immunization, index) => (
            <View key={index} style={myHealthStyles.immunizationContainer}>
              <Text style={myHealthStyles.label}>Administration Date:</Text>
              <Text style={myHealthStyles.value}>{immunization.Administration_date}</Text>
              <Text style={myHealthStyles.label}>Vaccine Name:</Text>
              <Text style={myHealthStyles.value}>{immunization.Vaccine_name}</Text>
              {/* Add a nice line with design */}
              {index !== userData.immunization_history.length - 1 && <View style={myHealthStyles.divider}></View>}
            </View>
          ))}

          {/* Diagnosis History */}
          <Text style={myHealthStyles.sectionTitle}>Diagnosis History</Text>
          {userData.diagnosis_history.map((diagnosis, index) => (
            <View key={index} style={myHealthStyles.diagnosisContainer}>
              <Text style={myHealthStyles.label}>Date of Diagnosis:</Text>
              <Text style={myHealthStyles.value}>{diagnosis.Date_of_Diagnosis}</Text>
              <Text style={myHealthStyles.label}>Primary Diagnosis:</Text>
              <Text style={myHealthStyles.value}>{diagnosis.Primary_Diagnosis}</Text>
              {/* Add a nice line with design */}
              {index !== userData.diagnosis_history.length - 1 && <View style={myHealthStyles.divider}></View>}
            </View>
          ))}
          {/* Insurance Details */}
          <Text style={myHealthStyles.sectionTitle}>Insurance Details</Text>
          {userData.insurance_details.map((insurance, index) => (
            <View key={index} style={myHealthStyles.insuranceContainer}>
              <Text style={myHealthStyles.label}>Effective Date:</Text>
              <Text style={myHealthStyles.value}>{insurance.Effective_Date}</Text>
              <Text style={myHealthStyles.label}>Expiry Date:</Text>
              <Text style={myHealthStyles.value}>{insurance.Expiry_Date}</Text>
              <Text style={myHealthStyles.label}>Plan:</Text>
              <Text style={myHealthStyles.value}>{insurance.Plan}</Text>
              {/* Add a nice line with design */}
              {index !== userData.insurance_details.length - 1 && <View style={myHealthStyles.divider}></View>}
            </View>
          ))}
          {/* Other sections go here... */}

        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const myHealthStyles = StyleSheet.create({
  gradient: {
    flex: 1,
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
function SettingsScreen() {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const handleTriggerSOS = () => {
    navigation.navigate('FallDetectionScreen', { onDismiss: () => setIsFallDetected(false) });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogout}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Log out</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sosButton} onPress={handleTriggerSOS}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Manual Trigger SOS</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // const handleLogin = () => {
  //   if (email === 'abc' && password === 'pass') {
  //     navigation.replace('MainApp');
  //   } else {
  //     console.log('Invalid credentials');
  //     Alert.alert('Login Failed', 'Invalid credentials');
  //   }
  // };
  const handleLogin = async () => {
    try {
      const requestBody = {
        "Email": email,
        "Password": password
      };
      const response = await axios.post('https://flaskapi-ruddy.vercel.app/login_verify', requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assuming your Flask API returns a JSON response with a 'success' property
      if (response.data.result === 'True') {
        navigation.replace('MainApp');
        mainEmail = email
      } else {
        console.log('Login failed');
        Alert.alert('Login Failed', 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
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
  const threshold = 1.2; // Threshold for high acceleration (expressed in terms of g)
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [isFallDetected, setIsFallDetected] = useState(false);
  const navigation = useNavigation();

  const _subscribeToAccelerometer = () => {
    Accelerometer.setUpdateInterval(1000);
    Accelerometer.addListener((data) => {
      setAccelerometerData(data);
      checkForFall(data);
    });
  };

  const checkForFall = ({ x, y, z }) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    if (magnitude >= threshold) {
      setIsFallDetected(true);
    }
  };

  const _subscribeToGyroscope = () => {
    Gyroscope.setUpdateInterval(1000);
    Gyroscope.addListener((data) => {
      setGyroscopeData(data);
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

  if (isFallDetected) {
    return <FallDetectionScreen onDismiss={() => setIsFallDetected(false)} />;
  }

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
        <Stack.Screen name="FallDetectionScreen" component={FallDetectionScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

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

  sosButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
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
