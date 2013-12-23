var geocoder;
var map;          /*< This is the main map displayed to show the trip start/stop and waypoints...               */
var selectionMap; /*< used when there is more than one result from the geocode. Only shown on the choice dialog */

/* An array of markers on the google map. This array is in the order that the user created locations and doesn't
 * necessarily have the same order as the final result in the "sortable" itinery list. See the comments in codeAddress()
 * for more information... */
var markers = [];
var directionsRenderer;
var directionsService;

var dataTmpTODO;

/*
 * When the sortable LI is dragged the CKEditor goes a little bit whacky because the DOM structure is changed. The
 * solution is to save the contents of the editor, destroy it, then when the drag finishes, re-create the editor and
 * restore it's contents...
 *
 * See also SortableHasMovedSoRestoreCKEditorContent()
 */
function SortableIsMovingSoSaveCKEditorContent(ui)
{
    console.log(ui);

    var sortableItem = $(ui.item[0]);
    var itineryId = sortableItem.prop('id');
    var editorId = "editor_" + itineryId + "_ckeditor";
    var editor = CKEDITOR.instances[editorId];
    var editorDiv = sortableItem.children('div');

    console.log(sortableItem.parent());
    console.log(sortableItem.position());

    sortableItem.css('height', 'auto'); // Make sure it shrinks during dragging
    editorDiv.slideUp(0, function() { console.log("Slide up finsihed"); });

    console.log(sortableItem.position());

    dataTmpTODO = editor.getData();
    editor.destroy();
    console.log(dataTmpTODO);
}

/*
 * See also SortableIsMovingSoSaveCKEditorContent()
 */
function SortableHasMovedSoRestoreCKEditorContent(ui)
{
    var sortableItem = $(ui.item[0]);

    var itineryId = sortableItem.prop('id');
    var editorId = "editor_" + itineryId + "_ckeditor";

    var editor = CKEDITOR.replace(itineryId + "_ckeditor");
    console.log($(itineryId + "_ckeditor"));
    console.log(editor);
}

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
    deletedObj.theGeocodeResult = null;
    deletedObj.theListItem = null;
    calcRoute();
}

function ClickTripItem(theListItem)
{
    theListItemEditorDiv = theListItem.children('div');
    console.log(theListItem.position());
    console.log(theListItem.parent());
    if( theListItemEditorDiv.is(":visible") )
    {
        console.log("Slide up");
        theListItemEditorDiv.slideUp();
        //theListItem.draggable('enable');
    }
    else
    {
        console.log("Slide down");
        theListItemEditorDiv.slideDown();
        //theListItem.draggable('disable');
    }
}

/*
function AddGeocodeLocationToTrip(theGeocodeResult)
{
    // Create some ID strings that will be assigned to elements of the cloned LI so that they can be referenced
    // more readily later...
    var itineryId ="itinery_item_" + markers.length;
    var editorId = itineryId + "_ckeditor";

    // Clone the template list item and set its unique identifier...
    var newLi = $('#ItineryItemTemplate').clone();
    newLi.prop('id', itineryId);

    // Now set ID's for other important elements to make later lookup easier...
    var liChildren = newLi.children();
    for( var i=0; i < liChildren.length; ++i )
    {
        var thisChild = liChildren[i];
        var thisChildTagName = thisChild.prop("tagName");
        var thisChildClass   = thisChild.attr("class");
        if( thisChildTagName == "SPAN")
        {
            switch( thisChildClass )
            {
                case "ItineryTitleText":
                    break;
                case "ItineryLegInfo":
                    break;
                case "ItineryLegTiming":
                    break;
                case "ItineryLinks":
                    break;
            }
        }
        else if( thisChildTagName == "DIV")
        {
        }
    }

}
*/

