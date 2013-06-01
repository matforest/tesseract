var map = L.map('map').setView([-34.93, 138.64], 13);
var cache = [];

L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        key: 'e4c1e9f583d243d2abe36c41d8ffbb93',
        maxZoom: 18,
        styleId: 997
        }).addTo(map);

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

function onDragEnd(e) {
    var bounds = map.getBounds();

    $.ajax({
        type: 'GET',
        url: '/getpoints',
        // data to be added to query string
        data: { 
            'nw': bounds.getNorthWest().toString(),
            'ne': bounds.getNorthEast().toString(),
            'sw': bounds.getSouthWest().toString(),
            'se': bounds.getSouthEast().toString()
        },
        // type of data we are expecting in return:
        dataType: 'text',
        context: $('body'),
        success: function(data){
            data = JSON.parse(data);
            var newData = [];
            console.log('returned ' + data.length + ' results');
            console.log('already ' + cache.length + ' items in the cache');

            for(var i=0, l=data.length; i < l; i++) {
                var found = false;
                for(j=0, ll=cache.length; j < ll; j++) {
                    
                    if(data[i].properties.id === cache[j].properties.id &&
                        data[i].properties.type === cache[j].properties.type) {
                        found = true;
                        break;
                    }
                }
                if(!found) {
                    cache.push(data[i]);
                    newData.push(data[i]);
                }
            }

            console.log('adding ' + newData.length + ' items to the map');

            myGeoJLayer.addData(newData);
        },
        error: function(xhr, type){
            alert('Ajax error!')
        }
    });
};

map.on('dragend', onDragEnd);
map.on('click', onMapClick);

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

var playgroundIcon = L.icon({
    iconUrl: '/images/FunFairPin.png',
    iconSize: [48, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -28]
});

var libraryIcon = L.icon({
    iconUrl: '/images/LibraryPin.png',
    iconSize: [48, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -28]
});

var schoolIcon = L.icon({
    iconUrl: '/images/ApplePin.png',
    iconSize: [48, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -28]
});

var communityEducationIcon = L.icon({
    iconUrl: '/images/InfoPin.png',
    iconSize: [48, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -28]
});

// attach a popup to each feature
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
    // use name otherwise
    if (feature.properties && feature.properties.name) {
        layer.bindPopup("<b>"+feature.properties.name+"</b><br>"+feature.properties.type);
    }
}

//add features to the map
var myGeoJLayer = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        if(feature.properties.type && feature.properties.type === 'playground') {
            return L.marker(latlng, {
                icon: playgroundIcon });
        }
        else if(feature.properties.type && feature.properties.type === 'library') {
            return L.marker(latlng, {
                icon: libraryIcon
            });
        }
        else if(feature.properties.type && feature.properties.type === 'school') {
            return L.marker(latlng, {
                icon: schoolIcon
            });
        }
        else if(feature.properties.type && feature.properties.type === 'adult_education') {
            return L.marker(latlng, {
                icon: communityEducationIcon
            });
        }
    },
    onEachFeature: onEachFeature
}).addTo(map);