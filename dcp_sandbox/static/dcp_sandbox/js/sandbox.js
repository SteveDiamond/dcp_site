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
        // Show prompt.
        var promptTree = {
                         name: TreeConstants.PROMPT,
                         isPrompt: true,
                        };
        TreeConstructor.processParseTree(promptTree);
    });
}(jQuery));