function TripItemDatesChanged(dateText, objInstance)
{
    // Navigate up to the containing span so that we can access the date of both date pickers...
    var datesSpan = $(objInstance.input[0]).parent("span");
    var listItem  = datesSpan.parent("li");
    if (typeof datesSpan === "undefined" || typeof listItem === "undefined") {
        return;
    }

    // Save a reference to each date picker...
    var datePickersArray = datesSpan.find('input');
    if( datePickersArray.length < 2 ) {
        return;
    }

    var startDatePick = null;
    var endDatePick = null;
    if( $(datePickersArray[0]).attr('class').search('ItineryStartDate') >= 0 )
    {
        startDatePick = $(datePickersArray[0]);
        endDatePick   = $(datePickersArray[1]);
    }
    else
    {
        startDatePick = $(datePickersArray[1]);
        endDatePick   = $(datePickersArray[0]);
    }

    // Make sure the start date is before the end date
    var startDate = startDatePick.datepicker( "getDate" );
    var endDate   = endDatePick.datepicker( "getDate" );

    // Get the difference between the dates and add the duration summary to the list item summary span...
    console.log("Start date is " + startDate);
    console.log("End date is " + endDate);

    if( !startDate || !endDate ) {
        return;
    }

    if( startDate >= endDate )
    {
        console.log("ERROR: The start date must be before the end date!");
        listItem.css("background-color", "red");
        return;
    }
    else
    {
        listItem.css("background-color", "white");
    }
}

function AddGeocodeLocationToTrip(theGeocodeResult)
{
    map.setCenter(theGeocodeResult.geometry.location);

    var itineryId ="itinery_item_" + markers.length;
    var editorId = itineryId + "_ckeditor";

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ----- START EXPANDABLE DIV CREATION
    // Create the divider that will house all expandable content
    var newDiv = $('<div style="display:none; border: 1px solid red; top: 0; left: 0;"></div>');

    //
    // Create the date pickers and containing paragraphs and span. Append enclosing span to div
    var datesSpan = $('<span></span>');
    var startDate = $('<input type="text" size="30" style="display: inline;">');
    var endDate = startDate.clone();
    startDate.addClass('ItineryStartDate');
    endDate.addClass('ItineryEndDate');
    startDate.datepicker({ onClose: function(dateTxt, objInst) {TripItemDatesChanged(dateTxt, objInst);} });
    endDate.datepicker({ onClose: function(dateTxt, objInst) {TripItemDatesChanged(dateTxt, objInst);} });

    var startPar = $('<p>Start: </p>');
    startPar.append(startDate);
    var endPar = $('<p>End: </p>');
    endPar.append(endDate);

    datesSpan.append(startPar);
    datesSpan.append(endPar);
    newDiv.append(datesSpan);

    //
    // Create the text area that will be used by CKEditor. Append to div
    // theGeocodeResult.geometry.location.lat()
    // theGeocodeResult.geometry.location.lng()
    var newEditor = $('<textarea id="editor_' + editorId + '"name="' + editorId + '"></textarea>');
    newDiv.append(newEditor);
    console.log("Initialising CKEditor...");
    // ----- END EXPANDABLE DIV CREATION


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ----- START LIST ITEM CREATION
    // The ID of the list is important because it will be used in the sortable UL which will be able to return an
    // array of IDs in the order sorted by the user. We will use this array of IDs to figure out the order of trip
    // items. The id is of the form `itinery_item_<num>` where <num> will be the index into markers[] for the info
    // that corresponds to that LI.
    var newLi = $('<li id="itinery_item_' + markers.length + '">' + theGeocodeResult.formatted_address + '</li>');

    //
    // Create the trip leg information span that will hold ???
    var legSpan = $('<span name="legInfo"></span>');
    legSpan.addClass("ItineryLegInfo");
    newLi.append(legSpan);

    //
    // Create the trip duration span that will hold the distance and time from the previous stop
    var legDurationSpan = $('<span name="legDuration"></span>');
    newLi.append(legDurationSpan);

    //
    // Create a span to hold the delete/expand links for this LI to control the child DIV visibility
    var newSpan = $('<span style="position: absolute; right:0; margin-right: 10px;"></span>');
    var newDeleteLink = $('<a href="#">Delete</a>');
    newDeleteLink.click( function() { DeleteTripItem($(this).parent().parent()); } );
    newSpan.append(newDeleteLink);

    newSpan.append(" | ");

    var newExpandLink = $('<a href="#">Expand</a>');
    newExpandLink.click( function() { ClickTripItem(newLi); } );
    newSpan.append(newExpandLink);

    newLi.append(newSpan);
    newLi.append(newDiv);

    //
    // Initialise the sortabl list
    $("#sortable").append(newLi);

    //
    // Shove the geocode result and a stash reference to the list item in the markers array
    markers.push({theGeocodeResult: theGeocodeResult, theListItem: newLi});
    calcRoute();

    //
    // Finally, now that the text area exists in the body of the page it can be initialised by CKEditor functions...
    console.log("Creating editor from textarea with id " + editorId);
    CKEDITOR.replace( editorId );
}


