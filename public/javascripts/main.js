var map = L.map('map').setView([-34.93, 138.64], 13);
//stores the items that have been added to the map
var cache = [];

L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        key: 'e4c1e9f583d243d2abe36c41d8ffbb93',
        maxZoom: 18,
        styleId: 997
        }).addTo(map);

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

var popup = L.popup();

/*--------------
  Map Events
---------------*/
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
            getPointsSuccess(data);
        },
        error: function(xhr, type){
            alert('Ajax error!')
        }
    });
};

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

// attach a popup to each feature
function onEachFeature(feature, layer) {
    // display the features name on click
    if (feature.properties && feature.properties.name) {
        layer.bindPopup("<b>"+feature.properties.name+"</b><br>"+feature.properties.type);
    }
}

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

/*------------------
  Helper Functions
-------------------*/
function getPointsSuccess(data) {
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
}

/*---------------------
  Initialisation stuff
----------------------*/

// add features to the map
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

map.on('locationfound', onLocationFound);
map.on('dragend', onDragEnd);
map.on('click', onMapClick);

// trigger location search
map.locate({
    setView: true, 
    maxZoom: 15
});