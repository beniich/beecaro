import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from 'react-simple-maps';
import { ThreatProfile } from './SecurityThreatMatrix';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface ThreatMapProps {
  selectedProfile: ThreatProfile;
}

export const ThreatMap: React.FC<ThreatMapProps> = ({ selectedProfile }) => {
  const [dots, setDots] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);

  // Simulated node locations
  const nodes = [
    { id: 'n1', coordinates: [-100, 40], name: 'US East' }, // US
    { id: 'n2', coordinates: [-120, 35], name: 'US West' },
    { id: 'n3', coordinates: [-45, -15], name: 'Brazil' }, // SA
    { id: 'n4', coordinates: [10, 50], name: 'Europe' }, // EU
    { id: 'n5', coordinates: [35, 55], name: 'Russia' }, // RU
    { id: 'n6', coordinates: [100, 35], name: 'China' }, // APAC
    { id: 'n7', coordinates: [135, -25], name: 'Australia' } // AUS
  ];

  useEffect(() => {
    // Determine active attacks based on the selected profile
    let activeLines: any[] = [];
    if (selectedProfile.code.includes('APT')) {
      activeLines = [
        { from: nodes[4], to: nodes[0], color: '#ff4b4b' },
        { from: nodes[4], to: nodes[3], color: '#ff4b4b' }
      ];
    } else if (selectedProfile.code.includes('LOCKBIT')) {
      activeLines = [
        { from: nodes[5], to: nodes[0], color: '#ffb04f' },
        { from: nodes[5], to: nodes[1], color: '#ffb04f' },
        { from: nodes[5], to: nodes[3], color: '#ffb04f' }
      ];
    } else if (selectedProfile.code.includes('CVE')) {
      activeLines = [
        { from: nodes[2], to: nodes[0], color: '#ff5e00' },
        { from: nodes[2], to: nodes[3], color: '#ff5e00' }
      ];
    } else {
      activeLines = [
        { from: nodes[5], to: nodes[0], color: '#ff4b4b' },
        { from: nodes[4], to: nodes[3], color: '#ffb04f' },
        { from: nodes[2], to: nodes[1], color: '#ff5e00' }
      ];
    }
    
    setLines(activeLines);
    setDots(nodes);
  }, [selectedProfile]);

  return (
    <div className="w-full h-full relative" style={{ background: '#0a0515' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120 }}
        width={800}
        height={400}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="transparent"
                stroke="#ff9d2b"
                strokeWidth={0.5}
                strokeDasharray="2 2"
                style={{
                  default: { outline: 'none' },
                  hover: { fill: 'rgba(255, 157, 43, 0.1)', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {/* Draw Lines */}
        {lines.map((line, i) => {
          return (
            <Line
              key={`line-${i}`}
              from={line.from.coordinates}
              to={line.to.coordinates}
              stroke={line.color}
              strokeWidth={1.5}
              strokeLinecap="round"
              className="animate-pulse"
              style={{
                strokeDasharray: '4 4',
                animation: 'dash 10s linear infinite',
              }}
            />
          );
        })}

        {/* Draw Markers */}
        {dots.map((dot) => (
          <Marker key={dot.id} coordinates={dot.coordinates}>
            <circle r={4} fill="#ff9d2b" />
            <circle r={10} fill="rgba(255, 157, 43, 0.2)" className="animate-ping" />
            <text
              textAnchor="middle"
              y={-15}
              style={{
                fontFamily: "monospace",
                fill: "#fff",
                fontSize: "8px",
                fontWeight: "bold"
              }}
            >
              {dot.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
};
