import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

type Profile = {
  id: string;
  full_name: string;
  email: string;
};

type Subscription = {
  status: string;
  valid_until: string;
  amount_paid: number;
};

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
    fetchSubscription();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile(data);
          setFullName(data.full_name);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is empty result
        if (data) {
          setSubscription(data);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!profile) return;

      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, full_name: fullName });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return 'No active subscription';
    if (subscription.status === 'active') {
      const validUntil = new Date(subscription.valid_until);
      if (validUntil > new Date()) {
        return `Active until ${validUntil.toLocaleDateString()}`;
      }
      return 'Expired';
    }
    return subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Personal Information',
      description: 'Update your profile details',
      action: () => setEditing(true),
    },
    {
      icon: 'card-outline',
      title: 'Subscription',
      description: subscription ? `Valid until ${new Date(subscription.valid_until).toLocaleDateString()}` : 'No active subscription',
      action: () => Alert.alert('Subscription', 'Manage your subscription here'),
    },
    {
      icon: 'moon-outline',
      title: 'Dark Mode',
      description: 'Toggle dark/light theme',
      toggle: true,
    },
    {
      icon: 'shield-outline',
      title: 'Privacy Settings',
      description: 'Manage your privacy preferences',
      action: () => Alert.alert('Privacy', 'Privacy settings will be available soon'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      description: 'Get help with your account',
      action: () => Alert.alert('Support', 'Contact support at support@courseapp.com'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        {/* Profile Header */}
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={styles.profileImageContainer}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
        </View>

        {/* Edit Profile Section */}
        {editing ? (
          <View style={[styles.editContainer, { backgroundColor: theme.card }]}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor={theme.secondary}
            />
            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setEditing(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleUpdateProfile}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Menu Items */
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { backgroundColor: theme.card }]}
                onPress={item.action}
                disabled={item.toggle}
              >
                <View style={styles.menuItemContent}>
                  <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
                    <Ionicons name={item.icon as any} size={24} color={theme.primary} />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuItemTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.menuItemDescription, { color: theme.secondary }]}>
                      {item.description}
                    </Text>
                  </View>
                  {item.toggle ? (
                    <Switch
                      value={isDarkMode}
                      onValueChange={toggleTheme}
                      trackColor={{ false: '#ddd', true: `${theme.primary}80` }}
                      thumbColor={isDarkMode ? theme.primary : '#f4f3f4'}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.error }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={[styles.version, { color: theme.secondary }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#dc2626',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 15,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  version: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    fontSize: 12,
  },
});