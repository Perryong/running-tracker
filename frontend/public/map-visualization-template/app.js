// =================================================================
//  APPLICATION LOGIC
//  This file uses the settings from config.js to build the map.
//  It has been extended to accept a postMessage with type 'activityData'
//  so the parent window (React app) can push GeoJSON FeatureCollections here.
// =================================================================

// Animation state
let animationState = {
    isAnimating: false,
    animationLayer: null,
    animationInterval: null,
    currentIndex: 0,
    coordinates: [],
    speed: 50 // milliseconds between points
};

// small helper to create the geojson layer and add to map
function loadGeoJSONIntoMap(map, data, animate = false) {
    try {
        // Stop any ongoing animation
        stopAnimation(map);

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

        // Start animation if single route and animate flag is true
        if (animate && data.features && data.features.length === 1) {
            const feature = data.features[0];
            if (feature.geometry && feature.geometry.type === 'LineString') {
                startRouteAnimation(map, feature.geometry.coordinates, feature.properties);
            }
        }
    } catch (err) {
        console.error('Error adding GeoJSON to map', err);
    }
}

function stopAnimation(map) {
    if (animationState.animationInterval) {
        clearInterval(animationState.animationInterval);
        animationState.animationInterval = null;
    }
    if (animationState.animationLayer && map.hasLayer(animationState.animationLayer)) {
        map.removeLayer(animationState.animationLayer);
    }
    animationState.animationLayer = null;
    animationState.isAnimating = false;
    animationState.currentIndex = 0;
    animationState.coordinates = [];
}

function startRouteAnimation(map, coordinates, properties) {
    stopAnimation(map);

    if (!coordinates || coordinates.length < 2) return;

    animationState.coordinates = coordinates;
    animationState.currentIndex = 0;
    animationState.isAnimating = true;

    // Calculate speed based on number of points
    const totalPoints = coordinates.length;
    const targetDuration = 3000; // 3 seconds total animation
    animationState.speed = Math.max(10, Math.floor(targetDuration / totalPoints));

    // Create animated line with vibrant blue color
    animationState.animationLayer = L.polyline([], {
        color: '#007BFF',  // Blue color for animation
        weight: 4,
        opacity: 1,
        smoothFactor: 1
    }).addTo(map);

    // Add start and end markers
    const startMarker = L.circleMarker(coordinates[0], {
        radius: 8,
        fillColor: '#007BFF',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
    }).addTo(map).bindPopup('Start');

    const endMarker = L.circleMarker(coordinates[coordinates.length - 1], {
        radius: 8,
        fillColor: '#FF0000',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
    }).addTo(map).bindPopup('End');

    // Store markers for cleanup
    animationState.startMarker = startMarker;
    animationState.endMarker = endMarker;

    // Animate the route
    animationState.animationInterval = setInterval(() => {
        if (animationState.currentIndex < animationState.coordinates.length) {
            const latlngs = animationState.animationLayer.getLatLngs();
            latlngs.push([
                animationState.coordinates[animationState.currentIndex][1],
                animationState.coordinates[animationState.currentIndex][0]
            ]);
            animationState.animationLayer.setLatLngs(latlngs);
            animationState.currentIndex++;
        } else {
            // Animation complete
            clearInterval(animationState.animationInterval);
            animationState.animationInterval = null;
            animationState.isAnimating = false;
            
            // Keep the animated line visible
            setTimeout(() => {
                // Remove markers after animation
                if (animationState.startMarker) {
                    map.removeLayer(animationState.startMarker);
                    animationState.startMarker = null;
                }
                if (animationState.endMarker) {
                    map.removeLayer(animationState.endMarker);
                    animationState.endMarker = null;
                }
            }, 1000);
        }
    }, animationState.speed);
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
                console.log('📩 Received activityData from parent', ev.data);
                const animate = ev.data.animate === true;
                loadGeoJSONIntoMap(map, ev.data.data, animate);
            }
            // allow the parent to ask for a reload of the default source
            if (ev.data.type === 'reloadDefault') {
                fetchAndLoadDefault();
            }
            // Handle animation trigger
            if (ev.data.type === 'triggerAnimation') {
                console.log('🎬 Animation trigger received');
                if (window._rv_geojson_layer) {
                    const layers = [];
                    window._rv_geojson_layer.eachLayer((layer) => {
                        if (layer.feature && layer.feature.geometry.type === 'LineString') {
                            layers.push(layer);
                        }
                    });
                    if (layers.length === 1) {
                        const layer = layers[0];
                        startRouteAnimation(map, layer.feature.geometry.coordinates, layer.feature.properties);
                    }
                }
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
