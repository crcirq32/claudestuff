import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

function MyDutiesScreen() {
  const { myDuties, completeDuty, cancelDuty } = useApp();

  const activeDuties = myDuties.filter(d => d.status === 'accepted');
  const completedDuties = myDuties.filter(d => d.status === 'completed');
  const cancelledDuties = myDuties.filter(d => d.status === 'cancelled');

  const renderDutyItem = ({ item }) => {
    const isActive = item.status === 'accepted';

    return (
      <View style={styles.dutyCard}>
        <View style={styles.dutyHeader}>
          <View style={[styles.serviceBadge, { backgroundColor: item.serviceColor }]}>
            <Text style={styles.serviceText}>{item.service}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.dutyTitle}>{item.title}</Text>

        <View style={styles.dutyDetails}>
          <View style={styles.detailRow}>
            <Icon name="location" size={16} color={colors.primary.lavender} />
            <Text style={styles.detailText}>{item.distance}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="cash" size={16} color={colors.secondary.green} />
            <Text style={styles.detailText}>{item.estimatedPay}</Text>
          </View>
        </View>

        {isActive && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => completeDuty(item.id)}
            >
              <LinearGradient
                colors={colors.gradients.secondary}
                style={styles.actionGradient}
              >
                <Icon name="checkmark" size={18} color={colors.text.inverse} />
                <Text style={styles.actionText}>Complete</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelDuty(item.id)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return colors.status.pending;
      case 'completed': return colors.status.success;
      case 'cancelled': return colors.status.error;
      default: return colors.text.tertiary;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradients.header} style={styles.header}>
        <Text style={styles.headerTitle}>My Duties</Text>
        <Text style={styles.headerSubtitle}>Track your accepted jobs</Text>
      </LinearGradient>

      {activeDuties.length === 0 && completedDuties.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="briefcase-outline" size={80} color={colors.primary.lavenderPale} />
          <Text style={styles.emptyTitle}>No duties yet</Text>
          <Text style={styles.emptyText}>Accept jobs from the Jobs tab to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={[...activeDuties, ...completedDuties, ...cancelledDuties]}
          renderItem={renderDutyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
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
    marginBottom: spacing.sm,
  },
  serviceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  serviceText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  dutyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  dutyDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  completeButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  actionText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  cancelText: {
    color: colors.status.error,
    fontWeight: '600',
  },
});

export default MyDutiesScreen;
