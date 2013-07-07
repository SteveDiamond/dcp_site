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
        // Show prompt.
        var promptTree = {
                         name: TreeConstants.PROMPT,
                         isPrompt: true,
                        };
        TreeConstructor.processParseTree(promptTree);
    });
}(jQuery));