// Paste your MapTiler API key between the quotes.
// You can get one from: https://cloud.maptiler.com/account/keys/
const apiKey = "YOUR_MAPTILER_API_KEY_HERE";

// Lucknow coordinates in [longitude, latitude] order.
const lucknowCenter = [80.9462, 26.8467];

// Give the MapTiler SDK your API key before creating the map.
maptilersdk.config.apiKey = apiKey;

// Create the map inside the <div id="map"> container.
const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.STREETS,
  center: lucknowCenter,
  zoom: 12
});

// Create a popup that appears when the marker is clicked.
const popup = new maptilersdk.Popup({
  offset: 25
}).setHTML("<strong>Lucknow</strong><br>Centered map location");

// Add a marker at the center point and attach the popup to it.
new maptilersdk.Marker()
  .setLngLat(lucknowCenter)
  .setPopup(popup)
  .addTo(map);
