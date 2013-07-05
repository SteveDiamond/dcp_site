/**
 * Handles drawing the parse tree and clicking to edit text.
 */
function TreeDisplay() {

}

/**
 * Solve the LP server side to determine the layout.
 * Then draw the tree on callback.
 * http://stackoverflow.com/questions/4342926/how-can-i-send-json-data-to-server
 */
TreeDisplay.getLayout = function(data, root, numNodes, levels, widths) {
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

/**
 * Draws the parse tree.
 */
TreeDisplay.drawTree = function(location, root, numNodes, levels, widths, centers, treeWidth) {
    // Inspired by http://bl.ocks.org/mbostock/1093025
    var numLevels = levels.length;
    var treeHeight = numLevels*TreeConstants.BOX_HEIGHT + (numLevels-1)*TreeConstants.VERT_SEP + 2*TreeConstants.EDGE_VERT_SEP;

    var svg = d3.select(location).append("svg:svg")
        .attr("width", treeWidth)
        .attr("height", treeHeight)

    for (var i=0; i < numLevels; i++) {
        // Draw nodes
        var nodeEnter = svg.selectAll("level"+i)
            .data(levels[i])
            .enter()
            .append("svg:g")
            .attr("class", "node")
            .attr("id", function(d) { return d.tag; })
            .attr("transform", function(d) { return "translate(" + (centers[d.tag] - 0.5*widths[d.tag]) +
                                                    "," + TreeDisplay.getLevelY(i) + ")"; })

        nodeEnter.append("svg:rect")
            .attr("width", function(d) { return widths[d.tag]; })
            .attr("height", TreeConstants.BOX_HEIGHT)

        nodeEnter.append("svg:text")
            .attr("dy", TreeConstants.BOX_HEIGHT/2)
            .attr("dx", TreeDisplay.getTextMargin)
            .text(function(d) { return d.name; })
        
        // Draw links
        TreeDisplay.drawLinks(svg, i, levels, centers);

        // Draw curvature and sign symbols
        TreeDisplay.drawSymbols(svg, nodeEnter, widths);
    }

    svg.selectAll("text").on("click", TreeDisplay.createInputBox);
}

/**
 * Covers the rect with an input box containing the text.
 * Updates the overall expression to reflect local changes.
 */
TreeDisplay.createInputBox = function() {
    var id = this.parentElement.id;
    var textElement = this;
    var rectElement = this.parentElement.getElementsByTagName('rect')[0];
    var boundingRect = rectElement.getBoundingClientRect();
    $('body').append('<div id="input_div" style="height:' + boundingRect.height + 
            '; width:' + boundingRect.width +
            '; height:' + boundingRect.height +
            '; top:' + boundingRect.top +
            '; left:' + boundingRect.left +
            '; bottom:' + boundingRect.bottom +
            '; right:' + boundingRect.right + 
            '; position:absolute;">' +
            '<input id="input_box" type="text" style="width:' + boundingRect.width +
            '; height:' + TreeConstants.BOX_HEIGHT +
            '"> </div>')
    var text = textElement.textContent;
    textElement.textContent = '';
    //$("#" + id + " image").hide(); TODO expand text box as they type
    // Erase prompt when clicked.
    if (!TreeConstructor.promptActive) $('#input_box').val(text);
    $('#input_box').focus();

    // Trigger reset if click away or hit enter
    $('#input_box').blur(function() {
        TreeDisplay.resetTree(id, textElement, text);
    });

    $('#input_box').keypress(function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) TreeDisplay.resetTree(id, textElement, text);
    });
}

/**
 * Resets the tree based on the newly entered text in #input_box.
 */
TreeDisplay.resetTree = function(id, textElement, text) {
    var objective = TreeConstructor.loadObjective(id, $('#input_box').val());
    textElement.textContent = text;
    $('#input_div').remove();
    TreeConstructor.parseObjective(objective); 
}

/**
 * Get the size of the space between the text and the edge of the box.
 */
TreeDisplay.getTextMargin = function(node) {
    if (node.isShortNameNode) {
        return TreeConstants.SHORT_NAME_CONSTANT/2;
    } else if (node.isPrompt) {
        return TreeConstants.PROMPT_CONSTANT/2;
    } else {
        return TreeConstants.BOX_CONSTANT/2;
    }      
}

/**
 * Draws the links between nodes.
 */
TreeDisplay.drawLinks = function(svg, level, levels, centers) {
    for (var node=0; node < levels[level].length; node++) {
        var cur = levels[level][node];
        if (cur.children) {
            svg.selectAll("level"+level+",node"+node)
               .data(cur.children)
               .enter()
               .append("svg:line")
               .attr("class", "link")
               .attr("x1", centers[cur.tag])
               .attr("y1", TreeDisplay.getLevelY(level) + TreeConstants.BOX_HEIGHT)
               .attr("x2", function(d) { return centers[d.tag]; })
               .attr("y2", TreeDisplay.getLevelY(level+1))
        }
    }
}

TreeDisplay.drawSymbols = function(svg, nodes, widths) {
    var expressions = nodes.filter(function(d) { return !d.isShortNameNode && d.curvature; });
    var minDimension = Math.min(TreeConstants.BOX_CONSTANT/2, TreeConstants.BOX_HEIGHT);
    // Curvature
    expressions.append("svg:image")
            .attr("x", TreeConstants.SYMBOL_MARGIN)
            .attr("y", TreeConstants.SYMBOL_MARGIN)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { return TreeConstants.IMAGE_PREFIX + d.curvature + ".png"; })

    // Sign
    expressions.append("svg:image")
            .attr("x", function(d) { return widths[d.tag] + TreeConstants.SYMBOL_MARGIN - TreeConstants.BOX_CONSTANT/2; })
            .attr("y", TreeConstants.SYMBOL_MARGIN + (TreeConstants.BOX_HEIGHT-minDimension)/2)
            .attr("width", minDimension - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", minDimension - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { return TreeConstants.IMAGE_PREFIX + d.sign + ".png"; })

    // Invalid constraints
    var constraints = nodes.filter(function(d) {
        return !d.isShortNameNode && !d.curvature && d.errors && d.errors.unsorted_errors.length > 0;
    });
    constraints.append("svg:image")
            .attr("x", TreeConstants.SYMBOL_MARGIN)
            .attr("y", TreeConstants.SYMBOL_MARGIN)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { return TreeConstants.IMAGE_PREFIX + "invalid_constraint" + ".png"; })
}

/**
 * Gets the y-coordinate of nodes at the given level.
 */
TreeDisplay.getLevelY = function(level) {
    return level*(TreeConstants.BOX_HEIGHT + TreeConstants.VERT_SEP) + TreeConstants.EDGE_VERT_SEP;
}