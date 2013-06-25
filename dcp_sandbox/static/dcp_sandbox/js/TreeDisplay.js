/**
 * Handles drawing the parse tree and clicking to edit text.
 */
function TreeDisplay() {

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
        .attr("height", treeHeight);

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
           .attr("height", TreeConstants.BOX_HEIGHT);

        nodeEnter.append("svg:text")
            .attr("dy", TreeConstants.BOX_HEIGHT/2 + TreeConstants.CHAR_HEIGHT/4)
            .attr("dx", TreeDisplay.getTextMargin)
            .text(function(d) { return d.name; });
        
        // Draw links
        TreeDisplay.drawLinks(svg, i, levels, centers);

        // Draw curvature and sign symbols
        TreeDisplay.drawSymbols(svg, nodeEnter, widths);
    }

    svg.selectAll("rect").on("click", TreeDisplay.createInputBox);
}

/**
 * Covers the rect with an input box containing the text.
 * Updates the overall expression to reflect local changes.
 */
TreeDisplay.createInputBox = function() {
    var id = this.parentElement.id;
    var textElement = this.parentElement.getElementsByTagName('text')[0];
    var boundingRect = this.getBoundingClientRect();
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
    var text = textElement.textContent
    textElement.textContent = ''
    $('#input_box').val(text);
    $('#input_box').focus();
    $('#input_box').blur(function() { 
      textElement.textContent = text; //$('#input_box').val();
      $('#input_div').remove(); 
    });
}

/**
 * Get the size of the space between the text and the edge of the box.
 */
TreeDisplay.getTextMargin = function(node) {
    if (node.isShortNameNode) {
        return TreeConstants.SHORT_NAME_CONSTANT/2;
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
    // Curvature
    expressions.append("svg:image")
            .attr("x", TreeConstants.SYMBOL_MARGIN)
            .attr("y", TreeConstants.SYMBOL_MARGIN)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { return TreeConstants.IMAGE_PREFIX + d.curvature + ".svg"; })

    // Sign
    expressions.append("svg:image")
            .attr("x", function(d) { return widths[d.tag] + TreeConstants.SYMBOL_MARGIN - TreeConstants.BOX_CONSTANT/2; })
            .attr("y", TreeConstants.SYMBOL_MARGIN)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { return TreeConstants.IMAGE_PREFIX + d.sign + ".svg"; })

    // Invalid constraints
    var constraints = nodes.filter(function(d) {
        return !d.isShortNameNode && !d.curvature && d.errors.unsorted_errors.length > 0;
    });
    constraints.append("svg:image")
            .attr("x", TreeConstants.SYMBOL_MARGIN)
            .attr("y", TreeConstants.SYMBOL_MARGIN)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { return TreeConstants.IMAGE_PREFIX + "invalid_constraint" + ".svg"; })
}

/**
 * Gets the y-coordinate of nodes at the given level.
 */
TreeDisplay.getLevelY = function(level) {
    return level*(TreeConstants.BOX_HEIGHT + TreeConstants.VERT_SEP) + TreeConstants.EDGE_VERT_SEP;
}