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
            .attr("class", "tree")
            .attr("width", function(d) { return widths[d.tag]; })
            .attr("height", TreeConstants.BOX_HEIGHT)

        nodeEnter.append("svg:text")
            .attr("class", function(d) {
                if (d.isShortNameNode || !TreeConstructor.editable) {
                    return TreeConstants.FIXED_TEXT;
                } else {
                    return TreeConstants.EDITABLE_TEXT;
                }
            })
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
    // Make expression text boxes editable.
    svg.selectAll("text."+TreeConstants.EDITABLE_TEXT).on("click", 
                                                          TreeDisplay.createInputBox);
}

/**
 * Covers the rect with an input box containing the text.
 * Updates the overall expression to reflect local changes.
 */
TreeDisplay.createInputBox = function() {
    if (TreeDisplay.errorState) return;
    var id = this.parentElement.id;
    var textElement = this;
    $('body').append('<div id="inputDiv" style="position:absolute;">' +
            '<input id="inputBox" type="text" autocomplete="off"> </div>')
    TreeDisplay.positionInputBox(id);
    var text = textElement.textContent;
    textElement.textContent = '';

    // Erase prompt when clicked.
    if (!TreeConstructor.promptActive) $('#inputBox').val(text);
    $('#inputBox').focus();

    // // Trigger reset if click away.
    // $('#inputBox').blur(function() {
    //     // If the user didn't change the text, click again instead of
    //     // parsing the objective again.
    //     if (TreeDisplay.errorState && 
    //         TreeDisplay.errorText == $('#inputBox').val()) {
    //         setTimeout(function(){ $('#inputBox').focus(); }, 100);
    //     } else { // User changed the text, so try to parse.
    //         TreeDisplay.resetTree(id, textElement, text);
    //     }
    // });

    // Trigger reset if click enter.
    $('#inputBox').keypress(function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) { // Enter
            TreeDisplay.resetTree(id, textElement, text);
        } else {
            TreeDisplay.resizeNode(id, $('#inputBox').val(), true);
        }
    });
}

/**
 * Positions the input box over the node with the given id.
 */
TreeDisplay.positionInputBox = function(id) {
    var rectElement = $("#"+id)[0].getElementsByTagName('rect')[0];
    var boundingRect = rectElement.getBoundingClientRect();
    var inputDiv = $("#inputDiv")[0];
    inputDiv.style.height = boundingRect.height;
    inputDiv.style.width = boundingRect.width;
    inputDiv.style.top = boundingRect.top + $(document).scrollTop();
    inputDiv.style.left = boundingRect.left + $(document).scrollLeft();

    var inputBox = $("#inputBox")[0];
    inputBox.style.width = boundingRect.width;
    inputBox.style.height = TreeConstants.BOX_HEIGHT;
}

/**
 * Resets the tree based on the newly entered text in #inputBox.
 */
TreeDisplay.resetTree = function(id, textElement, text) {
    var modifiedText = $('#inputBox').val();
    var objective = TreeConstructor.loadObjective(id, modifiedText);
    // textElement.textContent = text;
    var href = TreeConstants.URL_QUERY_PREFIX + encodeURIComponent(objective);
    history.pushState(null, null, href);
    TreeConstructor.createParseTree(objective, id);
}

