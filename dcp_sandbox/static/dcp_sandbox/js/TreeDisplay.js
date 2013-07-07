/**
 * Handles drawing the parse tree and clicking to edit text.
 */
function TreeDisplay() {

}

/**
 * Draws the parse tree.
 */
TreeDisplay.drawTree = function(location, root, numNodes, levels, widths, centers, treeWidth, treeHeight) {
    // Inspired by http://bl.ocks.org/mbostock/1093025
    var svg = d3.select(location).append("svg:svg")
        .attr("width", treeWidth)
        .attr("height", treeHeight)

    for (var i=0; i < levels.length; i++) {
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

        // Draw curvature and sign symbols. Not for the prompt.
        if (!TreeConstructor.promptActive) {
            TreeDisplay.drawSymbols(svg, nodeEnter, widths);
        }
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
            .attr("xlink:href", function(d) { 
                return TreeConstants.IMAGE_PREFIX + d.curvature + TreeConstants.SVG_IMAGE_SUFFIX; 
            })

    // Sign
    expressions.append("svg:image")
            .attr("x", function(d) { return widths[d.tag] + TreeConstants.SYMBOL_MARGIN - TreeConstants.BOX_CONSTANT/2; })
            .attr("y", TreeConstants.SYMBOL_MARGIN)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { 
                return TreeConstants.IMAGE_PREFIX + d.sign + TreeConstants.SVG_IMAGE_SUFFIX; 
            })

    // Constraints
    var constraints = nodes.filter(function(d) { return !d.isShortNameNode && !d.curvature; });
    constraints.append("svg:image")
            .attr("x", TreeConstants.SYMBOL_MARGIN)
            .attr("y", TreeConstants.SYMBOL_MARGIN)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { 
                return TreeConstants.IMAGE_PREFIX + TreeDisplay.getConstraintSymbol(d) + TreeConstants.SVG_IMAGE_SUFFIX;   
            })
}

/**
 * Get the name of the symbol on the left hand side of the constraint box.
 */
TreeDisplay.getConstraintSymbol = function(node) {
    if (node.errors && node.errors.unsorted_errors.length > 0) {
        return "invalid_constraint";
    } else {
        return "valid_constraint";
    }
}

/**
 * Gets the y-coordinate of nodes at the given level.
 */
TreeDisplay.getLevelY = function(level) {
    return level*(TreeConstants.BOX_HEIGHT + TreeConstants.VERT_SEP) + TreeConstants.EDGE_VERT_SEP;
}

/**
 * Draws a legend explaining the curvature symbols and a legend explaining the sign symbols.
 */
TreeDisplay.drawLegend = function(legend, root, widths, centers, treeWidth) {
    var svg = d3.select("svg");
    TreeDisplay.drawLegendBox(svg, legend, treeWidth);
    TreeDisplay.drawLegendArrow(svg, legend, root, widths, centers, treeWidth);
}

/**
 * Draws the box containing the legend title, symbols, and symbol names.
 */
TreeDisplay.drawLegendBox = function(svg, legend, treeWidth) {
    var legendWidth = TreeLayout.getLegendWidth(legend);
    var legendHeight = TreeLayout.getLegendHeight(legend);
    if (legend.left) {
        var dx = TreeConstants.EDGE_SEP;
    } else {
        var dx = treeWidth - TreeConstants.EDGE_SEP - legendWidth;
    }

    var legendSVG = svg.append("svg:g")
                        .attr("class", "node")
                        .attr("id", legend.title + "Legend")
                        .attr("transform", "translate(" + dx + "," + TreeConstants.EDGE_VERT_SEP + ")")

    legendSVG.append("svg:rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)

    // Draw title text.
    legendSVG.append("svg:text")
        .attr("dy", TreeConstants.LEGEND_TEXT_HEIGHT/2)
        .attr("dx", ( legendWidth - legend.title.width(TreeConstants.FONT) )/2 )
        .text(legend.title)

    // Draw symbols and names.
    for (var i = 0; i < legend.text.length; i++) {
        var baseOffset = TreeConstants.LEGEND_TEXT_HEIGHT*(i + 1);
        legendSVG.append("svg:image")
            .attr("x", TreeConstants.SYMBOL_MARGIN)
            .attr("y", TreeConstants.SYMBOL_MARGIN + baseOffset)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", TreeConstants.IMAGE_PREFIX + legend.text[i].symbol + TreeConstants.SVG_IMAGE_SUFFIX )

        legendSVG.append("svg:text")
                 .attr("dy", TreeConstants.LEGEND_TEXT_HEIGHT/2 + baseOffset)
                 .attr("dx", TreeConstants.BOX_CONSTANT/2)
                 .text(legend.text[i].name)
    };
}

/**
 * Draws the arrows from the legend box to the root node.
 */
TreeDisplay.drawLegendArrow = function(svg, legend, root, widths, centers, treeWidth) {
    var legendWidth = TreeLayout.getLegendWidth(legend);
    if (legend.left) {
        var x1 = TreeConstants.EDGE_SEP + TreeLayout.getLegendWidth(legend);
    } else {
        var x1 = treeWidth - TreeConstants.EDGE_SEP - TreeLayout.getLegendWidth(legend);
    }
    var posMultiplier = legend.left ? -1 : 1;
    var x2 = centers[root.tag] + posMultiplier*widths[root.tag]/2;
    var y = TreeConstants.EDGE_VERT_SEP + TreeConstants.LEGEND_TEXT_HEIGHT/2;

    svg.append("svg:line")
       .attr("class", "arrow")
       .attr("x1", x1)
       .attr("y1", y)
       .attr("x2", x2)
       .attr("y2", y)

    svg.append("svg:path")
          .attr("d", "M " + x2 + " " + y +
                     " l " + posMultiplier*TreeConstants.LEGEND_ARROW_WIDTH + 
                     " " + -TreeConstants.LEGEND_ARROW_HEIGHT/2 +
                     " l 0 " + TreeConstants.LEGEND_ARROW_HEIGHT + " z")
}