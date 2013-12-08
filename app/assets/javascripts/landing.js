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

                        if( myTagName == "INPUT" || myTagName == "TEXTAREA" )
                        {
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
