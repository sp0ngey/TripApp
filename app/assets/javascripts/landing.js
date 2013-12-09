function InitTripDialog()
{
    var tripDialogDiv = $("#TripDialog");

    tripDialogDiv.dialog({
        autoOpen: false,
        width: 350,
        modal: true,
        draggable: false,
        buttons: {
            "Create": function() {
                var jsonObj = {};
                var messageDiv =  $('#TripDialogMessage');
                var tripFormDiv =  $('#TripDialogForm');
                var tripForm = tripFormDiv.children('form');

                tripForm.children().each(
                    function(indx, el) {
                        var me = $(this);
                        var myTagName = me.prop('tagName');
                        console.log("Processing element of type " + myTagName);

                        if( myTagName == "INPUT" || myTagName == "TEXTAREA" )
                        {
                            var name = "trip[" + me.attr('name') + "]";
                            console.log("Processing element " + name);
                            jsonObj[name] = me.val();
                        }
                        else if( myTagName == "HIDDEN" )
                        {
                            console.log("Processing HIDDEN element " + me.attr('name'));
                            jsonObj[me.attr('name')] = me.val();
                        }
                    } );

                $.ajax({
                    type: 'post',
                    url: '/trips/create',
                    async: false,
                    data: jsonObj,
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    dataType: 'json',
                    success: function(data) {
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
    $("#NewTripLink").click(function() {  InitTripDialog().dialog("open"); });
    $("#tabs").tabs({ heightStyle: "fill" });
});


