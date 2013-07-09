/**
 * Sandbox Module
 * Handles page load for analyzer.
 */
(function($) {
    $().ready(function(){
        // Listen to help toggle button.
        $("#help").click(function() {
            TreeConstructor.helpActive = !TreeConstructor.helpActive;
            $("#help").text(TreeConstants.HELP_BUTTON_TEXT[TreeConstructor.helpActive]);
            TreeConstructor.processParseTree(TreeConstructor.root);
        });
        // Transform mathematical definitions in LateX to images.
        $(".latex").latex();
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
        // Show prompt.
        var promptTree = {
                         name: TreeConstants.PROMPT,
                         isPrompt: true,
                        };
        TreeConstructor.processParseTree(promptTree);
    });
}(jQuery));