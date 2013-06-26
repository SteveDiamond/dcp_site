/**
 * Sandbox Module
 * Handles control flow for interacting with the parse tree.
 */
(function($, numeric) {
    $().ready(function(){
        var dummyTree = {
                         name: TreeConstants.PROMPT,
                         isPrompt: true,
                        };
        TreeConstructor.processParseTree(dummyTree);
    });
}(jQuery, numeric));
//"log(square(z)) - log_sum_exp(2*x*z, -square(y)) + (norm(x,3) + log(y))"