import axios from "axios";
import { API_URL, EMAIL, PASSWORD, DEVICE_ID } from "../constants/constants";

// Stores authentication tokens for API requests
export let tokens: {
  accessToken?: string;
  refreshToken?: string;
} | null = null;

// Handles API error responses and formats error messages
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.response) {
    const message = error.response.data?.message || "API error occurred";
    console.error('Error details:', message);
    return new Error(message);
  }
  return error;
};

// Authenticates user and retrieves access tokens
export const login = async (): Promise<void> => {
  try {
    const response = await axios.post(`${API_URL}/auth/credentials`, {
      email: EMAIL,
      password: PASSWORD,
    });

    tokens = {
      accessToken: response.data.payload.accessToken,
      refreshToken: response.data.payload.refreshToken,
    };

    console.log("Login successful. Tokens updated.");
  } catch (error) {
    tokens = null;
    throw handleApiError(error);
  }
};

// Refreshes expired access tokens using refresh token
export const refreshTokens = async (): Promise<void> => {
  if (!tokens?.refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      {
        headers: { Authorization: `Bearer ${tokens.refreshToken}` },
      }
    );

    tokens = {
      accessToken: response.data.payload.accessToken,
      refreshToken: response.data.payload.refreshToken,
    };

    console.log("Tokens refreshed successfully.");
  } catch (error) {
    tokens = null;
    throw handleApiError(error);
  }
};

// Retrieves list of devices associated with the user
export const fetchUserDevices = async (): Promise<any[]> => {
  if (!tokens?.accessToken) {
    await login();
  }

  try {
    const response = await axios.get(`${API_URL}/user-device`, {
      headers: { Authorization: `Bearer ${tokens!.accessToken}` },
    });

    return response.data.payload; // User devices
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshTokens();
      return await fetchUserDevices(); // retry
    }

    throw handleApiError(error);
  }
};

// Updates device status (block/unblock) on the server
export const updateDeviceStatus = async (currentStatus: string): Promise<void> => {
  if (!tokens?.accessToken) {
    throw new Error("No access token available");
  }

  const isBlocked = currentStatus === "BLOCKED";
  const endpoint = `${API_URL}/tcp-device/${DEVICE_ID}/${isBlocked ? "unblock" : "block"}`;

  try {
    await axios.put(
      endpoint,
      {},
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      }
    );
    console.log(`Device status updated to ${isBlocked ? "UNBLOCKED" : "BLOCKED"}`);
  } catch (error: any) {
    if (error?.response?.status === 401 && tokens?.refreshToken) {
      await refreshTokens();
      return await updateDeviceStatus(currentStatus); // Retry
    }

    throw handleApiError(error);
  }
};
