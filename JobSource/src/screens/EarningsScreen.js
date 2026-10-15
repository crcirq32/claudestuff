import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

function EarningsScreen() {
  const { earnings } = useApp();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={colors.gradients.header} style={styles.header}>
        <Text style={styles.headerTitle}>My Earnings</Text>
        <Text style={styles.headerSubtitle}>Track your income</Text>
      </LinearGradient>

      <View style={styles.content}>
        <LinearGradient colors={colors.gradients.secondary} style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>${earnings.total.toFixed(2)}</Text>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="today" size={24} color={colors.primary.lavender} />
            <Text style={styles.statAmount}>${earnings.today.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="calendar" size={24} color={colors.secondary.green} />
            <Text style={styles.statAmount}>${earnings.week.toFixed(2)}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="monthly" size={24} color={colors.brands.rover} />
            <Text style={styles.statAmount}>${earnings.month.toFixed(2)}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.transactionCard}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  totalCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginTop: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '30%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  transactionCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default EarningsScreen;
