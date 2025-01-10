import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { fetchDeviceStatus, updateDeviceStatus, login, tokens, refreshTokens } from "../services/api";

export const DeviceControl = () => {
  const [deviceStatus, setDeviceStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cihaz durumunu al
  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const status = await fetchDeviceStatus();
      setDeviceStatus(status);
    } catch (error) {
      console.error("Failed to fetch device status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cihaz durumunu değiştir
  const toggleDeviceStatus = async () => {
    if (!deviceStatus) return;
    setIsLoading(true);
    try {
      await updateDeviceStatus(deviceStatus);
      const updatedStatus = deviceStatus === "BLOCKED" ? "UNBLOCKED" : "BLOCKED";
      setDeviceStatus(updatedStatus);
    } catch (error) {
      console.error("Failed to update device status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await login(); // Otomatik giriş yap
        await fetchStatus(); // Cihaz durumunu getir
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initialize();

    // Token yenileme işlemi için interval ayarla
    const interval = setInterval(async () => {
      try {
        if (tokens?.refreshToken) {
          await refreshTokens();
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    }, 5 * 60 * 1000); // Her 5 dakikada bir

    return () => clearInterval(interval); // Temizlik
  }, []);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#F8AB16" />
      ) : (
        <>
          <Text style={styles.statusText}>Device Status: {deviceStatus || "Unknown"}</Text>
          <TouchableOpacity style={styles.button} onPress={toggleDeviceStatus}>
            <Text style={styles.buttonText}>
              {deviceStatus === "BLOCKED" ? "Unblock Device" : "Block Device"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#F8AB16",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
