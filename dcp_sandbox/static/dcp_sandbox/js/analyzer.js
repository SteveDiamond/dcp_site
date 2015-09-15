/**
 * Analyzer Module
 * Handles page load for analyzer.
 */


// Nodes in the parse tree can be edited.
TreeConstructor.editable = true;

function showTreeFromUrl() {
    var query = location.search;
    var len = TreeConstants.URL_QUERY_PREFIX.length

    if (query.substr(0, len) == TreeConstants.URL_QUERY_PREFIX) {
	var expression = decodeURIComponent(query.substr(len));
	TreeConstructor.createParseTree(expression, TreeConstants.ROOT_TAG);
    } else {
	// Show the prompt
	var promptTree = {
            name: TreeConstants.PROMPT,
            isPrompt: true,
	};
	TreeConstructor.leafLegendText = TreeConstants.PROMPT_LEAF_LEGEND;
	TreeConstructor.promptActive = true;
	TreeConstructor.processParseTree(promptTree);
    }
}

(function($) {
    $(window).on('popstate', function(event) {
	showTreeFromUrl();
    });

    $().ready(function(){
	showTreeFromUrl();
    });
}(jQuery));
