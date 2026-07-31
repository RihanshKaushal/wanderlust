document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.getElementById("map");

  // Only run this script if the map element exists on the page.
  if (mapElement) {
    const mapTilerKey = mapElement.dataset.maptilerKey;
    const lng = parseFloat(mapElement.dataset.lng);
    const lat = parseFloat(mapElement.dataset.lat);
    const title = mapElement.dataset.title;
    const location = mapElement.dataset.location;

    // Ensure we have valid data before trying to create the map.
    if (mapTilerKey && !isNaN(lng) && !isNaN(lat)) {
      maptilersdk.config.apiKey = mapTilerKey;
      const map = new maptilersdk.Map({
        container: "map",
        style: maptilersdk.MapStyle.STREETS,
        center: [lng, lat],
        zoom: 9,
      });

      const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(
        `<h6>${title}</h6><p>${location}</p>`
      );

      new maptilersdk.Marker({ color: "#FF0000" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
    }
  }
});
