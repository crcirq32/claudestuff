import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

function AccountLinkingScreen({ navigation }) {
  const { linkedAccounts, linkAccount, unlinkAccount, canLinkMoreAccounts } = useApp();
  const [linkingInProgress, setLinkingInProgress] = useState(null);

  const handleLink = async (service) => {
    const isAlreadyLinked = linkedAccounts.some(a => a.serviceId === service.id);

    if (isAlreadyLinked) {
      Alert.alert(
        'Already Linked',
        `Your ${service.name} account is already linked.`,
        [
          { text: 'OK' },
          {
            text: 'Unlink',
            style: 'destructive',
            onPress: () => handleUnlink(service),
          },
        ]
      );
      return;
    }

    const isFirstFree = linkedAccounts.length === 0;

    if (!isFirstFree) {
      Alert.alert(
        'Additional Account',
        `Linking ${service.name} costs $0.99. Proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue ($0.99)',
            onPress: () => {
              navigation.navigate('Payment', { service });
            },
          },
        ]
      );
      return;
    }

    setLinkingInProgress(service.id);

    // Simulate OAuth flow
    setTimeout(() => {
      linkAccount(service.id);
      setLinkingInProgress(null);
      Alert.alert(
        'Success!',
        `Your ${service.name} account has been linked successfully.`,
        [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  const handleUnlink = (service) => {
    const account = linkedAccounts.find(a => a.serviceId === service.id);
    if (account) {
      unlinkAccount(account.id);
    }
  };

  const services = [
    {
      id: 'instacart',
      name: 'Instacart',
      description: 'Shop and deliver groceries',
      color: colors.brands.instacart,
      icon: 'cart',
    },
    {
      id: 'doordash',
      name: 'DoorDash',
      description: 'Food delivery from restaurants',
      color: colors.brands.doordash,
      icon: 'fast-food',
    },
    {
      id: 'ubereats',
      name: 'Uber Eats',
      description: 'Food and grocery delivery',
      color: colors.brands.ubereats,
      icon: 'bicycle',
    },
    {
      id: 'rover',
      name: 'Rover',
      description: 'Dog walking and pet sitting',
      color: colors.brands.rover,
      icon: 'paw',
    },
    {
      id: 'wyzant',
      name: 'Wyzant',
      description: 'Tutoring and teaching',
      color: colors.brands.wyzant,
      icon: 'school',
    },
    {
      id: 'taskrabbit',
      name: 'TaskRabbit',
      description: 'Tasks and handyman work',
      color: colors.brands.taskrabbit,
      icon: 'construct',
    },
    {
      id: 'handy',
      name: 'Handy',
      description: 'Home cleaning and services',
      color: colors.brands.handy,
      icon: 'home',
    },
    {
      id: 'thumbtack',
      name: 'Thumbtack Pro',
      description: 'Professional services',
      color: colors.brands.thumbtack,
      icon: 'business',
    },
  ];

  const renderService = ({ item }) => {
    const isLinked = linkedAccounts.some(a => a.serviceId === item.id);
    const isLinking = linkingInProgress === item.id;

    return (
      <View style={styles.serviceCard}>
        <View style={[styles.serviceIcon, { backgroundColor: `${item.color}20` }]}>
          <Icon name={item.icon} size={32} color={item.color} />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceDescription}>{item.description}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.linkButton,
            isLinked && styles.linkedButton,
          ]}
          onPress={() => handleLink(item)}
          disabled={isLinking}
        >
          {isLinking ? (
            <Text style={styles.linkButtonText}>Linking...</Text>
          ) : (
            <>
              <Icon
                name={isLinked ? 'checkmark' : 'add'}
                size={20}
                color={isLinked ? colors.status.success : colors.text.inverse}
              />
              <Text
                style={[
                  styles.linkButtonText,
                  isLinked && styles.linkedButtonText,
                ]}
              >
                {isLinked ? 'Linked' : 'Link'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradients.header}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Link Your Accounts</Text>
        <Text style={styles.headerSubtitle}>Connect your gig economy accounts</Text>
      </LinearGradient>

      {/* Pricing Banner */}
      <View style={styles.pricingBanner}>
        <LinearGradient
          colors={colors.gradients.secondary}
          style={styles.pricingGradient}
        >
          <View style={styles.pricingRow}>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingNumber}>{linkedAccounts.length}</Text>
              <Text style={styles.pricingLabel}>Linked</Text>
            </View>
            <View style={styles.pricingDivider} />
            <View style={styles.pricingItem}>
              <Text style={styles.pricingNumber}>Free</Text>
              <Text style={styles.pricingLabel}>First Account</Text>
            </View>
            <View style={styles.pricingDivider} />
            <View style={styles.pricingItem}>
              <Text style={styles.pricingNumber}>$0.99</Text>
              <Text style={styles.pricingLabel}>Additional</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {linkedAccounts.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {linkedAccounts.length} account{linkedAccounts.length !== 1 ? 's' : ''} linked
          </Text>
        </View>
      )}
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
  pricingBanner: {
    margin: spacing.md,
    marginTop: -spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  pricingGradient: {
    padding: spacing.md,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  pricingItem: {
    alignItems: 'center',
  },
  pricingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  pricingLabel: {
    fontSize: 12,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  pricingDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.text.inverse,
    opacity: 0.3,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  serviceDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.lavender,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  linkedButton: {
    backgroundColor: colors.secondary.greenPale,
  },
  linkButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  linkedButtonText: {
    color: colors.status.success,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default AccountLinkingScreen;
