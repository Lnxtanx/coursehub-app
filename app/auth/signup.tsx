import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [full_name, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const validateStep1 = () => {
    if (!full_name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSignup = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ id: authData.user.id, full_name, email }]);

        if (profileError) throw profileError;

        Alert.alert(
          'Success', 
          'Account created successfully! Please verify your email.',
          [{ text: 'OK', onPress: () => router.push('/auth/login') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'github') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
      });

      if (error) throw error;
      if (data) router.push('/course/dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={full_name}
          onChangeText={setFullName}
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
      </View>

      <TouchableOpacity 
        style={styles.nextButton}
        onPress={handleNextStep}
      >
        <Text style={styles.buttonText}>Next</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#666"
        />
        <TouchableOpacity 
          style={styles.passwordVisibilityButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={20} 
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor="#666"
        />
        <TouchableOpacity 
          style={styles.passwordVisibilityButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons 
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={20} 
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementTitle}>Password must contain:</Text>
        <View style={styles.requirementItem}>
          <Ionicons 
            name={password.length >= 8 ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color={password.length >= 8 ? "#10b981" : "#666"}
          />
          <Text style={styles.requirementText}>At least 8 characters</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setStep(1)}
        >
          <Ionicons name="arrow-back" size={20} color="#0ea5e9" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.signupButton, loading && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="refresh" size={24} color="#fff" style={styles.loadingIcon} />
              <Text style={styles.buttonText}>Creating Account...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Ionicons name="school" size={60} color="#0ea5e9" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your learning journey today</Text>
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity 
            style={[styles.socialButton, styles.githubButton]}
            onPress={() => handleSocialSignup('github')}
          >
            <Ionicons name="logo-github" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Continue with GitHub</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {step === 1 ? renderStep1() : renderStep2()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Log in</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Text style={styles.credit}>Developed by Vivek</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  activeStepLabel: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  stepContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#0f172a',
    fontSize: 16,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    color: '#0f172a',
    fontSize: 16,
  },
  passwordVisibilityButton: {
    padding: 8,
  },
  nextButton: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  passwordRequirements: {
    marginTop: 16,
    marginBottom: 24,
  },
  requirementTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  requirementText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    color: '#0ea5e9',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flex: 1,
    marginLeft: 16,
    alignItems: 'center',
  },
  signupButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748b',
  },
  link: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  credit: {
    textAlign: 'center',
    marginTop: 24,
    color: '#64748b',
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    backgroundColor: '#24292e',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  githubButton: {
    backgroundColor: '#24292e',
  },
  socialButtonText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});