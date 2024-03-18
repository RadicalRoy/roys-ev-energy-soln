import { StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

import { Text, View } from "@/components/Themed";
import { Station, fetchNearbyStations } from "./api";

export default function SearchScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<number>();
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

  useEffect(() => {
    if (!location) return;
    // when location changes, get list of nearby charging stations
    const { latitude, longitude } = location?.coords;
    // I'm aware of hanging promise issues with this approach (e.g. if user navigates away while waiting for response)
    (async () => {
      const newStations = await fetchNearbyStations(latitude, longitude);
      setStations(newStations);
    })();
  }, [location]);

  console.log("stations", stations);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
