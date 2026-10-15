import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

function DashboardScreen({ navigation }) {
  const { earnings, myDuties, linkedAccounts } = useApp();

  const activeDuties = myDuties.filter(d => d.status === 'accepted');
  const completedToday = myDuties.filter(d => {
    if (d.status !== 'completed') return false;
    const completedDate = new Date(d.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      label: "Today's Earnings",
      value: `$${earnings.today.toFixed(2)}`,
      icon: 'cash',
      color: colors.secondary.green,
    },
    {
      label: 'Active Duties',
      value: activeDuties.length.toString(),
      icon: 'briefcase',
      color: colors.primary.lavender,
    },
    {
      label: 'Completed Today',
      value: completedToday.toString(),
      icon: 'checkmark-circle',
      color: colors.accent.gold,
    },
    {
      label: 'Linked Accounts',
      value: linkedAccounts.length.toString(),
      icon: 'link',
      color: colors.brands.rover,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.header}
        style={styles.header}
      >
        <Text style={styles.greeting}>Good afternoon! 👋</Text>
        <Text style={styles.subGreeting}>Ready to find your next gig?</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Icon name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <QuickActionButton
              icon="search"
              label="Find Jobs"
              onPress={() => navigation.navigate('Jobs')}
            />
            <QuickActionButton
              icon="map"
              label="View Map"
              onPress={() => navigation.navigate('Map')}
            />
            <QuickActionButton
              icon="add-circle"
              label="Link Account"
              onPress={() => navigation.navigate('AccountLinking')}
            />
            <QuickActionButton
              icon="list"
              label="My Duties"
              onPress={() => navigation.navigate('MyDuties')}
            />
          </View>
        </View>

        {/* Active Duties */}
        {activeDuties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Duties</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyDuties')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <{activeDuties.slice(0, 3).map((duty) => (
              <TouchableOpacity
                key={duty.id}
                style={styles.dutyCard}
                onPress={() => navigation.navigate('JobDetail', { job: duty })}
              >
                <View style={styles.dutyHeader}>
                  <Text style={styles.dutyTitle}>{duty.title}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                </View>
                <Text style={styles.dutyService}>{duty.service}</Text>
                <View style={styles.dutyFooter}>
                  <Text style={styles.dutyPay}>{duty.estimatedPay}</Text>
                  <Text style={styles.dutyDistance}>{duty.distance}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Linked Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Linked Services</Text>
          <{linkedAccounts.length > 0 ? (
            <View style={styles.servicesList}>
              {linkedAccounts.map((account) => (
                <View key={account.id} style={styles.linkedService}>
                  <View style={[styles.serviceDot, { backgroundColor: account.color }]} />
                  <Text style={styles.linkedServiceName}>{account.name}</Text>
                  <Icon name="checkmark-circle" size={20} color={colors.status.success} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noServices}>
              <Text style={styles.noServicesText}>No accounts linked yet</Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('AccountLinking')}
              >
                <Text style={styles.linkButtonText}>Link Your First Account (Free)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Earnings Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Summary</Text>
          <LinearGradient
            colors={colors.gradients.secondary}
            style={styles.earningsCard}
          >
            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>This Week</Text>
                <Text style={styles.earningsValue}>${earnings.week.toFixed(2)}</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>This Month</Text>
                <Text style={styles.earningsValue}>${earnings.month.toFixed(2)}</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>All Time</Text>
                <Text style={styles.earningsValue}>${earnings.total.toFixed(2)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Icon name={icon} size={24} color={colors.primary.lavender} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary.lavender,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary.lavenderPale,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  dutyCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  dutyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dutyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: colors.status.pending,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  dutyService: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  dutyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dutyPay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary.green,
  },
  dutyDistance: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  servicesList: {
    gap: spacing.sm,
  },
  linkedService: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  serviceDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.round,
    marginRight: spacing.md,
  },
  linkedServiceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  noServices: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  noServicesText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  linkButton: {
    backgroundColor: colors.primary.lavender,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  linkButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  earningsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  earningsItem: {
    alignItems: 'center',
  },
  earningsDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.text.inverse,
    opacity: 0.3,
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.text.inverse,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
});

export default DashboardScreen;
