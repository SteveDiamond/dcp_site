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
        // Creates and saves a list of possible tokens for autocomplete.
        savePossibleTokensList();
        // Show prompt.
        var promptTree = {
                         name: TreeConstants.PROMPT,
                         isPrompt: true,
                        };
        TreeConstructor.processParseTree(promptTree);
    });
    
    /**
     * Creates and saves a list of possible tokens for autocomplete.
     */
    savePossibleTokensList = function() {
        var possibleTokens = TreeConstants.VARIABLES;
        possibleTokens = possibleTokens.concat(TreeConstants.PARAMETERS);
        possibleTokens = possibleTokens.concat(TreeConstants.OPERATORS);
        $(".function-example").each(function() { 
            possibleTokens.push( $.trim( $(this).text() ) );
        })
        TreeDisplay.possibleTokens = possibleTokens;
    }
}(jQuery));