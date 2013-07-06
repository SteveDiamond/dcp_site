/**
 * Sandbox Module
 * Handles control flow for interacting with the parse tree.
 */
(function($) {
    $().ready(function(){
        var promptTree = {
                         name: TreeConstants.PROMPT,
                         isPrompt: true,
                        };
        TreeConstructor.processParseTree(promptTree);
    });
}(jQuery));