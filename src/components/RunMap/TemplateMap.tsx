import React, { useEffect, useRef } from 'react';
import activities from '@/static/activities.json';

// Minimal polyline decoder (Google encoded polyline algorithm)
function decodePolyline(str: string): number[][] {
  const coords: number[][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < str.length) {
    let b; let shift = 0; let result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0; result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coords.push([lng / 1e5, lat / 1e5]);
  }
  return coords;
}

function convertActivitiesToGeoJSON(acts: any[]) {
  const features = acts
    .filter(a => a && a.summary_polyline)
    .map(a => {
      const coords = decodePolyline(a.summary_polyline);
      return {
        type: 'Feature',
        properties: {
          id: a.run_id ?? a.id ?? null,
          name: a.name ?? '',
          type: a.type ?? '',
          start_time: a.start_date ?? a.start_date_local ?? null,
          distance: a.distance ?? null,
        },
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      };
    });

  return {
    type: 'FeatureCollection',
    features,
  } as GeoJSON.FeatureCollection<GeoJSON.LineString>;
}

export default function TemplateMap() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const geojson = convertActivitiesToGeoJSON(activities as any[]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'requestActivityData') {
        iframeRef.current?.contentWindow?.postMessage({ type: 'activityData', data: geojson }, '*');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [geojson]);

  const onLoad = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'activityData', data: geojson }, '*');
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <iframe
        ref={iframeRef}
        src="/map-visualization-template/index.html"
        title="Route visualization"
        style={{ width: '100%', height: '100%', border: 0 }}
        onLoad={onLoad}
      />
    </div>
  );
}
