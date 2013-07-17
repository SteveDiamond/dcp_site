/**
 * Analyzer Module
 * Handles page load for analyzer.
 */
(function($) {
    $().ready(function(){
        // Show prompt.
        var promptTree = {
                         name: TreeConstants.PROMPT,
                         isPrompt: true,
                        };
        TreeConstructor.processParseTree(promptTree);
    });
}(jQuery));