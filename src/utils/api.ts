import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User APIs
export const userAPI = {
  create: (username: string) => api.post('/user/', { username }),
  get: (username: string) => api.get(`/user/${username}`),
};

// Game APIs
export const gameAPI = {
  updateProgress: (username: string, game: string, level: string, data: any) =>
    api.post(`/game/${username}/${game}/${level}/update`, data),
  completeLevel: (username: string, game: string, level: string) =>
    api.post(`/game/${username}/${game}/complete/${level}`),
};
