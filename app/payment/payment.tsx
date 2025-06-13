import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '299',
    duration: '1 Month',
    features: [
      'Access to all basic courses',
      'Course completion certificates',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '799',
    duration: '3 Months',
    features: [
      'Access to all courses',
      'Premium certificates',
      'Priority support',
      'Downloadable resources',
      'Live Q&A sessions',
    ],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: '1499',
    duration: '6 Months',
    features: [
      'Everything in Pro plan',
      '1-on-1 mentoring sessions',
      'Career guidance',
      'Project reviews',
      'Interview preparation',
    ],
  },
];

export default function Payment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const { theme } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const UPI_ID = "vivekvenom138@oksbi";

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleUPIPayment = async () => {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Course Access&am=${selectedPlan.price}&cu=INR&tn=Course Subscription - ${selectedPlan.name}`;
    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert("Error", "UPI payment not supported on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open UPI payment");
    }
  };

  const handleCardPayment = async () => {
    if (!validateCard()) return;

    setLoading(true);
    try {
      // Simulated card payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await handlePaymentSuccess();
      Alert.alert(
        "Payment Successful", 
        "Your subscription has been activated!",
        [{ text: "OK", onPress: () => router.push('/course/dashboard') }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert("Error", "Please enter a valid card number");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      Alert.alert("Error", "Please enter a valid expiry date (MM/YY)");
      return false;
    }
    if (cvv.length !== 3) {
      Alert.alert("Error", "Please enter a valid CVV");
      return false;
    }
    if (!cardName.trim()) {
      Alert.alert("Error", "Please enter the cardholder's name");
      return false;
    }
    return true;
  };

  const handlePaymentSuccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: user.id,
            status: 'active',
            plan_id: selectedPlan.id,
            amount_paid: parseFloat(selectedPlan.price),
            valid_until: new Date(Date.now() + getDurationInDays(selectedPlan.duration) * 24 * 60 * 60 * 1000).toISOString(),
          }
        ]);

      if (error) throw error;
    } catch (error: any) {
      throw new Error('Failed to update subscription status');
    }
  };

  const getDurationInDays = (duration: string) => {
    const [amount, unit] = duration.split(' ');
    return unit.toLowerCase() === 'month' || unit.toLowerCase() === 'months'
      ? parseInt(amount) * 30
      : 0;
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.card }]} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Choose Your Plan</Text>
            <Text style={[styles.subtitle, { color: theme.secondary }]}>
              Select the perfect plan for your learning journey
            </Text>
          </View>

          {/* Subscription Plans */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plansContainer}
          >
            {SUBSCRIPTION_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  { backgroundColor: theme.card },
                  selectedPlan.id === plan.id && styles.selectedPlan,
                  plan.recommended && styles.recommendedPlan,
                ]}
                onPress={() => setSelectedPlan(plan)}
              >
                {plan.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Best Value</Text>
                  </View>
                )}
                <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                <Text style={[styles.planDuration, { color: theme.secondary }]}>
                  {plan.duration}
                </Text>
                <Text style={styles.planPrice}>
                  ₹{plan.price}
                  <Text style={[styles.planPriceDetail, { color: theme.secondary }]}>
                    /{plan.duration.toLowerCase()}
                  </Text>
                </Text>
                <View style={styles.featuresList}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color="#10b981" 
                      />
                      <Text style={[styles.featureText, { color: theme.text }]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Payment Methods */}
          <View style={styles.paymentSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Select Payment Method
            </Text>
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  { backgroundColor: theme.card },
                  paymentMethod === 'upi' && styles.selectedPaymentMethod,
                ]}
                onPress={() => setPaymentMethod('upi')}
              >
                <Image
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png' }}
                  style={styles.paymentIcon}
                />
                <Text style={[styles.paymentMethodText, { color: theme.text }]}>UPI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  { backgroundColor: theme.card },
                  paymentMethod === 'card' && styles.selectedPaymentMethod,
                ]}
                onPress={() => setPaymentMethod('card')}
              >
                <Ionicons name="card-outline" size={24} color={theme.text} />
                <Text style={[styles.paymentMethodText, { color: theme.text }]}>Card</Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === 'upi' && (
              <View style={[styles.upiContainer, { backgroundColor: theme.card }]}>
                <QRCode
                  value={`upi://pay?pa=${UPI_ID}&pn=Course Access&am=${selectedPlan.price}&cu=INR`}
                  size={200}
                />
                <Text style={[styles.upiId, { color: theme.text }]}>{UPI_ID}</Text>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={handleUPIPayment}
                >
                  <Text style={styles.payButtonText}>Pay with UPI App</Text>
                </TouchableOpacity>
              </View>
            )}

            {paymentMethod === 'card' && (
              <View style={[styles.cardContainer, { backgroundColor: theme.card }]}>
                <View style={styles.cardField}>
                  <Text style={[styles.cardLabel, { color: theme.text }]}>Card Number</Text>
                  <TextInput
                    style={[styles.cardInput, { color: theme.text }]}
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={theme.secondary}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View style={styles.cardRow}>
                  <View style={[styles.cardField, { flex: 1, marginRight: 10 }]}>
                    <Text style={[styles.cardLabel, { color: theme.text }]}>Expiry Date</Text>
                    <TextInput
                      style={[styles.cardInput, { color: theme.text }]}
                      value={expiryDate}
                      onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                      placeholder="MM/YY"
                      placeholderTextColor={theme.secondary}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>

                  <View style={[styles.cardField, { flex: 1 }]}>
                    <Text style={[styles.cardLabel, { color: theme.text }]}>CVV</Text>
                    <TextInput
                      style={[styles.cardInput, { color: theme.text }]}
                      value={cvv}
                      onChangeText={setCvv}
                      placeholder="123"
                      placeholderTextColor={theme.secondary}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.cardField}>
                  <Text style={[styles.cardLabel, { color: theme.text }]}>Cardholder Name</Text>
                  <TextInput
                    style={[styles.cardInput, { color: theme.text }]}
                    value={cardName}
                    onChangeText={setCardName}
                    placeholder="JOHN DOE"
                    placeholderTextColor={theme.secondary}
                    autoCapitalize="characters"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.payButton, loading && styles.payButtonDisabled]}
                  onPress={handleCardPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="refresh" size={24} color="#fff" style={styles.loadingIcon} />
                      <Text style={styles.payButtonText}>Processing...</Text>
                    </View>
                  ) : (
                    <Text style={styles.payButtonText}>Pay ₹{selectedPlan.price}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.securePayment}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" />
            <Text style={[styles.secureText, { color: theme.secondary }]}>
              Secure Payment | 256-bit SSL Encryption
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  plansContainer: {
    paddingBottom: 20,
  },
  planCard: {
    width: width * 0.75,
    padding: 20,
    borderRadius: 20,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  selectedPlan: {
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  recommendedPlan: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 14,
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 16,
  },
  planPriceDetail: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  featuresList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
  },
  paymentSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  paymentMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  selectedPaymentMethod: {
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  paymentIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  upiContainer: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  upiId: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    padding: 20,
    borderRadius: 20,
  },
  cardField: {
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  securePayment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  secureText: {
    marginLeft: 8,
    fontSize: 14,
  },
});