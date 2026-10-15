import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const SUPPORTED_SERVICES = [
  {
    id: 'instacart',
    name: 'Instacart',
    category: 'delivery',
    color: '#FF8200',
    icon: 'cart',
    description: 'Grocery shopping and delivery',
    basePay: '$15-25',
    requirements: ['Car or bike', '18+ years', 'Background check'],
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    category: 'delivery',
    color: '#FF3008',
    icon: 'fast-food',
    description: 'Food delivery from restaurants',
    basePay: '$15-25',
    requirements: ['Car, bike, or scooter', '18+ years', 'Driver\'s license'],
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    category: 'delivery',
    color: '#06C167',
    icon: 'bicycle',
    description: 'Food and grocery delivery',
    basePay: '$15-25',
    requirements: ['Car, bike, or scooter', '18+ years', 'Background check'],
  },
  {
    id: 'rover',
    name: 'Rover',
    category: 'pet',
    color: '#00B4D8',
    icon: 'paw',
    description: 'Dog walking and pet sitting',
    basePay: '$15-30',
    requirements: ['Love for pets', '18+ years', 'Background check'],
  },
  {
    id: 'wyzant',
    name: 'Wyzant',
    category: 'education',
    color: '#6B46C1',
    icon: 'school',
    description: 'Tutoring in any subject',
    basePay: '$25-80/hr',
    requirements: ['Subject expertise', '18+ years', 'Background check'],
  },
  {
    id: 'taskrabbit',
    name: 'TaskRabbit',
    category: 'tasks',
    color: '#1A8CFF',
    icon: 'construct',
    description: 'Handyman and task completion',
    basePay: '$20-60/hr',
    requirements: ['Skills/experience', '18+ years', 'Background check'],
  },
  {
    id: 'handy',
    name: 'Handy',
    category: 'home',
    color: '#FF6B6B',
    icon: 'home',
    description: 'Cleaning and home services',
    basePay: '$18-45/hr',
    requirements: ['Experience', '18+ years', 'Background check'],
  },
  {
    id: 'thumbtack',
    name: 'Thumbtack Pro',
    category: 'professional',
    color: '#009FD4',
    icon: 'business',
    description: 'Professional services marketplace',
    basePay: 'Varies by service',
    requirements: ['Professional skills', '18+ years', 'License/insurance'],
  },
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [myDuties, setMyDuties] = useState([]);
  const [location, setLocation] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [userData, accountsData, dutiesData, earningsData] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('linkedAccounts'),
        AsyncStorage.getItem('myDuties'),
        AsyncStorage.getItem('earnings'),
      ]);

      if (userData) setUser(JSON.parse(userData));
      if (accountsData) setLinkedAccounts(JSON.parse(accountsData));
      if (dutiesData) setMyDuties(JSON.parse(dutiesData));
      if (earningsData) setEarnings(JSON.parse(earningsData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLinkedAccounts = async (accounts) => {
    setLinkedAccounts(accounts);
    await AsyncStorage.setItem('linkedAccounts', JSON.stringify(accounts));
  };

  const saveMyDuties = async (duties) => {
    setMyDuties(duties);
    await AsyncStorage.setItem('myDuties', JSON.stringify(duties));
  };

  const linkAccount = async (serviceId) => {
    const service = SUPPORTED_SERVICES.find(s => s.id === serviceId);
    if (!service) return false;

    const newAccount = {
      id: Date.now().toString(),
      serviceId,
      name: service.name,
      color: service.color,
      linkedAt: new Date().toISOString(),
      isActive: true,
    };

    const updated = [...linkedAccounts, newAccount];
    await saveLinkedAccounts(updated);
    return true;
  };

  const unlinkAccount = async (accountId) => {
    const updated = linkedAccounts.filter(a => a.id !== accountId);
    await saveLinkedAccounts(updated);
  };

  const acceptDuty = async (duty) => {
    const dutyWithId = {
      ...duty,
      id: Date.now().toString(),
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
    };
    const updated = [...myDuties, dutyWithId];
    await saveMyDuties(updated);
    return dutyWithId;
  };

  const completeDuty = async (dutyId) => {
    const updated = myDuties.map(d =>
      d.id === dutyId
        ? { ...d, status: 'completed', completedAt: new Date().toISOString() }
        : d
    );
    await saveMyDuties(updated);
  };

  const cancelDuty = async (dutyId) => {
    const updated = myDuties.map(d =>
      d.id === dutyId
        ? { ...d, status: 'cancelled', cancelledAt: new Date().toISOString() }
        : d
    );
    await saveMyDuties(updated);
  };

  const updateEarnings = async (amount) => {
    const updated = {
      ...earnings,
      today: earnings.today + amount,
      week: earnings.week + amount,
      month: earnings.month + amount,
      total: earnings.total + amount,
    };
    setEarnings(updated);
    await AsyncStorage.setItem('earnings', JSON.stringify(updated));
  };

  const canLinkMoreAccounts = () => {
    return linkedAccounts.length === 0; // First one is free
  };

  const getAdditionalAccountsCost = () => {
    const additionalCount = Math.max(0, linkedAccounts.length);
    return additionalCount * 0.99;
  };

  const value = {
    user,
    setUser,
    linkedAccounts,
    myDuties,
    earnings,
    location,
    setLocation,
    isLoading,
    linkAccount,
    unlinkAccount,
    acceptDuty,
    completeDuty,
    cancelDuty,
    updateEarnings,
    canLinkMoreAccounts,
    getAdditionalAccountsCost,
    SUPPORTED_SERVICES,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
