import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export const SustainabilityMap: React.FC = () => {
  // Mock hotspots for environmental impact
  const hotspots = [
    { coordinates: [-100, 40], size: 24 }, // NA
    { coordinates: [-80, 35], size: 16 },
    { coordinates: [-120, 38], size: 12 },
    { coordinates: [-45, -15], size: 10 }, // SA
    { coordinates: [-60, -30], size: 8 },
    { coordinates: [10, 50], size: 28 }, // EU
    { coordinates: [5, 45], size: 20 },
    { coordinates: [20, 48], size: 18 },
    { coordinates: [100, 35], size: 32 }, // CN
    { coordinates: [115, 30], size: 22 },
    { coordinates: [135, -25], size: 12 }, // AUS
    { coordinates: [75, 20], size: 26 }, // IND
    { coordinates: [30, -5], size: 14 } // AFR
  ];

  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140 }}
        width={800}
        height={450}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#f1f5f9"
                stroke="#cbd5e1"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { fill: '#e2e8f0', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {/* Heatmap effect using multiple radial gradients or transparent overlapping circles */}
        {hotspots.map((spot, i) => (
          <Marker key={`spot-${i}`} coordinates={spot.coordinates as [number, number]}>
            <circle
              r={spot.size * 1.5}
              fill="rgba(255, 140, 0, 0.15)"
              style={{ filter: 'blur(4px)' }}
            />
            <circle
              r={spot.size * 0.8}
              fill="rgba(255, 120, 0, 0.3)"
              style={{ filter: 'blur(2px)' }}
            />
            <circle
              r={spot.size * 0.3}
              fill="rgba(255, 90, 0, 0.6)"
            />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};
