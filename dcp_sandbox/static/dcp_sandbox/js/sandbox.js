/**
 * Sandbox Module
 * Handles page load for analyzer.
 */
(function($) {
    $().ready(function(){
        // Listen to help toggle button.
        $("#help").click(function() {
            TreeConstructor.helpActive = !TreeConstructor.helpActive;
            TreeConstructor.processParseTree(TreeConstructor.root); 
        });
        // Enable function selection.
        $(window).bind('hashchange', function(e) {
            var atom = window.location.hash;
            var hashIndex = atom.indexOf("#");
            if (hashIndex != -1 && atom.length > 1) {
                window.location.hash = "";
                TreeConstructor.parseObjective( atom.substr(hashIndex + 1) );
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