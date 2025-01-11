import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

// Component props interface
interface ToggleDeviceProps {
  status: string;         // Current device status (BLOCKED/UNBLOCKED)
  onToggle: () => void;  // Callback function for status toggle
  loading?: boolean;     // Loading state indicator
}

// Button component for toggling device status with loading state
export const ToggleDevice: React.FC<ToggleDeviceProps> = ({ status, onToggle, loading }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, loading && styles.buttonDisabled]} 
      onPress={onToggle}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <Image
            source={
              status === 'BLOCKED'
                ? require('../../assets/images/console_boucner_active_down.png')
                : require('../../assets/images/console_bouncer_active_up.png')
            }
            style={styles.image}
          />
          <Text style={styles.buttonText}>
            {status === 'BLOCKED' ? 'Unblock Device' : 'Block Device'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F8AB16',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 64,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    minWidth: 280,
    justifyContent: 'flex-start',
    height: 80,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
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
});
