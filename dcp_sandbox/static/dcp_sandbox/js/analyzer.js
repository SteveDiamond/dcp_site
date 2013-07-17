/**
 * Analyzer Module
 * Handles page load for analyzer.
 */
(function($) {
    $().ready(function(){
        // Nodes in the parse tree can be edited.
        TreeConstructor.editable = true;
        // Show prompt.
        var promptTree = {
                         name: TreeConstants.PROMPT,
                         isPrompt: true,
                        };
        TreeConstructor.processParseTree(promptTree);
    });
}(jQuery));