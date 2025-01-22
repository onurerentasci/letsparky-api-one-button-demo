import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { fetchDeviceDetails, toggleDeviceStatus } from './src/services/DeviceActions';
import { ToggleDevice } from './src/components/ToggleDevice';
import { OperationalStatusGuide } from './src/components/OperationalStatusGuide';

// Interface for device information structure
interface DeviceDetails {
  nickName: string;
  status: string;
  batteryVoltage: number | null;
  location: string | null;
  firmwareVersion: string | null;
  lastConnectionDate: string | null;
}

// Main application component
export default function App() {
  // State management for device details and UI states
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const date = new Date();

  // Logs messages with timestamp and updates log display
  const log = (message: string) => {
    console.log(message);
    setLogMessages((prev) => [message, ...prev]); 
  };

  // Handles device status toggle operation
  const handleToggle = async () => {
    if (!deviceDetails) return;
    setIsButtonLoading(true);
    try {
      const newStatus = await toggleDeviceStatus(deviceDetails.status);
      setDeviceDetails((prev) => prev && { ...prev, status: newStatus });
      log(`[handleToggle] Device status updated to: ${newStatus} - ${date.toLocaleString()}`);
    } catch (err) {
      log(`[handleToggle] Failed to update device status - ${date.toLocaleString()}`);
      setError(`Failed to update device status - ${date.toLocaleString()}`);
    } finally {
      setIsButtonLoading(false);
    }
  };

  // Initialize device details on component mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      log(`[initialize] Fetching device details... - ${date.toLocaleString()}`);
      try {
        const details = await fetchDeviceDetails();
        setDeviceDetails(details);
        log(`[initialize] Device details fetched successfully. - ${date.toLocaleString()}`);
      } catch (err) {
        log(`[initialize] Failed to fetch device details - ${date.toLocaleString()}`);
        setError(`Failed to fetch device details - ${date.toLocaleString()}`);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={'default'} />
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.container}>
            <OperationalStatusGuide />
            {isLoading ? (
              <ActivityIndicator size="large" color="#F8AB16" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : deviceDetails ? (
              <>
                <Text style={styles.statusText}>NickName: {deviceDetails.nickName}</Text>
                <Text style={styles.statusText}>Status: {deviceDetails.status}</Text>
                <Text style={styles.statusText}>
                  Battery: {deviceDetails.batteryVoltage ? `${deviceDetails.batteryVoltage / 1000}V` : 'N/A'}
                </Text>
                <Text style={styles.statusText}>Location: {deviceDetails.location || 'Unknown'}</Text>
                <Text style={styles.statusText}>
                  Firmware: {deviceDetails.firmwareVersion || 'Unknown'}
                </Text>
                <Text style={styles.statusText}>
                  Last Connected: {deviceDetails.lastConnectionDate || 'Unknown'}
                </Text>
                <ToggleDevice 
                  status={deviceDetails.status} 
                  onToggle={handleToggle}
                  loading={isButtonLoading} 
                />
              </>
            ) : (
              <Text style={styles.statusText}>No device details available.</Text>
            )}
          </View>
        </ScrollView>
        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Command Line Logs:</Text>
          <ScrollView style={styles.logScroll}>
            {logMessages.map((msg, index) => (
              <Text key={index} style={styles.logMessage}>
                {msg}
              </Text>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  logContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
    backgroundColor: '#f7f7f7',
    height: 200,
    // position: 'absolute' kullanmıyoruz, flex yapısı ile çözüyoruz
  },
  logTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logScroll: {
    maxHeight: 150,
  },
  logMessage: {
    fontSize: 12,
    color: '#333',
  },
});
