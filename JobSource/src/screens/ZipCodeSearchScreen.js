import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import { colors, spacing, borderRadius, shadows } from '../theme/colors';

// Mock job data - in real app, this comes from APIs
const generateMockJobs = (zipCode) => {
  const services = [
    { name: 'Instacart', color: '#FF8200', pay: '$18-28', time: '1-2 hrs' },
    { name: 'DoorDash', color: '#FF3008', pay: '$15-22', time: '1-3 hrs' },
    { name: 'Uber Eats', color: '#06C167', pay: '$16-25', time: '2-4 hrs' },
    { name: 'Rover', color: '#00B4D8', pay: '$20-35', time: '30-60 min' },
    { name: 'TaskRabbit', color: '#1A8CFF', pay: '$45-80', time: '2-3 hrs' },
    { name: 'Handy', color: '#FF6B6B', pay: '$35-60', time: '1-2 hrs' },
  ];

  const distances = ['0.3 mi', '0.8 mi', '1.2 mi', '1.5 mi', '2.1 mi', '2.8 mi'];

  return services.map((service, index) => ({
    id: `${zipCode}-${index}`,
    service: service.name,
    serviceColor: service.color,
    title: getJobTitle(service.name),
    distance: distances[index % distances.length],
    estimatedPay: service.pay,
    timeEstimate: service.time,
    zipCode,
    urgency: Math.random() > 0.7 ? 'high' : 'normal',
    postedAt: `${Math.floor(Math.random() * 59) + 1} min ago`,
    details: getJobDetails(service.name),
  }));
};

const getJobTitle = (service) => {
  const titles = {
    'Instacart': ['Grocery Shopping', 'Costco Run', 'Pharmacy Pickup', 'Pet Supplies'],
    'DoorDash': ['Restaurant Delivery', 'Fast Food Run', 'Coffee Delivery', 'Catering Order'],
    'Uber Eats': ['Food Delivery', 'Grocery Drop-off', 'Convenience Store', 'Pharmacy Delivery'],
    'Rover': ['Dog Walking', 'Pet Sitting', 'Drop-in Visit', 'Overnight Care'],
    'TaskRabbit': ['Furniture Assembly', 'Mounting TV', 'Moving Help', 'Handyman Work'],
    'Handy': ['House Cleaning', 'Furniture Assembly', 'TV Mounting', 'Picture Hanging'],
  };
  const options = titles[service] || ['Gig Available'];
  return options[Math.floor(Math.random() * options.length)];
};

const getJobDetails = (service) => {
  const details = {
    'Instacart': 'Shop for groceries and deliver to customer.\n• Use insulated bags\n• Communicate substitutions\n• Handle with care',
    'DoorDash': 'Pick up food orders and deliver to customers.\n• Check order accuracy\n• Use hot bag\n• Follow delivery instructions',
    'Uber Eats': 'Deliver food from restaurants to customers.\n• Pick up on time\n• Maintain food temperature\n• Professional service',
    'Rover': 'Care for pets while owners are away.\n• Send photo updates\n• Follow care instructions\n• Reliable and loving',
    'TaskRabbit': 'Help clients with various tasks.\n• Bring your own tools\n• Professional service\n• Clean up after',
    'Handy': 'Provide home services.\n• Professional quality\n• Own transportation\n• Background check required',
  };
  return details[service] || 'Complete assigned tasks professionally and on time.';
};

function ZipCodeSearchScreen({ navigation }) {
  const [zipCode, setZipCode] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Simulate API call
    setTimeout(() => {
      const mockJobs = generateMockJobs(zipCode);
      setJobs(mockJobs);
      setLoading(false);
    }, 800);
  };

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <LinearGradient
          colors={colors.gradients.header}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Browse Jobs</Text>
          <Text style={styles.headerSubtitle}>See what's available in your area</Text>
        </LinearGradient>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="location-outline" size={24} color={colors.primary.lavender} />
            <TextInput
              style={styles.input}
              placeholder="Enter ZIP code"
              placeholderTextColor={colors.text.tertiary}
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              maxLength={5}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {zipCode.length > 0 && (
              <TouchableOpacity onPress={() => setZipCode('')}>
                <Icon name="close-circle" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.searchButton,
              zipCode.length !== 5 && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={zipCode.length !== 5}
          >
            <LinearGradient
              colors={zipCode.length === 5 ? colors.gradients.primary : ['#CCC', '#999']}
              style={styles.searchGradient}
            >
              <Icon name="search" size={20} color={colors.text.inverse} />
              <Text style={styles.searchButtonText}>Search</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.lavender} />
            <Text style={styles.loadingText}>Finding jobs near you...&lt;/Text>
          </View>
        ) : hasSearched ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {jobs.length} jobs found near {zipCode}
              </Text>
            </View>
            <FlatList
              data={jobs}
              renderItem={renderJobItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.jobList}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="search" size={60} color={colors.primary.lavenderPale} />
            </View>
            <Text style={styles.emptyTitle}>Enter a ZIP code</Text>
            <Text style={styles.emptyText}>
              See available jobs in your area without creating an account
            </Text>
            <TouchableOpacity
              style={styles.guestBrowseButton}
              onPress={() => {
                setZipCode('90210');
                setTimeout(handleSearch, 100);
              }}
            >
              <Text style={styles.guestBrowseText}>Try Beverly Hills (90210)</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
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
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.background.card,
    ...shadows.small,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary.lavenderPale,
  },
  input: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  searchButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary,
  },
  resultsHeader: {
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  jobList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  jobCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  guestBrowseButton: {
    borderWidth: 2,
    borderColor: colors.primary.lavender,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  guestBrowseText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.lavender,
  },
});

export default ZipCodeSearchScreen;
