var _myTrips = [];

function CreateTripActionImageLink(operation, callback)
{
    var theLink = $('<a href="#"></a>');
    var theImg  = $('<img alt="' + operation + '" src="/assets/' + operation + '-icon.png" width="25" height="25">');

    theLink.attr("indx", _myTrips.length);
    theLink.click(callback);
    theLink.append(theImg);

    return theLink;
}

function AppendTripTableRow(theTrip)
{
    console.log("Appending to table at index " + _myTrips.length + "...");
    console.log(theTrip);

    var tripsTable = $("#TripsTable");
    var tripsTableBody = tripsTable.children("tbody");
    var tblRow = $('<tr></tr>');
    var titleTd = $('<td>'+ theTrip.name +'</td>');
    var linkTd = $('<td></td>');

    linkTd.append( CreateTripActionImageLink("edit", function() { InitTripDialog($(this).attr("indx"), "Edit").dialog("open"); }) );
    linkTd.append( CreateTripActionImageLink("view", function() { window.location = "/trips/" + theTrip.id }) );
    linkTd.append( CreateTripActionImageLink("delete", function() { InitDeleteTripDialog($(this).attr("indx")).dialog("open"); }) );

    tblRow.append(titleTd);
    tblRow.append(linkTd);
    tripsTableBody.append( tblRow );

    theTrip['tblRow'] = tblRow;
    _myTrips.push(theTrip);
}

function LoadTrips()
{
    $.ajax({
        type: 'post',
        url: '/trips/find',
        data: { user_id: _myUserId },
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function(data) {
            var tripsTable = $("#TripsTable");
            var tripsTableBody = tripsTable.children("tbody");

            console.log("LOAD TRIPTS SUCCESS");
            console.log(data);

            // Empty the trips table to delete the "loading" message and paste in the actual trips
            _myTrips = []; // Maybe better to use `A.length = 0;` - not sure - http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
            tripsTableBody.empty();
            jQuery.each(data, function(index, tripObject) { AppendTripTableRow(tripObject); });
        },
        error: function(jqXHR, status, error) {
            tripsTableBody.empty();
            tripsTableBody.append( $('<tr><td colspan="2">Error loading your trip list!</td></tr>') );
        }
    });
}

function InitDeleteTripDialog(indx)
{
    console.log(indx);
    var deleteTripDialogDiv =  $( "#DeleteTripDialog" );
    deleteTripDialogDiv.dialog({
        resizable: false,
        height:175,
        width:400,
        modal: true,
        title: "Really delete trip " + _myTrips[indx].name,
        buttons: {
            "Delete trip!": function() {
                console.log("DELETE");
                $.ajax({
                    type: 'post',
                    url: '/trips/' + _myTrips[indx].id,
                    async: false,
                    data: { _method : "delete" },
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    dataType: 'json',
                    success: function(data) {
                        console.log("Success deleting trip...");
                        console.log(data);

                        // The trip has been deleted on the server side so lets remove it from the list on the
                        // web page client side
                        _myTrips[indx]['tblRow'].remove();
                        $("#DeleteTripDialog").dialog("destroy");
                    },
                    error: function(jqXHR, status, error) {
                        console.log("status: " + status + "\nerror: " + error);
                    }
                });

                $( this ).dialog( "destroy" );
            },
            Cancel: function() {
                $( this ).dialog( "destroy" );
            }
        }
    });

    return deleteTripDialogDiv;
}

function InitTripDialog(ref, command)
{
    var dialogTitle = "";
    var tripDialogDiv = $("#TripDialog");
    var isAnEdit = command == "Edit";

    if(command != "Edit" && command != "Create")
    {
        console.log("Invalid use of function InitTripDialog()");
        return;
    }

    if( isAnEdit )
    {
        dialogTitle = "Edit the trip " + _myTrips[ref].name + "(" + _myTrips[ref].id + ")";
    }
    else
    {
        dialogTitle = "Create a new trip";
    }

    console.log("Creating trip dialog for " + command);
    tripDialogDiv.dialog({
        title: dialogTitle,
        autoOpen: false,
        width: 350,
        modal: true,
        draggable: false,
        open: function() {
            var messageDiv =  $('#TripDialogMessage');
            var tripFormDiv =  $('#TripDialogForm');
            var tripForm = tripFormDiv.children('form');

            tripForm.children().each(
                function(indx, el) {
                    var me = $(this);
                    var myTagName = me.prop('tagName');
                    if( myTagName == "INPUT" || myTagName == "TEXTAREA" )
                    {
                        if( isAnEdit )
                        {
                            $("#name").val(_myTrips[ref].name);
                            $("#description").val(_myTrips[ref].description);
                            $("#published").prop("checked", _myTrips[ref].published);
                        }
                        else
                        {
                            $("#name").val("");
                            $("#description").val("");
                            $("#published").prop("checked", false);
                        }
                    }
                });
        },
        buttons: {
            "Do it...": function() {
                var jsonObj = {};
                var messageDiv =  $('#TripDialogMessage');
                var tripFormDiv =  $('#TripDialogForm');
                var tripForm = tripFormDiv.children('form');

                jsonObj["trip[user_id]"]     = $("#user_id").val();
                jsonObj["trip[name]"]        = $("#name").val();
                jsonObj["trip[description]"] = $("#description").val();
                jsonObj["trip[published]"]   = $("#published").prop("checked");
                jsonObj["_method"]           = isAnEdit ? "put" : "post";

                $.ajax({
                    type: 'post',
                    url: isAnEdit ? '/trips/' + _myTrips[ref].id : '/trips/create',
                    async: false,
                    data: jsonObj,
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    dataType: 'json',
                    success: function(data) {
                        console.log("Success " + (isAnEdit ? "editing" : "creating") + " trip...");
                        if( isAnEdit )
                        {
                            _myTrips[ref].name = jsonObj["trip[name]"];
                            _myTrips[ref].description = jsonObj["trip[description]"];
                            _myTrips[ref].published = jsonObj["trip[published]"];
                        }
                        else
                        {
                            AppendTripTableRow(data);
                        }

                        $("#TripDialog").dialog("destroy");
                    },
                    error: function(jqXHR, status, error) {
                        console.log("status: " + status + "\nerror: " + error);
                    }
                });


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


$(function() {
    console.log("Initialising the landing page...");
    $("#NewTripLink").click(function() {  InitTripDialog(null, "Create").dialog("open"); });
    $("#tabs").tabs({ heightStyle: "fill" });
    LoadTrips();
});


