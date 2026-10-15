import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MapView, { Marker } from 'react-native-maps';

import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;
  const { acceptDuty, linkedAccounts, canLinkMoreAccounts } = useApp();
  const [isApplying, setIsApplying] = useState(false);

  const isLinked = linkedAccounts.some(a => a.serviceId === job.service.toLowerCase().replace(' ', ''));

  const handleApply = async () => {
    if (!isLinked) {
      Alert.alert(
        'Account Required',
        `You need to link your ${job.service} account to accept this job.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Link Account',
            onPress: () => navigation.navigate('AccountLinking'),
          },
        ]
      );
      return;
    }

    setIsApplying(true);

    // Simulate API call
    setTimeout(() => {
      acceptDuty(job);
      setIsApplying(false);
      Alert.alert(
        'Success!',
        'You\'ve successfully accepted this duty.',
        [
          {
            text: 'View My Duties',
            onPress: () => navigation.navigate('MyDuties'),
          },
          {
            text: 'Keep Browsing',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={colors.gradients.header}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={[styles.serviceBadge, { backgroundColor: job.serviceColor }]}>
            <Text style={styles.serviceText}>{job.service}</Text>
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.zipCode}>{job.zipCode}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon name="cash-outline" size={24} color={colors.secondary.green} />
              <Text style={styles.statValue}>{job.estimatedPay}</Text>
              <Text style={styles.statLabel}>Estimated Pay</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="time-outline" size={24} color={colors.primary.lavender} />
              <Text style={styles.statValue}>{job.timeEstimate}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="location-outline" size={24} color={colors.brands.rover} />
              <Text style={styles.statValue}>{job.distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.detailCard}>
            <Text style={styles.detailText}>{job.details}</Text>
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirementsCard}>
            <RequirementItem text="Valid driver's license" />
            <RequirementItem text="Reliable transportation" />
            <RequirementItem text="Smartphone with data plan" />
            <RequirementItem text="Ability to lift 25+ lbs" />
          </View>
        </View>

        {/* Map Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 37.7749,
                longitude: -122.4194,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{ latitude: 37.7749, longitude: -122.4194 }}
                title={job.title}
                description={job.service}
              />
            </MapView>
          </View>
        </View>

        {/* Account Status */}
        {!isLinked && (
          <View style={styles.warningCard}>
            <Icon name="alert-circle" size={24} color={colors.status.warning} />
            <Text style={styles.warningText}>
              You need to link your {job.service} account to accept this job
            </Text>
            <TouchableOpacity
              style={styles.linkAccountButton}
              onPress={() => navigation.navigate('AccountLinking')}
            >
              <Text style={styles.linkAccountText}>Link Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Apply Button */}
        <TouchableOpacity
          style={[styles.applyButton, !isLinked && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={isApplying || !isLinked}
        >
          <LinearGradient
            colors={isLinked ? colors.gradients.primary : ['#CCC', '#999']}
            style={styles.applyGradient}
          >
            {isApplying ? (
              <Text style={styles.applyText}>Processing...</Text>
            ) : (
              <>
                <Icon name="checkmark-circle" size={24} color={colors.text.inverse} />
                <Text style={styles.applyText}>Accept This Duty</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Posted Info */}
        <Text style={styles.postedInfo}>
          Posted {job.postedAt} • Job ID: {job.id}
        </Text>
      </View>
    </ScrollView>
  );
}

function RequirementItem({ text }) {
  return (
    <View style={styles.requirementItem}>
      <Icon name="checkmark-circle" size={20} color={colors.secondary.green} />
      <Text style={styles.requirementText}>{text}</Text>
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
    paddingTop: spacing.xxl,
  },
  headerContent: {
    alignItems: 'center',
  },
  serviceBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  serviceText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 14,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.inverse,
    textAlign: 'center',
  },
  zipCode: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  statsCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: -spacing.xl,
    ...shadows.large,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.background.tertiary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  detailCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  requirementsCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  mapContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  map: {
    height: 200,
  },
  warningCard: {
    backgroundColor: colors.secondary.greenPale,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
  warningText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  linkAccountButton: {
    backgroundColor: colors.status.warning,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  linkAccountText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  applyButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  applyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  postedInfo: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});

export default JobDetailScreen;
