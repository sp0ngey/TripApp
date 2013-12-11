var _myTrips;

function LoadTrips()
{
    $.ajax({
        type: 'post',
        url: '/trips/find',
        data: { user_id: _myUserId},
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function(data) {
            var tripsTable = $("#TripsTable");
            var tripsTableBody = tripsTable.children("tbody");

            // Store the returned data in the global variable `_myTrips` for use by this page's functions
            // `_myTrips` is just a list of Trip objects as defined by the Trip table
            _myTrips = data;

            // Empty the trips table to delete the "loading" message and paste in the actual trips
            tripsTableBody.empty();
            jQuery.each(_myTrips, function(index, value) {
                var editImg = $('<img alt="Edit" src="/assets/edit-icon.png" width="25" height="25">');
                var deleteImg = $('<img alt="Delete" src="/assets/delete-icon.png" width="25" height="25">');
                var tblRow = $('<tr></tr>');
                var titleTd = $('<td>'+ value.name +'</td>');
                var linkTd = $('<td></td>');
                var editLink = $('<a href="#"></a>');
                var deleteLink = $('<a href="#"></a>');

                editLink.append(editImg);
                $(editLink).click( function() { alert("This doesn't work yet..."); InitTripDialog(index, "Edit").dialog("open"); } );
                linkTd.append(editLink);

                $(deleteLink).click( function() { alert("This doesn't work yet..."); } );
                deleteLink.append(deleteImg);
                linkTd.append(deleteLink);

                tblRow.append(titleTd);
                tblRow.append(linkTd);
                tripsTableBody.append( tblRow );
            });
        },
        error: function(jqXHR, status, error) {
            tripsTableBody.empty();
            tripsTableBody.append( $('<tr><td colspan="2">Error loading your trip list!</td></tr>') );
        }
    });
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
        buttons: {
            "Do it!": function() {
                var jsonObj = {};
                var messageDiv =  $('#TripDialogMessage');
                var tripFormDiv =  $('#TripDialogForm');
                var tripForm = tripFormDiv.children('form');

                tripForm.children().each(
                    function(indx, el) {
                        var me = $(this);
                        var myTagName = me.prop('tagName');
                        if( myTagName == "INPUT" || myTagName == "TEXTAREA" )
                        {
                            var name = "trip[" + me.attr('name') + "]";
                            jsonObj[name] = me.val();
                        }
                        else if( myTagName == "HIDDEN" )
                        {
                            jsonObj[me.attr('name')] = me.val();
                        }
                    } );

                $.ajax({
                    type: 'post',
                    url: isAnEdit ? '/trips/update/' + _myTrips[ref].id : '/trips/create',
                    async: false,
                    data: jsonObj,
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    dataType: 'json',
                    success: function(data) {
                        console.log("Success adding or editing trip...");
                        console.log(data);
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


