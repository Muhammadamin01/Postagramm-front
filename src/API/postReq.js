import axios from 'axios';

const API_URL = 'https://postagramm-backend.onrender.com/api';

export const getAllPosts = async (token) => {
  return await axios.get(`${API_URL}/post`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const likePost = async (postId, token) => {
  return await axios.put(`${API_URL}/post/like/${postId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const followUser = async (userId, token) => {
  return await axios.post(
    `${API_URL}/user/follow/${userId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};