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
        // Enable function selection.
        $(window).bind('hashchange', function(e) {
            var atom = window.location.hash;
            var hashIndex = atom.indexOf("#");
            if (hashIndex != -1 && atom.length > 1) {
                window.location.hash = "";
                atom = atom.substr(hashIndex + 1);
                // Add the atom or replace the prompt.
                if (TreeConstructor.promptActive) {
                    var objective = atom;
                } else {
                    var objective = TreeConstructor.root.name + "+" + atom;
                }
                TreeConstructor.parseObjective(objective);
            }
        });
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