// Handles device-related actions and data fetching
import { fetchUserDevices, updateDeviceStatus, login, tokens } from './api';
import { DEVICE_ID } from '../constants/constants';

// Fetches and formats device details from the API
export const fetchDeviceDetails = async () => {
  if (!tokens?.accessToken) {
    await login();
  }
  
  const devices = await fetchUserDevices();
  const targetDevice = devices.find((d: any) => d.device.id === DEVICE_ID);

  if (!targetDevice) {
    throw new Error('Device not found');
  }

  // Map the API status to our operational status
  let status = 'UNBLOCK';
  if (targetDevice.device.status === 'BLOCKED') {
    status = 'BLOCK';
  } else if (targetDevice.device.status === 'IN_USE') {
    status = 'ONGOING_PARKING';
  } else if (targetDevice.device.status === 'ALARM') {
    status = 'ALARM';
  }

  return {
    nickName: targetDevice.device.nickName,
    status: status,
    batteryVoltage: targetDevice.device.batteryVoltage,
    location: targetDevice.device.location,
    firmwareVersion: targetDevice.device.firmwareVersion,
    lastConnectionDate: targetDevice.device.lastConnectionDate,
  };
};

// İlk bağlantıyı sağlamak için yeni fonksiyon
export const initializeDeviceConnection = async () => {
  if (!tokens?.accessToken) {
    await login();
  }
  
  // İlk bağlantıda READY_TO_PARK durumuna geçir
  await updateDeviceStatus('GUARDING'); // Önce GUARDING'e geçiriyoruz
  return 'READY_TO_PARK'; // Sonra READY_TO_PARK durumuna geçiyor
};

// Toggles the device status between BLOCKED and UNBLOCKED states
export const toggleDeviceStatus = async (currentStatus: string) => {
  if (!tokens?.accessToken) {
    await login();
  }
  
  let newStatus;
  switch (currentStatus) {
    case 'UNBLOCK':
      newStatus = 'BLOCK';
      break;
    case 'BLOCK':
      newStatus = 'UNBLOCK';
      break;
    default:
      throw new Error('Device is in a state that cannot be toggled');
  }
  
  await updateDeviceStatus(currentStatus);
  return newStatus;
};
