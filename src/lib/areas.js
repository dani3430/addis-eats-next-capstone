// The neighbourhoods Addis Eats delivers to. One list, used by the checkout form,
// the server-side validation, the dashboard and the map.
export const AREAS = ["Bole", "Kazanchis", "Piassa", "Megenagna", "Sarbet"];

// The approximate centre of each neighbourhood, as [latitude, longitude].
// LATITUDE FIRST: that is Leaflet's order. (GeoJSON uses the opposite order, [longitude, latitude].)
export const AREA_COORDS = {
  Bole: [8.995, 38.7896],
  Kazanchis: [9.0153, 38.7668],
  Piassa: [9.0357, 38.7468],
  Megenagna: [9.0204, 38.8008],
  Sarbet: [8.9915, 38.7237],
};

// The demo kitchen, near Meskel Square.
export const KITCHEN = { name: "Addis Eats kitchen", coords: [9.0107, 38.7613] };