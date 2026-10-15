import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import { colors, spacing, borderRadius, shadows } from '../theme/colors';

function WelcomeScreen({ navigation }) {
  const services = [
    { name: 'Instacart', icon: 'cart', color: colors.brands.instacart },
    { name: 'DoorDash', icon: 'fast-food', color: colors.brands.doordash },
    { name: 'Uber Eats', icon: 'bicycle', color: colors.brands.ubereats },
    { name: 'Rover', icon: 'paw', color: colors.brands.rover },
    { name: 'Wyzant', icon: 'school', color: colors.brands.wyzant },
    { name: 'TaskRabbit', icon: 'construct', color: colors.brands.taskrabbit },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={colors.gradients.header}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Icon name="briefcase" size={40} color={colors.text.inverse} />
          </View>
          <Text style={styles.appName}>JobSource</Text>
          <Text style={styles.tagline}>All your gig work, one app</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Supported Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Platforms</Text>
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <View key={index} style={styles.serviceBadge}>
                <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                  <Icon name={service.icon} size={20} color={colors.text.inverse} />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          <View style={styles.featuresList}>
            <FeatureItem
              icon="location"
              title="Find Nearby Jobs"
              description="See available gigs by distance from your location"
            />
            <FeatureItem
              icon="cash"
              title="Earnings Estimates"
              description="Know what you'll make before accepting"
            />
            <FeatureItem
              icon="grid"
              title="One Dashboard"
              description="All your duties from different platforms in one place"
            />
            <FeatureItem
              icon="map"
              title="Smart Routing"
              description="Optimize your route between multiple jobs"
            />
          </View>
        </View>

        {/* Pricing Info */}
        <View style={styles.pricingCard}>
          <LinearGradient
            colors={colors.gradients.secondary}
            style={styles.pricingGradient}
          >
            <Text style={styles.pricingTitle}>Simple Pricing</Text>
            <View style={styles.pricingRow}>
              <View style={styles.pricingItem}>
                <Text style={styles.pricingNumber}>1st</Text>
                <Text style={styles.pricingLabel}>Account</Text>
                <Text style={styles.pricingValue}>FREE</Text>
              </View>
              <View style={styles.pricingDivider} />
              <View style={styles.pricingItem}>
                <Text style={styles.pricingNumber}>+</Text>
                <Text style={styles.pricingLabel}>Additional</Text>
                <Text style={styles.pricingValue}>$0.99</Text>
              </View>
            </View>
            <Text style={styles.pricingNote}>
              A portion supports the platforms you love
            </Text>
          </LinearGradient>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('ZipCodeSearch')}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.browseGradient}
            >
              <Icon name="search" size={20} color={colors.text.inverse} />
              <Text style={styles.browseButtonText}>Browse Jobs by Zip Code</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          No account required to browse jobs in your area
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Icon name={icon} size={24} color={colors.primary.lavender} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
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
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  tagline: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceBadge: {
    width: '30%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  serviceName: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.lavenderPale,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  pricingCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  pricingGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginBottom: spacing.md,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pricingItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  pricingNumber: {
    fontSize: 14,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  pricingLabel: {
    fontSize: 14,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  pricingValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginTop: spacing.xs,
  },
  pricingDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.text.inverse,
    opacity: 0.3,
  },
  pricingNote: {
    fontSize: 12,
    color: colors.text.inverse,
    opacity: 0.8,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  browseButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  browseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.text.tertiary,
    marginVertical: spacing.md,
  },
  getStartedButton: {
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.secondary.green,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary.green,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
});

export default WelcomeScreen;
