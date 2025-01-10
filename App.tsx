import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { login, fetchUserDevices, updateDeviceStatus, refreshTokens, tokens } from './src/services/api';
import { DEVICE_ID } from './src/constants/constants';

interface DeviceDetails {
  nickName: string;
  status: string;
  batteryVoltage: number | null;
  location: string | null;
  firmwareVersion: string | null;
  lastConnectionDate: string | null;
}

export default function App() {
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  // Logları ekrana yazdırmak için
  const log = (message: string) => {
    console.log(message);
    setLogMessages((prev) => [...prev, message]);
  };

  // Cihaz detaylarını getir
  const fetchDeviceDetails = async () => {
    log('[fetchDeviceDetails] Fetching device details...');
    setIsLoading(true);
    try {
      const devices = await fetchUserDevices();
      const targetDevice = devices.find((d: any) => d.device.id === DEVICE_ID);

      if (!targetDevice) {
        throw new Error('Device not found');
      }

      setDeviceDetails({
        nickName: targetDevice.device.nickName,
        status: targetDevice.device.status,
        batteryVoltage: targetDevice.device.batteryVoltage,
        location: targetDevice.device.location,
        firmwareVersion: targetDevice.device.firmwareVersion,
        lastConnectionDate: targetDevice.device.lastConnectionDate,
      });
      log('[fetchDeviceDetails] Device details fetched successfully.');
    } catch (err: any) {
      console.error('[fetchDeviceDetails] Failed to fetch device details:', err);
      setError('Failed to fetch device details');
    } finally {
      setIsLoading(false);
    }
  };

  // Cihaz durumunu değiştir
  const toggleDeviceStatus = async () => {
    if (!deviceDetails) {
      log('[toggleDeviceStatus] No device details available to toggle status.');
      return;
    }

    log(`[toggleDeviceStatus] Current status: ${deviceDetails.status}`);
    setIsLoading(true);
    try {
      await updateDeviceStatus(deviceDetails.status);
      const newStatus = deviceDetails.status === 'BLOCKED' ? 'UNBLOCKED' : 'BLOCKED';
      setDeviceDetails((prev) => prev && { ...prev, status: newStatus });
      log(`[toggleDeviceStatus] Device status updated to: ${newStatus}`);
    } catch (err: any) {
      console.error('[toggleDeviceStatus] Failed to update device status:', err);
      setError('Failed to update device status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      log('[initializeApp] Starting app initialization...');
      try {
        await login(); // Otomatik giriş
        log('[initializeApp] Login successful.');
        await fetchDeviceDetails(); // Cihaz detaylarını getir
      } catch (err: any) {
        console.error('[initializeApp] Initialization error:', err);
        setError('Failed to initialize app');
      }

      // Token yenileme işlemi için interval ayarla
      const interval = setInterval(async () => {
        log('[refreshTokens] Attempting to refresh tokens...');
        try {
          if (tokens?.refreshToken) {
            await refreshTokens();
            log('[refreshTokens] Tokens refreshed successfully.');
          } else {
            log('[refreshTokens] No refresh token available.');
          }
        } catch (err: any) {
          console.error('[refreshTokens] Failed to refresh tokens:', err);
          setError('Failed to refresh tokens');
        }
      }, 2 * 60 * 1000); // Her 2 dakikada bir yenile

      return () => {
        log('[initializeApp] Cleaning up interval...');
        clearInterval(interval); // Interval temizliği
      };
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={"default"} />
      <View style={styles.container}>
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
            <TouchableOpacity style={styles.button} onPress={toggleDeviceStatus}>
              <Image
                source={
                  deviceDetails.status === 'BLOCKED'
                    ? require('./assets/images/console_boucner_active_down.png')
                    : require('./assets/images/console_bouncer_active_up.png')
                }
                style={styles.image}
              />
              <Text style={styles.buttonText}>
                {deviceDetails.status === 'BLOCKED' ? 'Unblock Device' : 'Block Device'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.statusText}>No device details available.</Text>
        )}
      </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#F8AB16',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 64,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 10,
  },
  image: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
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
