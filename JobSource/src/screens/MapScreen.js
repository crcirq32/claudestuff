import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../theme/colors';

function MapScreen() {
  return (
    <View style={styles.container}>
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
          title="You are here"
        />
        <Marker
          coordinate={{ latitude: 37.7849, longitude: -122.4094 }}
          title="Instacart Job"
          description="$18-28 • 0.3 mi"
          pinColor="#FF8200"
        />
        <Marker
          coordinate={{ latitude: 37.7649, longitude: -122.4294 }}
          title="DoorDash Job"
          description="$15-22 • 0.8 mi"
          pinColor="#FF3008"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
