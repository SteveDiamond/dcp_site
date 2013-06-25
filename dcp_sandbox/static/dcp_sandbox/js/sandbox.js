/**
 * Sandbox Module
 * Handles control flow for interacting with the parse tree.
 */
(function($, numeric) {
    $().ready(function(){
        // http://stackoverflow.com/questions/7335780/how-to-post-a-django-form-with-ajax-jquery
        $('#expression').submit(function() { // catch the form's submit event
            $.ajax({ // create an AJAX call...
                data: $(this).serialize(), // get the form data
                type: $(this).attr('method'), // GET or POST
                url: $(this).attr('action'), // the file to call
                success: function(response) { // on success..
                    var root = JSON.parse(response); // Load parse tree
                    var numNodes = TreeConstructor.augmentTree(root, 0); // Add short_name nodes and number nodes.
                    // Map distance from root to list of nodes in left to right order.
                    var levels = [];
                    TreeConstructor.generateLevels(root, levels, 0);
                    // Get node box widths
                    var widths = [];
                    TreeLayout.getWidths(root, widths);
                    // Returns [P,RNode,RWidth, RSib] where Px = 0, RNodex >= RWidthw + SEPARTION*1
                    // Sib used for optimization objective.
                    var relationMatrices = TreeLayout.getRelations(root, numNodes, levels);
                    var P = relationMatrices[0], RNode = relationMatrices[1],
                    RWidth = relationMatrices[2], Sib = relationMatrices[3];
                    // Formats layout problem as LP
                    var data = TreeLayout.getCenters(P, RNode, RWidth, Sib, widths, numNodes, root, levels);
                    // Solves LP to get box centers with minimum tree width.
                    // Then draws tree.
                    getLayout(data, root, numNodes, levels, widths);
                }
            });
            return false;
        });
    });

    /**
     * Solve the LP server side to determine the layout.
     * Then draw the tree on callback.
     * http://stackoverflow.com/questions/4342926/how-can-i-send-json-data-to-server
     */
    function getLayout(data, root, numNodes, levels, widths) {
        $.ajax({ // create an AJAX call that handles CSRF
            crossDomain: false,
            beforeSend: function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
            },
            url: 'solveLP',
            type: 'POST',
            contentType:'application/json',
            data: JSON.stringify(data),
            dataType:'json',
            success: function(response) {
                var x = response;
                var centers = x.slice(0,numNodes);
                var treeWidth = x[numNodes];
                $(TreeConstants.TREE_DIV).html(''); // Clear old tree
                TreeDisplay.drawTree(TreeConstants.TREE_DIV, root, numNodes, levels, widths, centers, treeWidth); // update the DIV
            }
        });
        return false;
    }
}(jQuery, numeric));