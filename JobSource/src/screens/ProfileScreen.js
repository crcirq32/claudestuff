import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

function ProfileScreen({ navigation }) {
  const { linkedAccounts, myDuties } = useApp();

  const menuItems = [
    {
      icon: 'link',
      label: 'Linked Accounts',
      value: `${linkedAccounts.length} connected`,
      action: () => navigation.navigate('AccountLinking'),
    },
    {
      icon: 'briefcase',
      label: 'My Duties',
      value: `${myDuties.length} total`,
      action: () => navigation.navigate('MyDuties'),
    },
    {
      icon: 'card',
      label: 'Payment Methods',
      value: 'Add cards',
      action: () => {},
    },
    {
      icon: 'notifications',
      label: 'Notifications',
      value: 'On',
      action: () => {},
    },
    {
      icon: 'help-circle',
      label: 'Help & Support',
      value: '',
      action: () => {},
    },
    {
      icon: 'document-text',
      label: 'Terms of Service',
      value: '',
      action: () => {},
    },
    {
      icon: 'shield',
      label: 'Privacy Policy',
      value: '',
      action: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={colors.gradients.header} style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="person" size={50} color={colors.primary.lavender} />
        </View>
        <Text style={styles.name}>Gig Worker</Text>
        <Text style={styles.email}>user@jobsource.app</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{linkedAccounts.length}</Text>
            <Text style={styles.statLabel}>Accounts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myDuties.filter(d => d.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myDuties.filter(d => d.status === 'accepted').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuIcon}>
                <Icon name={item.icon} size={20} color={colors.primary.lavender} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.value ? (
                  <Text style={styles.menuValue}>{item.value}</Text>
                ) : null}
              </View>
              <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>JobSource v1.0.0</Text>
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
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  email: {
    fontSize: 14,
    color: colors.text.inverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.lavender,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  menu: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.lavenderPale,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  menuValue: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing.lg,
  },
});

export default ProfileScreen;
