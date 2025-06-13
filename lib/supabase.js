import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = "https://bmhmqjahtqjfifiopqgp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaG1xamFodHFqZmlmaW9wcWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NDU5NjQsImV4cCI6MjA1NTAyMTk2NH0.jf3z_JnY0QR5nX5820tXw43vB3enw9P4HDn4ywI6sRs";

// Custom storage implementation with error handling
const customStorage = {
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
};

// Create Supabase client with enhanced configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Export Supabase client
export { supabase };

