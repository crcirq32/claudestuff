import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import { colors, spacing, borderRadius, shadows } from '../theme/colors';

// Generate mock jobs
const generateJobs = () => {
  const services = [
    { name: 'Instacart', color: '#FF8200', pay: '$18-28', time: '1-2 hrs' },
    { name: 'DoorDash', color: '#FF3008', pay: '$15-22', time: '1-3 hrs' },
    { name: 'Uber Eats', color: '#06C167', pay: '$16-25', time: '2-4 hrs' },
    { name: 'Rover', color: '#00B4D8', pay: '$20-35', time: '30-60 min' },
    { name: 'TaskRabbit', color: '#1A8CFF', pay: '$45-80', time: '2-3 hrs' },
  ];

  const titles = {
    'Instacart': ['Grocery Shopping', 'Costco Run', 'Pharmacy Pickup'],
    'DoorDash': ['Restaurant Delivery', 'Fast Food Run', 'Coffee Delivery'],
    'Uber Eats': ['Food Delivery', 'Grocery Drop-off', 'Convenience Store'],
    'Rover': ['Dog Walking', 'Pet Sitting', 'Drop-in Visit'],
    'TaskRabbit': ['Furniture Assembly', 'Mounting TV', 'Moving Help'],
  };

  const distances = ['0.3 mi', '0.8 mi', '1.2 mi', '1.5 mi', '2.1 mi', '2.8 mi'];

  return Array.from({ length: 15 }, (_, i) => {
    const service = services[i % services.length];
    const serviceTitles = titles[service.name] || ['Gig Available'];
    return {
      id: `job-${i}`,
      service: service.name,
      serviceColor: service.color,
      title: serviceTitles[Math.floor(Math.random() * serviceTitles.length)],
      distance: distances[i % distances.length],
      estimatedPay: service.pay,
      timeEstimate: service.time,
      urgency: Math.random() > 0.8 ? 'high' : 'normal',
      postedAt: `${Math.floor(Math.random() * 59) + 1} min ago`,
    };
  });
};

function JobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    setJobs(generateJobs());
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadJobs();
      setRefreshing(false);
    }, 1000);
  };

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(j => {
    if (filter === 'delivery') return ['Instacart', 'DoorDash', 'Uber Eats'].includes(j.service);
    if (filter === 'pet') return j.service === 'Rover';
    if (filter === 'tasks') return ['TaskRabbit', 'Handy'].includes(j.service);
    return true;
  });

  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { job: item })}
    >
      <View style={styles.jobHeader}>
        <View style={[styles.serviceBadge, { backgroundColor: item.serviceColor }]}>
          <Text style={styles.serviceText}>{item.service}</Text>
        </View>
        {item.urgency === 'high' && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
      </View>

      <Text style={styles.jobTitle}>{item.title}</Text>

      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <Icon name="location" size={16} color={colors.primary.lavender} />
          <Text style={styles.detailText}>{item.distance} away</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="time" size={16} color={colors.secondary.green} />
          <Text style={styles.detailText}>{item.timeEstimate}</Text>
        </View>
      </View>

      <View style={styles.jobFooter}>
        <View>
          <Text style={styles.estimatedLabel}>Estimated Pay</Text>
          <Text style={styles.estimatedPay}>{item.estimatedPay}</Text>
        </View>
        <Text style={styles.postedTime}>{item.postedAt}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradients.header} style={styles.header}>
        <Text style={styles.headerTitle}>Available Jobs</Text>
        <Text style={styles.headerSubtitle}>Find your next gig</Text>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={[
            { key: 'all', label: 'All' },
            { key: 'delivery', label: 'Delivery' },
            { key: 'pet', label: 'Pet Care' },
            { key: 'tasks', label: 'Tasks' },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterButton, filter === item.key && styles.filterActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.key}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filteredJobs}
        renderItem={renderJobItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.jobList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
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
  filterContainer: {
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.primary,
  },
  filterActive: {
    backgroundColor: colors.primary.lavender,
  },
  filterText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  jobList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  jobCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  jobHeader: {
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
  urgentBadge: {
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  urgentText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  jobDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
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
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
    paddingTop: spacing.sm,
  },
  estimatedLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  estimatedPay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary.green,
  },
  postedTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});

export default JobsScreen;