/**
 * Expands the node so it can accomodate the input box.
 * Trailing and leading whitespace is not considered.
 */
 TreeDisplay.resizeNode = function(id, text, inputActive) {
    var node = TreeConstructor.tagToNode[id];
    // Get group and its offset.
    var group = $("#" + id)[0];
    var transform = group.getAttribute("transform");
    var pattern = /[\d\.]+/g;
    var dx = parseFloat( pattern.exec(transform) );
    var dy = parseFloat( pattern.exec(transform) );

    var rectElement = group.getElementsByTagName('rect')[0];
    var textWidth = text.width(TreeConstants.FONT);
    var textMargin = TreeDisplay.getTextMargin(node);
    var treeWidth = parseFloat( $("svg")[0].getAttribute("width") );
    var oldWidth = parseFloat( rectElement.getAttribute("width") );
    var newWidth = textWidth + 2*textMargin;
    // Don't expand beyond the edge of the svg element.
    var maxWidth = oldWidth + 2*Math.min(dx, treeWidth - oldWidth - dx);
    newWidth = Math.min(newWidth, maxWidth);
    // Do nothing if the rect is large enough and the user is inputting text.
    if (inputActive && newWidth <= oldWidth) return;
    var shift = (newWidth - oldWidth)/2;
    group.setAttribute("transform", "translate(" + (dx - shift) + "," + dy + ")");
    rectElement.setAttribute("width", newWidth);
    var rightImage = $("#"+id).find("image.right");
    if (rightImage.length > 0) {
        var imageX = parseFloat( rightImage[0].getAttribute("x") );
        rightImage[0].setAttribute("x", imageX + 2*shift);
    }
    // Resize input div and box if present.
    if (inputActive) {
        $("#inputDiv")[0].style.width = newWidth;
        pattern = /[\d\.]+/g;
        var left = parseFloat( pattern.exec($("#inputDiv")[0].style.left) );
        $("#inputDiv")[0].style.left = (left - shift) + "px";
        $("#inputBox")[0].style.width = newWidth;
    }
    // Hide all arrows/groups that overlap with the current group
    // if expanding. Otherwise show them all.
    if (inputActive) {
        TreeDisplay.hideOverlapped($(".arrow"), group);
        TreeDisplay.hideOverlapped($("g").not("#"+id), group);
    } else {
        $(".arrow").show();
        $("g").show();
    }
 }

