// =================================================================
//  PLUG AND PLAY CONFIGURATION
//  Change these values to customize your map visualization
// =================================================================

const config = {
    map: {
        center: [1.3521, 103.8198],
        zoom: 12,
        minZoom: 3,
        maxZoom: 18,
    },

    tileLayer: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    },

    // default local file used by the template if no activity data provided
    dataSource: 'data.geojson',

    styleFeature: function(feature, latlng) {
        let color = "#ff7800";
        if (feature.properties && feature.properties.type) {
            switch(feature.properties.type) {
                case 'restaurant': color = "#e74c3c"; break;
                case 'park': color = "#27ae60"; break;
                case 'museum': color = "#3498db"; break;
                default: color = "#ff7800";
            }
        }

        const markerOptions = {
            radius: 8,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        return L.circleMarker(latlng, markerOptions);
    },

    createPopup: function(feature) {
        if (feature.properties) {
            const props = feature.properties;
            let content = '<div style="color: #FF0000;">';
            if (props.name) content += `<h3 style="color: #FF0000; margin: 0 0 8px 0;">${props.name}</h3>`;
            if (props.distance) {
                const distanceKm = (props.distance / 1000).toFixed(2);
                content += `<p style="color: #FF0000; margin: 4px 0;"><strong>Distance:</strong> ${distanceKm} km</p>`;
            }
            if (props.type) content += `<p style="color: #FF0000; margin: 4px 0;"><strong>Type:</strong> ${props.type}</p>`;
            if (props.start_time) content += `<p style="color: #FF0000; margin: 4px 0;"><strong>Date:</strong> ${props.start_time.slice(0, 10)}</p>`;
            if (props.description) content += `<p style="color: #FF0000; margin: 4px 0;">${props.description}</p>`;
            content += '</div>';
            return content || '<div style="color: #FF0000;">No information available.</div>';
        }
        return '<div style="color: #FF0000;">No data available for this feature.</div>';
    },

    styleLinePolygon: function(feature) {
        // Use red as the primary color for all routes
        let color = '#FF0000';  // Bright red
        let weight = 3;
        let opacity = 0.85;

        // If a specific color is provided in properties, use a red variant
        if (feature.properties && feature.properties.color) {
            // Convert any color to a red variant for consistency
            color = '#FF0000';
        } else if (feature.properties && feature.properties.type) {
            // Color based on activity type - all in red shades
            switch(feature.properties.type) {
                case 'Run': color = '#FF0000'; break;        // Bright red
                case 'cycling': color = '#DC143C'; break;    // Crimson red
                case 'walking': color = '#FF6347'; break;    // Tomato red
                case 'hiking': color = '#CD5C5C'; break;     // Indian red
                default: color = '#FF0000';
            }
        }

        return {
            color: color,
            weight: weight,
            opacity: opacity,
            fillColor: color,
            fillOpacity: 0.2
        };
    },

    features: {
        showPopups: true,
        clusterMarkers: false,
        fitBounds: true,
    }
};
