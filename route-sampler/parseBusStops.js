const fs = require("fs");
const xml2js = require("xml2js");

const parser = new xml2js.Parser();

fs.readFile("export.osm", (err, data) => {
  if (err) throw err;

  parser.parseString(data, (err, result) => {
    if (err) throw err;

    const nodes = result.osm.node || [];
    const busStops = [];

    for (const node of nodes) {
      const tags = node.tag || [];
      const hasBusTag = tags.some(tag =>
        (tag.$.k === "highway" && tag.$.v === "bus_stop") ||
        (tag.$.k === "amenity" && tag.$.v === "bus_station")
      );

      if (hasBusTag) {
        busStops.push({
          lat: parseFloat(node.$.lat),
          lon: parseFloat(node.$.lon),
          name: tags.find(tag => tag.$.k === "name")?.$.v || "Unnamed Stop"
        });
      }
    }

    fs.writeFileSync("bus_stops.json", JSON.stringify(busStops, null, 2));
    console.log(`✅ Extracted ${busStops.length} bus stops to bus_stops.json`);
  });
});