/**
 * Hide all elements in overlapped that overlap with elem.
 * http://stackoverflow.com/questions/12066870/how-to-check-if-an-element-is-overlapping-other-elements
 */
 TreeDisplay.hideOverlapped = function(overlapped, elem) {
    var elemRect = elem.getBoundingClientRect();
    overlapped.each(function() {
        var rect = $(this)[0].getBoundingClientRect();
        var overlap = !(elemRect.right < rect.left || 
                        elemRect.left > rect.right || 
                        elemRect.bottom < rect.top || 
                        elemRect.top > rect.bottom)
        if (overlap) $(this).hide();
    })
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
            .attr("class", TreeConstants.LEFT_SYMBOL)
            .attr("x", TreeConstants.SYMBOL_MARGIN)
            .attr("y", TreeConstants.SYMBOL_MARGIN)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { 
                return TreeConstants.IMAGE_PREFIX + d.curvature + TreeConstants.SVG_IMAGE_SUFFIX; 
            })

    // Sign
    expressions.append("svg:image")
            .attr("class", TreeConstants.RIGHT_SYMBOL)
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
            .attr("class", TreeConstants.LEFT_SYMBOL)
            .attr("x", TreeConstants.SYMBOL_MARGIN)
            .attr("y", TreeConstants.SYMBOL_MARGIN)
            .attr("width", TreeConstants.BOX_CONSTANT/2 - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("height", TreeConstants.BOX_HEIGHT - 2*TreeConstants.SYMBOL_MARGIN)
            .attr("xlink:href", function(d) { 
                return TreeConstants.IMAGE_PREFIX + 
                       TreeDisplay.getConstraintSymbol(d) + 
                       TreeConstants.SVG_IMAGE_SUFFIX;   
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
    return level*(TreeConstants.BOX_HEIGHT + TreeConstants.VERT_SEP) +
           TreeConstants.EDGE_VERT_SEP +
           TreeLayout.getLeavesLegendHeight();
}

/**
 * Draws a legend showing which variables and parameters are used.
 */
TreeDisplay.drawLeavesLegend = function(treeWidth) {
    var svg = d3.select("svg");
    TreeDisplay.drawLeavesBox(svg, treeWidth);
    TreeDisplay.drawLeavesArrow(svg, treeWidth);
}

/**
 * Draws a legend box showing which variables and parameters are used.
 */
TreeDisplay.drawLeavesBox = function(svg, treeWidth) {
    var text = TreeConstructor.leafLegendText;
    textWidths = [];
    for (var i=0; i < text.length; i++) {
        textWidths.push(text[i].width(TreeConstants.FONT));
    }
    var legendWidth = Math.max.apply(null, textWidths);
    legendWidth += TreeConstants.SHORT_NAME_CONSTANT;
    var legendHeight = TreeLayout.getLeavesLegendBoxHeight();
    var dx = (treeWidth - legendWidth)/2;

    var legendSVG = svg.append("svg:g")
                       .attr("class", "node")
                       .attr("id", "leavesLegend")
                       .attr("transform", "translate(" + dx + "," + TreeConstants.EDGE_VERT_SEP + ")")

    legendSVG.append("svg:rect")
        .attr("class", "legend")
        .attr("width", legendWidth)
        .attr("height", legendHeight)

    // Draw title text.
    for (var i=0; i < text.length; i++) {
        var baseOffset = TreeConstants.LEAVES_TEXT_HEIGHT*i;
        legendSVG.append("svg:text")
            .attr("dy", TreeConstants.LEAVES_TEXT_HEIGHT/2 + baseOffset)
            .attr("dx", TreeConstants.SHORT_NAME_CONSTANT/2)
            .text(text[i])
    }
}

/**
 * Draws an arrow from the leaves legend box to the root node.
 */
TreeDisplay.drawLeavesArrow = function(svg, treeWidth) {
    var x = treeWidth/2;
    var y1 = TreeConstants.EDGE_VERT_SEP + 
             TreeLayout.getLeavesLegendBoxHeight();
    var y2 = y1 + TreeConstants.LEAVES_ARROW_HEIGHT;

    svg.append("svg:line")
       .attr("class", "arrow")
       .attr("x1", x)
       .attr("y1", y1)
       .attr("x2", x)
       .attr("y2", y2)

    svg.append("svg:path")
          .attr("class", "arrow")
          .attr("d", "M " + x + " " + y2 +
                     " l " + TreeConstants.LEGEND_ARROW_HEIGHT/2 + 
                     " " + -TreeConstants.LEGEND_ARROW_WIDTH +
                     " l " + -TreeConstants.LEGEND_ARROW_HEIGHT + " 0 z")
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
    var edgePadding = TreeConstants.EDGE_SEP[TreeConstructor.helpActive];
    if (legend.left) {
        var dx = edgePadding;
    } else {
        var dx = treeWidth - edgePadding - legendWidth;
    }
    var dy = TreeConstants.EDGE_VERT_SEP + 
             TreeLayout.getLeavesLegendHeight();

    var legendSVG = svg.append("svg:g")
                        .attr("class", "node")
                        .attr("id", legend.title + "Legend")
                        .attr("transform", "translate(" + dx + "," + dy + ")")

    legendSVG.append("svg:rect")
        .attr("class", "legend")
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
    var edgePadding = TreeConstants.EDGE_SEP[TreeConstructor.helpActive]
    if (legend.left) {
        var x1 = edgePadding + TreeLayout.getLegendWidth(legend);
    } else {
        var x1 = treeWidth - edgePadding - TreeLayout.getLegendWidth(legend);
    }
    var posMultiplier = legend.left ? -1 : 1;
    var x2 = centers[root.tag] + posMultiplier*widths[root.tag]/2;
    var y = TreeConstants.EDGE_VERT_SEP + 
            TreeConstants.LEGEND_TEXT_HEIGHT/2 +
            TreeLayout.getLeavesLegendHeight();

    svg.append("svg:line")
       .attr("class", "arrow")
       .attr("x1", x1)
       .attr("y1", y)
       .attr("x2", x2)
       .attr("y2", y)

    svg.append("svg:path")
          .attr("class", "arrow")
          .attr("d", "M " + x2 + " " + y +
                     " l " + posMultiplier*TreeConstants.LEGEND_ARROW_WIDTH + 
                     " " + -TreeConstants.LEGEND_ARROW_HEIGHT/2 +
                     " l 0 " + TreeConstants.LEGEND_ARROW_HEIGHT + " z")
}
