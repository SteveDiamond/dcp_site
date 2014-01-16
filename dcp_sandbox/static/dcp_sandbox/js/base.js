// Base module for all pages.
(function($) {
    $().ready(function(){
        // Feedback button sends email.
        $("button.feedback").click(function() {
            var message = $("textarea.feedback").val();
            if (message.length > 0) {
                $.ajax({ // create an AJAX call...
                    crossDomain: false,
                                beforeSend: function(xhr, settings) {
                                    xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
                                },
                    url: 'send_feedback',
                    type: 'POST',
                    data: {text: message},
                });
            }
        })
    });
}(jQuery));