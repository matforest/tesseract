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
    iconUrl: '/images/UniversityPin.png',
    iconSize: [48, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -28]
});

var eventIcon = L.icon({
    iconUrl: '/images/InfoPin.png',
    iconSize: [48, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -28]
});

var faultReportIcon = L.icon({
    iconUrl: '/images/RepairPin.png',
    iconSize: [48, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -28]
});

var popup = L.popup();
var marker = L.marker();

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
        dataType: 'json',
        context: $('body'),
        success: function(data){
            getPointsSuccess(data);
        },
        error: function(xhr, type){
            alert('Oops, there was an error getting data from the database.')
        }
    });
};

function onMapClick(e) {
    /*popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);*/

    //detect the current section
    var currentSelection = $('#mode section.active');

    if(currentSelection && currentSelection.hasClass('create')) {
        //create a new event icon
        marker.setIcon(eventIcon);
        marker.setLatLng(e.latlng).addTo(map);

        //populate the form with the location
        $("#form-create input[name=lat]").val(e.latlng.lat);
        $("#form-create input[name=lng]").val(e.latlng.lng);
    } else if(currentSelection && currentSelection.hasClass('report')) {
        //report a new fault icon
        marker.setIcon(faultReportIcon);
        marker.setLatLng(e.latlng).addTo(map);

        //populate the form with the location
        $("#form-report input[name=lat]").val(e.latlng.lat);
        $("#form-report input[name=lng]").val(e.latlng.lng);

        //populate the authority
        findAuthority();
    } 
}

// attach a popup to each feature
function onEachFeature(feature, layer) {
    // display the features name on click
    if (feature.properties && feature.properties.name) {
        var type = feature.properties.type === 'adult_education' ? 'Adult Community Education facility' : feature.properties.type;
        layer.bindPopup("<b>"+feature.properties.name+"</b><br>" + type +
            "<input type='hidden' name='pid' value='__"+feature.properties.id+","+feature.properties.type+"__'/>");
    }
}

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);

    //populate the form with the location
    $("form input[name=lat]").val(e.latlng.lat);
    $("form input[name=lng]").val(e.latlng.lng);

    //populate the authority
    findAuthority();
}

//send a request to the server for more data when the user clicks a marker
function onPopupOpen(e) {
    var popupContent = e.popup._content;
    if(popupContent) {
        //do something if the content has a hidden field we know about
        var idType = /__.*__/.exec(popupContent);
        if(idType && idType[0]) {
            idType = idType[0].replace(/__/g, '');
            var arr = idType.split(',');
            var request = {
                id: arr[0],
                type: arr[1]
            };

            getDetails(request);
        }
    }
}

//event fired when a tab is clicked
function onSectionChange(e) {
    //detect the current section
    var currentSelection = $('#mode section.active');

    /*if(currentSelection && currentSelection.hasClass('report')) {
        //populate the authority
        findAuthority();
    }*/
}

/*------------------
  Helper Functions
-------------------*/
//get the local council responsible for the current report location
function findAuthority() {
    $.ajax({
        type: 'GET',
        url: '/findAuthority',
        // data to be added to query string
        data: { 
            'lat': $("#form-report input[name=lat]").val(),
            'lng': $("#form-report input[name=lng]").val()
        },
        dataType: 'json',
        context: $('body'),
        success: function(data){
            findAuthoritySuccess(data);
        },
        error: function(xhr, type){
            alert('Oops, there was an error getting data from the database.')
        }
    });
}

function findAuthoritySuccess(data) {
    if(data && data[0]) {
        $("#form-report input[name=submitto]").val(data[0].lga.toLowerCase());
        $("#form-report input[name=fid]").val(data[0].id);
    }
}

function getDetails(request) {
    $.ajax({
        type: 'GET',
        url: '/getdetails',
        // data to be added to query string
        data: request,
        // type of data we are expecting in return:
        dataType: 'json',
        context: $('body'),
        success: function(data){
            getDetailsSuccess(data);
        },
        error: function(xhr, type){
            alert('Oops, there was an error getting data from the database.')
        }
    });
}

function getDetailsSuccess(data) {
    //console.log('get details succeeded');
    //console.log(data[0]);

    var out = '';
    for(var key in data[0]) {
        if(key === 'id' || key === 'geom' || key === 'fid' || data[0][key] == 'NULL') {
            continue;
        }
        out += '<div class="large-6 small-12 columns"><strong style="text-transform: capitalize">' + key + '</strong>: ' + data[0][key] + '</div><br>';
    }

    $('#details').html(out);
}

function getPointsSuccess(data) {
    //data = JSON.parse(data);
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
        else if(feature.properties.type && feature.properties.type === 'event') {
            return L.marker(latlng, {
                icon: eventIcon
            });
        }
        else if(feature.properties.type && feature.properties.type === 'report') {
            return L.marker(latlng, {
                icon: faultReportIcon
            });
        }
        else {
            return L.marker(latlng);
        }
    },
    onEachFeature: onEachFeature
}).addTo(map);

map.on('locationfound', onLocationFound);
map.on('dragend', onDragEnd);
map.on('click', onMapClick);
map.on('popupopen', onPopupOpen);

// trigger location search
map.locate({
    setView: true, 
    maxZoom: 15
});

// add date picker to the form
$(window).load(function() {
    $('.datepicker').pickadate();

    $('#mode section .title a').on('click', onSectionChange);
});