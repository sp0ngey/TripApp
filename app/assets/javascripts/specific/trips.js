var geocoder;
var map;
var markers = [];
var directionsRenderer;
var directionsService;

$(function() {
    console.log("Initialising trips map stuff...");
    $( "#sortable" ).sortable({
        update: function( event, ui ) {  calcRoute(); }
    });
    $( "#sortable" ).disableSelection();
    $( "#sortable" ).accordion();

    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    var latlng = new google.maps.LatLng(50.816667, -1.083333);
    var mapOptions = {
        zoom: 8,
        center: latlng
    }
    console.log(document.getElementById('map-canvas'));
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    console.log(map.getDiv());
    directionsRenderer.setMap(map);

    $('#address').val("portsmouth, uk");
    codeAddress();
    $('#address').val("plymouth, uk");
    codeAddress();
    $('#address').val("worcester, uk");
    codeAddress();
    $('#address').val("norwich, uk");
    codeAddress();
    $('#address').val("aberystwyth, uk");
    codeAddress();
    $('#address').val("blackpool, uk");
    codeAddress();
});

function codeAddress()
{
    var address = $('#address').val();
    geocoder.geocode(
        { 'address': address },
        function(results, status)
        {
            if (status == google.maps.GeocoderStatus.OK)
            {
                console.log("The results object from the geo code is as follows...");
                console.log(results);
                map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location });

                var newDiv = $('<div style="display:none; border: 1px solid red; top: 0; left: 0;"></div>');
                newDiv.append("This is an " + results[0].geometry.location_type + " location<br>Lat:" +  results[0].geometry.location.lat()+"<br>Lng:"+  results[0].geometry.location.lng());

                var newLi = $('<li style="border: 2px solid blue;" id="itinery_item_' + markers.length + '">' + address + '</li>');
                newLi.append(newDiv);
                newLi.click( function() { $(this).children('div').slideToggle();} );
                $("#sortable").append(newLi);
                markers.push({theMarker: marker, theGeocodeResult: results[0]});
                calcRoute();
            }
            else
            {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
}

function calcRoute()
{
    console.log("Calculating route...");
    if( markers.length <= 1 )
    {
        console.log("There are 1 or zero markers available... not enought to plot a route!");
        return;
    }


    var locationsInOrder = jQuery.map( $("#sortable").sortable("toArray"), function(val, indx) { return parseInt(val.replace("itinery_item_", "")); } );
    console.log("Locations in order are:");
    console.log(locationsInOrder);

    var wayPoints = [];
    var startMarker = markers[locationsInOrder[0]].theMarker;
    var endMarker   = markers[locationsInOrder[locationsInOrder.length - 1]].theMarker;
    console.log("   Starting at " + markers[locationsInOrder[0]].theGeocodeResult.formatted_address);
    console.log("   Ending at " + markers[locationsInOrder[locationsInOrder.length - 1]].theGeocodeResult.formatted_address);

    for (var i = 1; i < locationsInOrder.length - 1; i++)
    {
        var locIndexIntoMarkers = locationsInOrder[i];
        var thisMarker = markers[locIndexIntoMarkers].theMarker;
        console.log("      Adding waypoint " + markers[locIndexIntoMarkers].theGeocodeResult.formatted_address);
        wayPoints.push( {location: thisMarker.position, stopover: true} );
    }

    var request = {
        origin: startMarker.position,
        destination: endMarker.position,
        waypoints: wayPoints,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK)
        {
            directionsRenderer.setDirections(response);
        }
        else
        {
            alert("FUCKERY");
        }
    });
}