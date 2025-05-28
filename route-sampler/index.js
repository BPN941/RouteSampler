const axios = require("axios");
const haversine = require("haversine-distance");
const fs = require("fs");
const { config } = require("dotenv");
const path=require('path')

config({
  path:path.resolve(__dirname,'.env')
})

const apiKey = process.env.API_key;
const interval = 100; // meters

const coordinates = [
  //[85.30127415067481, 27.684353257350377], // [lng, lat] for Blakhu Bus stop
  [85.28180826032701, 27.67707800405618], // [lng, lat] for Kirtipur gate Bus Stop
  [85.30127415067481, 27.684353257350377], // [lng, lat] for Blakhu Bus stop
];

async function getRoute() {
  const url =
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  const res = await axios.post(
    url,
    {
      coordinates: coordinates,
    },
    {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.features[0].geometry.coordinates.map((c) => [c[1], c[0]]); // convert to [lat, lng]
}

function interpolate(coords, interval) {
  const result = [coords[0]];
  let accumulated = 0;

  for (let i = 1; i < coords.length; i++) {
    const p1 = coords[i - 1];
    const p2 = coords[i];
    let segmentDistance = haversine(p1, p2);

    while (accumulated + segmentDistance >= interval) {
      const remaining = interval - accumulated;
      const ratio = remaining / segmentDistance;

      const lat = p1[0] + ratio * (p2[0] - p1[0]);
      const lng = p1[1] + ratio * (p2[1] - p1[1]);
      const interpolated = [lat, lng];
      result.push(interpolated);

      coords[i - 1] = interpolated;
      segmentDistance = haversine(interpolated, p2);
      accumulated = 0;
    }

    accumulated += segmentDistance;
  }

  return result;
}

(async () => {
  try {
    const routeCoords = await getRoute();
    const sampled = interpolate(routeCoords, interval);

    console.log(`✅ Route sampled every ${interval}m:`);
    sampled.forEach((pt, i) => {
      console.log(`${i + 1}: ${pt[0].toFixed(6)}, ${pt[1].toFixed(6)}`);
    });

    // Save to file
    fs.writeFileSync("sampled_points.json", JSON.stringify(sampled, null, 2));
    console.log("✅ Saved sampled points to sampled_points.json");
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
})();
