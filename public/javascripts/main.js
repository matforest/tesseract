var map = L.map('map').setView([-34.93, 138.64], 13);

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
            console.log('returned ' + data.length + ' results');

            data = JSON.parse(data);

            myGeoJLayer.addData(data);
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

var baseballIcon = L.icon({
    iconUrl: 'baseball-marker.png',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
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
        layer.bindPopup("<b>"+feature.properties.name+"</b><br>"+feature.properties.id);
    }
}

//add features to the map
var myGeoJLayer = L.geoJson(null, {
    onEachFeature: onEachFeature
}).addTo(map);
