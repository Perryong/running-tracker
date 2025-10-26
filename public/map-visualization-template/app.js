// =================================================================
//  APPLICATION LOGIC
//  This file uses the settings from config.js to build the map.
//  It has been extended to accept a postMessage with type 'activityData'
//  so the parent window (React app) can push GeoJSON FeatureCollections here.
// =================================================================

// small helper to create the geojson layer and add to map
function loadGeoJSONIntoMap(map, data) {
    try {
        // remove existing layer if present
        if (window._rv_geojson_layer) {
            map.removeLayer(window._rv_geojson_layer);
            window._rv_geojson_layer = null;
        }

        const geoJsonLayer = L.geoJSON(data, {
            pointToLayer: config.styleFeature,
            style: config.styleLinePolygon,
            onEachFeature: (feature, layer) => {
                if (config.features.showPopups) {
                    const popupContent = config.createPopup(feature);
                    layer.bindPopup(popupContent);
                }
            }
        }).addTo(map);

        window._rv_geojson_layer = geoJsonLayer;

        if (config.features.fitBounds && data.features && data.features.length > 0) {
            const bounds = geoJsonLayer.getBounds();
            if (bounds.isValid && bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    } catch (err) {
        console.error('Error adding GeoJSON to map', err);
    }
}

// Wait for the DOM to be fully loaded before initializing the map
document.addEventListener('DOMContentLoaded', () => {
    console.log('🗺️ Initializing map visualization...');

    const map = L.map('map', {
        minZoom: config.map.minZoom,
        maxZoom: config.map.maxZoom
    }).setView(config.map.center, config.map.zoom);

    console.log('✓ Map container created');

    L.tileLayer(config.tileLayer.url, {
        attribution: config.tileLayer.attribution,
        maxZoom: config.tileLayer.maxZoom
    }).addTo(map);

    console.log('✓ Tile layer added');

    // support both: initial fetch from config.dataSource, or receiving data via postMessage
    function fetchAndLoadDefault() {
        console.log(`📡 Fetching data from: ${config.dataSource}`);
        fetch(config.dataSource)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('✓ Data loaded successfully (default source)');
                console.log(`📊 Features found: ${data.features ? data.features.length : 0}`);
                loadGeoJSONIntoMap(map, data);
            })
            .catch(error => {
                console.warn('❌ Error loading default data (this is ok if parent will send activityData):', error);
            });
    }

    // listen for messages from parent to receive activity data
    window.addEventListener('message', (ev) => {
        try {
            if (!ev.data) return;
            if (ev.data.type === 'activityData' && ev.data.data) {
                console.log('📩 Received activityData from parent');
                loadGeoJSONIntoMap(map, ev.data.data);
            }
            // allow the parent to ask for a reload of the default source
            if (ev.data.type === 'reloadDefault') {
                fetchAndLoadDefault();
            }
        } catch (err) {
            console.error('Error handling message in template app.js', err);
        }
    });

    // attempt to load default file (keeps template working standalone)
    fetchAndLoadDefault();

    // Tell parent iframe we are ready and request data (parent can ignore)
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'requestActivityData' }, '*');
        }
    } catch (err) {
        /* noop */
    }

    console.log('🎉 Map visualization template ready (listening for activityData)');
});
