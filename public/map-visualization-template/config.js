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
            let content = '';
            if (props.name) content += `<h3>${props.name}</h3>`;
            if (props.description) content += `<p>${props.description}</p>`;
            if (props.type) content += `<p><strong>Type:</strong> ${props.type}</p>`;
            return content || 'No information available.';
        }
        return 'No data available for this feature.';
    },

    styleLinePolygon: function(feature) {
        return {
            color: '#3388ff',
            weight: 3,
            opacity: 0.8,
            fillColor: '#3388ff',
            fillOpacity: 0.2
        };
    },

    features: {
        showPopups: true,
        clusterMarkers: false,
        fitBounds: true,
    }
};
