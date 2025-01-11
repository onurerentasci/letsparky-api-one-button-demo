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

  return {
    nickName: targetDevice.device.nickName,
    status: targetDevice.device.status,
    batteryVoltage: targetDevice.device.batteryVoltage,
    location: targetDevice.device.location,
    firmwareVersion: targetDevice.device.firmwareVersion,
    lastConnectionDate: targetDevice.device.lastConnectionDate,
  };
};

// Toggles the device status between BLOCKED and UNBLOCKED states
export const toggleDeviceStatus = async (currentStatus: string) => {
  if (!tokens?.accessToken) {
    await login();
  }
  
  const newStatus = currentStatus === 'BLOCKED' ? 'UNBLOCKED' : 'BLOCKED';
  await updateDeviceStatus(currentStatus);
  return newStatus;
};