function DoLocationGeocode()
{
    var searchButton = $('#SearchButton');
    searchButton.attr("disabled", "disabled");

    var searchMsgSpan = $('#SearchingMessage');
    searchMsgSpan.show();

    var address = $('#address').val();
    console.log("Coding address " + address);
    geocoder.geocode(
        { 'address': address
        },
        function(results, status)
        {
            searchMsgSpan.hide();
            searchButton.removeAttr("disabled");
            if (status == google.maps.GeocoderStatus.OK)
            {
                console.log("The results object from the geo code is as follows...");
                console.log(results);

                if(results.length > 1 )       { CreateGeocodeResultsDialog(results).dialog("open"); }
                else if(results.length == 1 ) { AddGeocodeLocationToTrip(results[0]); }
                else                          { alert('Not found'); }
            }
            else
            {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
}

function GetLocationsInOrder()
{
    /* The sortable object can return an ordered array or the sorted element id strings. Each string is of the form
     * `itinery_item_<num>` where <num> provides the index into the `markers[]` global array that corresponds to this
     *  element. Therefore go through the array and strip the prefix and parse the integer suffix to get an array of
     *  indicies into the `markers[]` global.... */
    return jQuery.map(
        $("#sortable").sortable("toArray"),
        function(val, indx) { return ConvertListItemItineryIdToInteger(val); }
    );
}

function calcRoute()
{
    console.log("Calculating route...");
    if( markers.length < 1 )
    {
        console.log("There are no markers available... not enough to plot a route!");
        directionsRenderer.setMap(null);
        map.setZoom(0);
        return;
    }

    for(var i = 0; i < markers.length; ++i)
    {
        markers[i].theListItem.children('span[name="legInfo"]').
            empty().
            html('<img src="/assets/ajax-loader1.gif">').
            show();
    }


    var locationsInOrder = GetLocationsInOrder();

    /* Begin to construct the route between all the itinery items. The item order is in the `locationsInOrder[]` array.
     * Therefore locationsInOrder[0] is the first itinery stop, locationsInOrder[1] is the second itinery stop and so
     * on. The value of locationsInOrder[x] gives the index into the array markers[] which holds the marker that
     * corresponds to this itinery item. */
    var wayPoints = [];
    var startMarker = markers[locationsInOrder[0]];
    var endMarker   = markers[locationsInOrder[locationsInOrder.length - 1]];
    console.log("   Starting at " + startMarker.theGeocodeResult.formatted_address);
    console.log("   Ending at " + endMarker.theGeocodeResult.formatted_address);

    for (var i = 1; i < locationsInOrder.length - 1; i++)
    {
        var locIndexIntoMarkers = locationsInOrder[i];
        var thisMarker = markers[locIndexIntoMarkers];
        console.log("      Adding waypoint " + thisMarker.theGeocodeResult.formatted_address);
        wayPoints.push( {location: thisMarker.theGeocodeResult.geometry.location, stopover: true} );
    }

    var request = {
        origin: startMarker.theGeocodeResult.geometry.location,
        destination: endMarker.theGeocodeResult.geometry.location,
        waypoints: wayPoints,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK)
        {
            directionsRenderer.setDirections(response);
            directionsRenderer.setMap(map);
            console.log(response);

            if( response.routes.length > 0 )
            {
                markers[locationsInOrder[0]].theListItem.children('span[name="legInfo"]').
                    empty().
                    hide();
                if( markers.length > 1 )
                {
                    var routeLegs = response.routes[0].legs;
                    for(var i = 0; i < routeLegs.length; ++i)
                    {
                        var thisLeg = routeLegs[i];
                        console.log("Adding in information for leg from " +  thisLeg.start_address + " to " + thisLeg.end_address);

                        var locIndexIntoMarkers = locationsInOrder[i+1]; // +1 coz start isn't a leg
                        var thisMarkerLi = markers[locIndexIntoMarkers].theListItem;
                        console.log(thisMarkerLi);
                        thisMarkerLi.children('span[name="legInfo"]').
                            html(thisLeg.distance.text + ", " + thisLeg.duration.text).
                            show();
                    }
                }
            }
        }
        else
        {
            alert("FUCKERY because " + status);
        }
    });
}

function CreateGeocodeResultsDialog(geocodeResults)
{
    console.log("Running CreateGeocodeResultsDialog()");
    var tripDialogDiv = $( '#GeocodeResultsDialog');
    tripDialogDiv.dialog({
        title: "Multiple possibilities found...",
        autoOpen: false,
        width: 350,
        modal: true,
        draggable: false,
        open: function() {
            /* As the dialog is opened, clear any previous results choices and render new ones based on the
             * possible choices from the returned geocode results for this search... */
            console.log("Firing open event for choices dialog");
             var choicesForm = $('#GeocodeResultsChoices');
            choicesForm.empty();
            for(var i = 0; i < geocodeResults.length; ++i)
            {
                var thisGeoChoice = geocodeResults[i];
                var newChoice = $('<input type="radio" name="geoChoice" value="' + i + '">' + thisGeoChoice.formatted_address + '<br>');

                choicesForm.append(newChoice);
            }
        },
        buttons: {
            "Add": function() {

                var selectedRadio = $('input[name=geoChoice]:radio:checked');
                var choiceIndex = parseInt(selectedRadio.val());

                if( isNaN(choiceIndex) )
                {
                    alert("Error: The choice selection failed for an unknown reason");
                }
                else
                {
                    AddGeocodeLocationToTrip(geocodeResults[choiceIndex]);
                }
                $( this ).dialog( "destroy" );
            },
            Cancel: function() {
                $( this ).dialog( "destroy" );
            }
        },
        close: function() {
            $( this ).dialog( "destroy" );
        }
    });

    return tripDialogDiv;
}

function SaveTrip()
{
    console.log("Attempting to save trip!");
    var tripObj = [];
    var locationsInOrder = GetLocationsInOrder();

    for(var i = 0; i < locationsInOrder.length; ++i)
    {
        var thisMarker = markers[locationsInOrder[i]];
        console.log(thisMarker);
    }
}

$(function() {
    console.log("Initialising trips map stuff...");
    $( "#sortable" ).sortable({
        containment: 'parent',
        cursor: 'move',
        start:  function(event, ui) { SortableIsMovingSoSaveCKEditorContent(ui); },
        stop:   function(event, ui) { SortableHasMovedSoRestoreCKEditorContent(ui); },
        update: function(event, ui) { calcRoute(); }
    });
    $( "#sortable" ).disableSelection();
    $( "#sortable" ).accordion();

    CreateGeocodeResultsDialog([]);

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

    selectionMap = new google.maps.Map(document.getElementById('GeocodeResultsMap'));

    $('#TripSave').click ( function() { SaveTrip() } );


    var address = $('#address');
    address.val("Portsmouth, uk");
    DoLocationGeocode();
    address.val("Southampton, uk");
    DoLocationGeocode();
    address.val("Northampton, uk");
    DoLocationGeocode();
    address.val("Manchester, uk");
    DoLocationGeocode();
    address.val("Glasgow, uk");
    DoLocationGeocode();


});
