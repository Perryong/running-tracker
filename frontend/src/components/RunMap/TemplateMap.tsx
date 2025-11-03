import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { FeatureCollection } from 'geojson';
import { RPGeometry } from '@/static/run_countries';
import styles from './style.module.css';
import { MAP_HEIGHT } from '@/utils/const';

function convertGeoDataToGeoJSON(geoData: FeatureCollection<RPGeometry>) {
  const features = geoData.features.map((feature) => {
    return {
      type: 'Feature',
      properties: feature.properties || {},
      geometry: feature.geometry,
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  } as FeatureCollection;
}

interface ITemplateMapProps {
  title: string;
  geoData: FeatureCollection<RPGeometry>;
}

export default function TemplateMap({ title, geoData }: ITemplateMapProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastRouteKeyRef = useRef<string | null>(null);

  // Construct the map template URL with proper base path handling
  const mapTemplateUrl = useMemo(() => {
    const baseUrl = import.meta.env.BASE_URL;
    const path = 'map-visualization-template/index.html';
    return baseUrl.endsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }, []);

  const geojson = useMemo(() => {
    return convertGeoDataToGeoJSON(geoData);
  }, [geoData]);

  // Check if it's a single route
  const isSingleRoute = useMemo(() => {
    return (
      geoData.features.length === 1 &&
      geoData.features[0].geometry.coordinates.length > 0
    );
  }, [geoData]);

  // Trigger animation for single routes
  const triggerAnimation = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'triggerAnimation' },
        '*'
      );
    }
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'requestActivityData') {
        const shouldAnimate = isSingleRoute;
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'activityData',
            data: geojson,
            animate: shouldAnimate,
          },
          '*'
        );
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [geojson, isSingleRoute]);

  useEffect(() => {
    // Send data when geojson changes
    if (iframeRef.current?.contentWindow) {
      const shouldAnimate = isSingleRoute;

      // Create a unique key for this route
      if (isSingleRoute && geoData.features.length > 0) {
        const coords = geoData.features[0].geometry.coordinates;
        const routeKey = `${coords.length}-${coords[0]?.join(',')}-${coords[coords.length - 1]?.join(',')}`;

        // Only animate if it's a new/different route
        if (routeKey !== lastRouteKeyRef.current) {
          lastRouteKeyRef.current = routeKey;
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'activityData',
              data: geojson,
              animate: shouldAnimate,
            },
            '*'
          );
        } else {
          // Same route, just update without animation
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'activityData',
              data: geojson,
              animate: false,
            },
            '*'
          );
        }
      } else {
        lastRouteKeyRef.current = null;
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'activityData',
            data: geojson,
            animate: false,
          },
          '*'
        );
      }
    }
  }, [geojson, isSingleRoute, geoData]);

  const onLoad = () => {
    if (iframeRef.current?.contentWindow) {
      const shouldAnimate = isSingleRoute;
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'activityData',
          data: geojson,
          animate: shouldAnimate,
        },
        '*'
      );
    }
  };

  // Click handler to replay animation
  const handleMapClick = useCallback(() => {
    if (isSingleRoute) {
      triggerAnimation();
    }
  }, [isSingleRoute, triggerAnimation]);

  const style: React.CSSProperties = {
    width: '100%',
    height: MAP_HEIGHT,
    maxWidth: '100%',
    position: 'relative',
  };

  return (
    <div style={style} onClick={handleMapClick}>
      <iframe
        ref={iframeRef}
        src={mapTemplateUrl}
        title="Route visualization"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          cursor: isSingleRoute ? 'pointer' : 'default',
        }}
        onLoad={onLoad}
      />
      <span className={styles.runTitle}>{title}</span>
      {isSingleRoute && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 123, 255, 0.95)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 2px 6px rgba(0, 123, 255, 0.4)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 86, 179, 0.95)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.95)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onClick={(e) => {
            e.stopPropagation();
            triggerAnimation();
          }}
        >
          🔄 Replay
        </div>
      )}
    </div>
  );
}
