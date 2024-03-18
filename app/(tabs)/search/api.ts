type OpenChargeMapPoiResponse = StationResponseObj[];

// Should type this more specifically. Probably split out some notable pieces,
// but we really only care about AddressInfo for this exercise
type StationResponseObj = {
  ID: number;
  UUID: string;
  DataProvider: object;
  OperatorInfo: object;
  UsageType: object;
  StatusType: any;
  SubmissionStatus: object;
  UserComments: any;
  AddressInfo: {
    ID: number;
    Title: string;
    AddressLine1: string;
    AddressLine2: string | null;
    Town: string;
    StateOrProvince: string;
    Postcode: string;
    CountryID: number;
    Country: object;
    Latitude: number;
    Longitude: number;
    AccessComments: string;
    Distance: number;
    DistanceUnit: number; // probably critical info, but I'll assume imperial for any unit conversions for now
  };
  Connections: object[];
};

export type Station = {
  Id: string;
  latitude: number;
  longitude: number;
  address: string; // gonna use a simple concatenated string for now
  accessComment: string;
  distance: number;
};

const parseStationResponse = (
  responseData: OpenChargeMapPoiResponse
): Station[] =>
  responseData.map(
    ({
      ID,
      AddressInfo: {
        Latitude,
        Longitude,
        AccessComments,
        Distance,
        AddressLine1,
        Town,
        StateOrProvince,
        Postcode,
      },
    }) => {
      return {
        Id: String(ID),
        latitude: Latitude,
        longitude: Longitude,
        address: `${AddressLine1}\n${Town}, ${StateOrProvince} ${Postcode}`,
        accessComment: AccessComments,
        distance: Distance,
      };
    }
  );

// we could expand these paramters to include more results or other specific request details.
// however, for a PoC, I'm focusing the list around the user's position
export const fetchNearbyStations = async (lat: number, long: number) => {
  const baseUrl = `https://api.openchargemap.io/v3/poi/`;
  // key should be stored securely. a proxy request via internal backend probably most secure.
  const key = "67a37a0e-9d5c-42d9-bf22-0eb7f220c5e4";
  const queryParams = new URLSearchParams({
    output: "json",
    countrycode: "US",
    maxresults: "10",
    key,
    latitude: String(lat),
    longitude: String(long),
  }).toString();

  const responseData = await fetch(`${baseUrl}?${queryParams}`, {
    method: "GET",
    mode: "cors",
  });

  const responseJson = (await responseData.json()) as OpenChargeMapPoiResponse;

  return parseStationResponse(responseJson);
};
