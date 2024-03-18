import { Alert, Button, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";

import { Text, View } from "@/components/Themed";
import { Station, fetchNearbyStations } from "./api";

export default function SearchScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [stations, setStations] = useState<Station[]>([]); // might make more sense as a Map keyed by Station Ids
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // request location permission
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log("location", location);
      setLocation(location);
    })();
  }, []);

  // would want some delta tolerance between last position and new position to
  // determine if this should run. Location updates may be more frequent than expected
  // (e.g. user may be driving);
  useEffect(() => {
    if (!location) return;
    // when location changes, get list of nearby charging stations
    const { latitude, longitude } = location?.coords;
    // I'm aware of hanging promise issues with this approach (e.g. if user navigates away while waiting for response)
    // Can also be nice to show fetching behavior like a spinning wheel
    // Will skip error handling for this exercise
    (async () => {
      const newStations = await fetchNearbyStations(latitude, longitude);
      setStations(newStations);
    })();
  }, [location]);

  console.log("stations", stations);
  console.log("selectedStation", selectedStation);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a charging station on the map!</Text>
      {location?.coords && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.coords.latitude,
            longitude: location?.coords.longitude,
            latitudeDelta: 0.0522,
            longitudeDelta: 0.0221,
          }}
          moveOnMarkerPress
        >
          {stations.map(
            ({ id, latitude, longitude, address, accessComment }, index) => (
              <Marker
                key={id}
                coordinate={{ latitude, longitude }}
                onPress={(_marker) => {
                  setSelectedStation(index);
                }}
                title={address}
                pointerEvents={"auto"}
              />
            )
          )}
        </MapView>
      )}
      {/* <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      /> */}
      {selectedStation != null && (
        <View style={styles.selectedInfoBox}>
          <Text style={styles.youSelectedText}>
            You've selected this station:
          </Text>
          <Text style={{ paddingTop: 10 }}>
            {stations[selectedStation].address}
          </Text>
          <Text style={{ paddingTop: 10 }}>
            {"Access Info: " + stations[selectedStation].accessComment}
          </Text>
          <Button
            title="Start Charging"
            onPress={() => {
              // fetch(`https://example.ev.energy/chargingsession`, {
              //   method: "POST",
              //   body: JSON.stringify({
              //     user: 1,
              //     car_id: 1,
              //     charger_id: Number(stations[selectedStation].id),
              //   }),
              // });
              // Alert would depend on response, but this is sufficient
              Alert.alert(
                "Started Charging",
                `Station Id #${Number(stations[selectedStation].id)}`
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    height: 100,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  map: {
    width: "100%",
    height: 300,
  },
  youSelectedText: { fontSize: 20 },
  selectedInfoBox: {
    borderColor: "black",
    borderWidth: 1,
    paddingTop: 10,
    paddingLeft: 10,
    marginTop: 20,
    height: 200,
  },
});
