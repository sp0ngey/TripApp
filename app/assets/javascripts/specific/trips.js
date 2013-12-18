var geocoder;
var map;

/* An array of markers on the google map. This array is in the order that the user created locations and doesn't
 * necessarily have the same order as the final result in the "sortable" itinery list. See the comments in codeAddress()
 * for more information... */
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
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
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

function ConvertListItemItineryIdToInteger(itineryItemIdString)
{
    return parseInt(itineryItemIdString.replace('itinery_item_', ''));
}

function DeleteTripItem(theListItem)
{
    console.log("Deleting trip item");
    var itineryIndex = ConvertListItemItineryIdToInteger(theListItem.attr('id'));

    var deletedObj = markers.splice(itineryIndex,1)[0];
    console.log(deletedObj);
    for( var i = itineryIndex; i < markers.length; ++i )
    {
        console.log("Relabelling " + markers[i].theListItem.attr('id') + " to " + 'itinery_item_' + i);
        markers[i].theListItem.attr('id', 'itinery_item_' + i);
    }

    theListItem.remove();
    deletedObj.theMarker.setMap(null);
    deletedObj.theGeocodeResult = null;
    deletedObj.theListItem = null;
    calcRoute();
}

function ClickTripItem(theListItem)
{
    var itineryIndex = ConvertListItemItineryIdToInteger(theListItem.attr('id'));

    theListItem.children('div').slideToggle();


    // nah! need to do this differently it doesn't work as I'd like it too
    var marker = markers[itineryIndex].theMarker;
    if (marker.getAnimation() != null)
    {
        marker.setAnimation(null);
    } else
    {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

function codeAddress()
{
    var address = $('#address').val();
    console.log("Coding address " + address);
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

                var newSpan = $('<span style="position: absolute; right:0; margin-right: 10px;"></span>');
                var newDeleteLink = $('<a href="#">Delete</a>');
                newDeleteLink.click( function() { DeleteTripItem($(this).parent().parent()); } );
                newSpan.append(newDeleteLink);

                var newLi = $('<li style="border: 2px solid blue;" id="itinery_item_' + markers.length + '">' + address + '</li>');
                newLi.append(newSpan);
                newLi.append(newDiv);
                newLi.click( function() { ClickTripItem($(this)); } );

                $("#sortable").append(newLi);
                markers.push({theMarker: marker, theGeocodeResult: results[0], theListItem: newLi});
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

    /* The sortable object can return an ordered array or the sorted element id strings. Each string is of the form
     * "itinery_item_<num>" where <num> provides the index into the `markers[]` global array that corresponds to this
     *  element. Therefore go through the array and strip the prefix and parse the integer suffix to get an array of
     *  indicies into the `markers[]` global.... */
    var locationsInOrder = jQuery.map( $("#sortable").sortable("toArray"), function(val, indx) { return ConvertListItemItineryIdToInteger(val); } );
    console.log("Locations in order are:");
    console.log(locationsInOrder);

    /* Begin to construct the route between all the itinery items. The item order is in the `locationsInOrder[]` array.
     * Therefore locationsInOrder[0] is the first itinery stop, locationsInOrder[1] is the second itinery stop and so
     * on. The value of locationsInOrder[x] gives the index into the array markers[] which holds the marker that
     * corresponds to this itinery item. */
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