import axios from 'axios';
import { User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface LoginResponse {
  token: string;
  user: User;
}

class AuthService {
  private baseURL = `${API_BASE_URL}/auth`;

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    departmentId: number;
    roleId: number;
  }): Promise<{ message: string; userId: number }> {
    try {
      const response = await axios.post(`${this.baseURL}/register`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const response = await axios.get(`${this.baseURL}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Token verification failed');
    }
  }

  async refreshToken(token: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/refresh`, { token });
      return response.data.token;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Token refresh failed');
    }
  }

  async resetPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/reset-password`, { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Password reset failed');
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    token: string
  ): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Password change failed');
    }
  }
}

export const authService = new AuthService();