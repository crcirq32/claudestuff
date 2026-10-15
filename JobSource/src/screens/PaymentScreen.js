import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

function PaymentScreen({ route, navigation }) {
  const { service } = route.params || {};
  const { linkAccount } = useApp();
  const [processing, setProcessing] = useState(false);

  const handlePurchase = async () => {
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      if (service) {
        linkAccount(service.id);
      }
      Alert.alert(
        'Payment Successful!',
        `You've purchased access to ${service?.name || 'additional account'}.`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradients.header} style={styles.header}>
        <Text style={styles.headerTitle}>Add Account</Text>
        <Text style={styles.headerSubtitle}>Unlock more opportunities</Text>
      </LinearGradient>

      <View style={styles.content}>
        <LinearGradient colors={colors.gradients.secondary} style={styles.priceCard}>
          <Text style={styles.priceLabel}>Additional Account</Text>
          <Text style={styles.price}>$0.99</Text>
          <Text style={styles.priceNote}>One-time purchase</Text>
        </LinearGradient>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>What you get:</Text>
          <View style={styles.benefitItem}>
            <Icon name="checkmark-circle" size={20} color={colors.secondary.green} />
            <Text style={styles.benefitText}>Access to {service?.name || 'service'} jobs</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="checkmark-circle" size={20} color={colors.secondary.green} />
            <Text style={styles.benefitText}>Real-time job notifications</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="checkmark-circle" size={20} color={colors.secondary.green} />
            <Text style={styles.benefitText}>Earnings tracking</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="heart" size={20} color={colors.status.error} />
            <Text style={styles.benefitText}>Supports {service?.name || 'the platform'} (portion goes to them)</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePurchase}
          disabled={processing}
        >
          <LinearGradient colors={colors.gradients.primary} style={styles.payGradient}>
            {processing ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <>
                <Icon name="card" size={20} color={colors.text.inverse} />
                <Text style={styles.payButtonText}>Pay $0.99</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          <Icon name="lock-closed" size={12} color={colors.text.tertiary} /> Secure payment processing
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  priceCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  priceLabel: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginVertical: spacing.sm,
  },
  priceNote: {
    fontSize: 14,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  benefitsCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  payButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  securityNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.text.tertiary,
  },
});

export default PaymentScreen;
