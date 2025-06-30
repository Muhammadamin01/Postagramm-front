import axios from 'axios';

const API_URL = 'https://postagramm-backend.onrender.com/api';

export const getNotifications = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/notifications/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const readNotification = async (id, token) => {
  try {
    const response = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteNotification = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteAllNotifications = async (userId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/notifications/all/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (err) {
    throw err;
  }
};