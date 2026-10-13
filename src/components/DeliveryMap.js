"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // without this the map renders as broken tiles

// Pins drawn as HTML, so there are no image files for the bundler to lose.
const pin = (symbol, label, anchorY) =>
  L.divIcon({
    className: "",
    html: `<div role="img" aria-label="${label}" style="display:flex;width:44px;height:44px;align-items:center;justify-content:center;font-size:28px;line-height:1">${symbol}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, anchorY],
  });

const KITCHEN_ICON = pin("🍽️", "Addis Eats kitchen", 22);
const COURIER_ICON = pin("🛵", "Courier", 22);
const DESTINATION_ICON = pin("📍", "Delivery address", 44);

// Zoom and move the map so every point is on screen.
function FitToPoints({ points }) {
  const map = useMap();
  const key = points.flat().join(",");

  useEffect(() => {
    map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);

  return null;
}

function ClosePopupOnEscape() {
  const map = useMap();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") map.closePopup();
    }

    const container = map.getContainer();
    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [map]);

  return null;
}

export default function DeliveryMap({ tracking }) {
  const { courier, destination, kitchen, area } = tracking;
  const points = [kitchen, destination, ...(courier ? [courier] : [])];

  return (
    <MapContainer
      center={destination}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "320px", width: "100%" }} // an explicit height, or the map collapses
    >
      <ClosePopupOnEscape />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline
        positions={[kitchen, destination]}
        pathOptions={{ color: "#92400e", weight: 3, dashArray: "6 8" }}
      />
      <Marker position={kitchen} icon={KITCHEN_ICON}>
        <Popup>Addis Eats kitchen</Popup>
      </Marker>
      <Marker position={destination} icon={DESTINATION_ICON}>
        <Popup>Delivery address, {area}</Popup>
      </Marker>
      {courier && (
        <Marker position={courier} icon={COURIER_ICON}>
          <Popup>Courier (simulated position)</Popup>
        </Marker>
      )}
      <FitToPoints points={points} />
    </MapContainer>
  );
}