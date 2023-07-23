"use client";

import GoogleMapReact, { Coords } from "google-map-react";
import { memo } from "react";
declare var google: any;

function findCenter(coords: Coords[]): Coords {
  if (coords.length === 0) {
    return {
      lat: 40.7128,
      lng: -74.0061,
    };
  }

  let sumLat = 0;
  let sumLng = 0;

  for (let coord of coords) {
    sumLat += coord.lat;
    sumLng += coord.lng;
  }

  return {
    lat: sumLat / coords.length,
    lng: sumLng / coords.length,
  };
}

export const MapDisplay = memo(
  ({
    zoom,
    placesData,
  }: {
    zoom: number;
    placesData: Record<string, Coords>;
  }) => {
    console.log("rendering map", placesData);
    if (!placesData) return null;
    const center = findCenter(Object.values(placesData));
    const placeCoords = Object.values(placesData);
    return (
      <GoogleMapReact
        bootstrapURLKeys={{
          key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string,
        }}
        defaultCenter={{
          lat: center.lat,
          lng: center.lng,
        }}
        defaultZoom={zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => {
          var bounds = new google.maps.LatLngBounds();
          for (var i = 0; i < placeCoords.length; i++) {
            const latLngObj = new google.maps.LatLng(
              placeCoords[i].lat,
              placeCoords[i].lng
            );
            bounds.extend(latLngObj);
          }

          map.fitBounds(bounds);
          var currentZoom = map.getZoom();
          var newZoom = currentZoom >= 4 ? currentZoom : 4; ////////// future self - adjust the zoom here
          map.setZoom(newZoom);
        }}
      >
        {Object.entries(placesData).map(([placeName, value]) => (
          <div
            key={placeName}
            // @ts-ignore
            lat={value.lat}
            lng={value.lng}
            className="bg-red-500 rounded-full w-5 h-5"
          >
            {placeName}
          </div>
        ))}
      </GoogleMapReact>
    );
  }
);
MapDisplay.displayName = "MapDisplay";
