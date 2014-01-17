/**
 * Initializes tree construction and manipulates the tree object.
 */
function TreeConstructor() {

}

// True until the user enters a valid objective/constraint.
TreeConstructor.promptActive = true;
// True if user clicks help button.
TreeConstructor.helpActive = true;

/**
 * Parses the given objective/constraint and returns a tree object.
 * objective - the objective/constraint to parse.
 * success_func - an optional function to execute after success.
 * error_func - an optional function to execute after an error.
 */
TreeConstructor.parseObjective = function(objective, success_func, error_func) {
    $.ajax({ // create an AJAX call...
        crossDomain: false,
                    beforeSend: function(xhr, settings) {
                        xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
                    },
        url: 'parse',
        type: 'POST',
        data: {text: objective},
        success: function(response) {
            // Load parse tree
            var root = JSON.parse(response);
            if (success_func) success_func(root);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (error_func) error_func(jqXHR, textStatus, errorThrown);
        }
    });
}

/**
 * Parses the given objective/constraint and creates a parse tree visualization.
 * objective - the objective/constraint to parse.
 * id - the id of the node the user edited.
 * success_func - an optional function to execute after success.
 */
TreeConstructor.createParseTree = function(objective, id, success_func) {
    function drawTree(root) {
        TreeDisplay.errorState = false;
        // Clean up alerts and input boxes.
        $('#inputDiv').remove();
        $('.alert').alert('close');
        TreeConstructor.deactivatePrompt();
        TreeConstructor.setLeafLegendText(root);
        TreeConstructor.processParseTree(root);
        if (success_func) success_func();
    }

    function handleError(jqXHR, textStatus, errorThrown) {
        TreeConstructor.showParseError(jqXHR.responseText);
        // Note error state and the erroneous text.
        TreeDisplay.errorState = true;
        TreeDisplay.errorText = $('#inputBox').val();
        // Force user to fix the erroneous text.
        TreeDisplay.positionInputBox(id);
        $('#'+id).attr("class", "node " + TreeConstants.ERROR_NODE);
        $('#inputBox').focus();
    }

    TreeConstructor.parseObjective(objective, drawTree, handleError);
}

/**
 * Show error message from the parser.
 * http://stackoverflow.com/questions/10082330/dynamically-create-bootstrap-alerts-box-through-javascript
 */
TreeConstructor.showParseError = function(message) {
    $(TreeConstants.ERROR_DIV).html('<div class="alert alert-error">' +
        '<span><strong>Error!</strong> ' + message + '</span></div>')
}

/**
 * Processes the tree from the parser into a visualization.
 */
TreeConstructor.deactivatePrompt = function() {
    TreeConstructor.promptActive = false;
}

/**
 * Processes the tree from the parser into a visualization.
 */
TreeConstructor.processParseTree = function(root) {
    // Save a copy of the root.
    TreeConstructor.root = $.extend(true, {}, root);
    // Add short_name nodes and number nodes.
    var numNodes = TreeConstructor.augmentTree(root, 0);
    // Save node info as attribute of TreeConstructor
    TreeConstructor.storeNodeMap(root);
    // Map distance from root to list of nodes in left to right order.
    var levels = [];
    TreeConstructor.generateLevels(root, levels, 0);
    // Add left and right pointer to each node.
    TreeConstructor.addLeftRight(levels);
    // Get node box widths
    var widths = [];
    TreeLayout.getWidths(root, widths);
    // Get the spacing between siblings.
    TreeLayout.getPadding(root, widths);
    // Get tree width and height.
    var widthVals = TreeLayout.getTreeWidth(root, widths);
    var treeWidth = widthVals[0];
    var treeHeight = TreeLayout.getTreeHeight(levels) + 
                     TreeLayout.getLeavesLegendHeight();
    // Get the centers of the nodes.
    var centers = [];
    centers[root.tag] = widthVals[1];
    TreeLayout.getCenters(root, widths, centers);
    // Draw the new tree
    $(TreeConstants.TREE_DIV).html(''); // Clear old tree
    TreeDisplay.drawTree(TreeConstants.TREE_DIV, root, numNodes, levels, widths, centers, treeWidth, treeHeight);
    // If help is active, draw the legends.
    if (TreeConstructor.helpActive) {
        // Show the variables/params info even when prompting.
        TreeDisplay.drawLeavesLegend(treeWidth);
        if (!TreeConstructor.promptActive) {
            TreeDisplay.drawLegend(TreeConstants.CURVATURE_LEGEND, root, widths, centers, treeWidth);
            TreeDisplay.drawLegend(TreeConstants.SIGN_LEGEND, root, widths, centers, treeWidth);
        }
    }
}

/**
 * Adds short_name nodes (e.g. log_sum_exp from log_sum_exp(x,y),
 * numbers the nodes in a preorder traversal (starting at 0, stored in tag attribute).
 */
TreeConstructor.augmentTree = function(root, nextTag) {
    root.tag = nextTag;
    nextTag++;
    root.isShortNameNode = false;
    if(!root.children) return nextTag;
    var shortNameNode = {'name': root.short_name, 
                         'children': root.children,
                         'isShortNameNode': true,
                         'tag': nextTag++,
                        };
    root.children = [shortNameNode];
    for (var i=0; i < shortNameNode.children.length; i++) {
        nextTag = TreeConstructor.augmentTree(shortNameNode.children[i], nextTag);
    }
    return nextTag;
}

/**
 * Sets entry i of levels to be an array of the nodes at level i in left to right order.
 */
TreeConstructor.generateLevels = function(root, levels, curLevel) {
    if(!levels[curLevel]) {
      levels[curLevel] = [];
    }
    levels[curLevel].push(root);

    // Recurse on children
    if(!root.children) return;
    for (var i=0; i < root.children.length; i++) {
        TreeConstructor.generateLevels(root.children[i], levels, curLevel+1);
    }
}

/**
 * Adds a left and right pointer to each node.
 */
TreeConstructor.addLeftRight = function(levels) {
    for (var i=0; i < levels.length; i++) {
        for (var j=1; j < levels[i].length; j++) {
            levels[i][j-1].right = levels[i][j];
            levels[i][j].left = levels[i][j-1];
        }
    }
}

/**
 * Returns an array of leaf names from the leaves
 * stored in tagToNode.
 *
 * root - The root of the parse tree. TODO
 */
TreeConstructor.getLeafNames = function(root) {
    if (root.children == undefined) {
        return [root.name];
    }
    var names = [];
    for (var i=0; i < root.children.length; i++) {
        var childNames = TreeConstructor.getLeafNames(root.children[i]);
        names = names.concat(childNames);
    }
    return names;
}

/**
 * Produces legend text showing which variables
 * and parameters were used.
 *
 * root - The root of the parse tree.
 */
 TreeConstructor.setLeafLegendText = function(root) {
    var used = TreeConstructor.getLeafNames(root);
    var textArr = [];
    for (type in TreeConstants.LEAVES) {
        // Find which names were used.
        var usedNames = [];
        var names = TreeConstants.LEAVES[type];
        for (var i=0; i < names.length; i++) {
            if (used.indexOf(names[i]) != -1) {
                usedNames.push(names[i]);
            }
        }
        // Construct the text for Variables/Parameters.
        var text = type + ": "
        var suffix = "";
        if (usedNames.length != 0) {
            text += usedNames.join();
        } else {
            text += "None";
        }
        textArr.push(text);
    }
    
    TreeConstructor.leafLegendText = textArr;
}

/**
 * Stores a map of node tag to minimized node object as an attribute of TreeConstructor.
 * The stored node contains the name, isShortNameNode, parent tag, and children's tags.
 */
TreeConstructor.storeNodeMap = function(root) {
    var tagToNode = {};
    TreeConstructor.storeNodeMapRecursive(root, undefined, tagToNode);
    TreeConstructor.tagToNode = tagToNode;
}

/**
 * Recursive helper.
 */
TreeConstructor.storeNodeMapRecursive = function(node, parentTag, tagToNode) {
    var nodeInfo = {'name': node.name, 
                    'isShortNameNode': node.isShortNameNode,
                    'isPrompt': node.isPrompt,
                    'parentTag': parentTag,
                   };
    if (node.children) {
        var childTags = [];
        for (var i=0; i < node.children.length; i++) {
            childTags.push(node.children[i].tag);
        }
        nodeInfo.childTags = childTags;
        // Recurse on children
        for (var i=0; i < node.children.length; i++) {
            TreeConstructor.storeNodeMapRecursive(node.children[i], node.tag, tagToNode);
        }
    }
    tagToNode[node.tag] = nodeInfo;
}

/**
 * Returns the text of the overall objective/constraint after
 * the user has clicked and modified the text at the node with
 * the given id.
 * Uses the tagToNode map stored as an attribute of TreeConstructor.
 */
TreeConstructor.loadObjective = function(id, text) {
    var tagToNode = $.extend(true, {}, TreeConstructor.tagToNode);
    var node = tagToNode[id];
    node.name = text;
    if (node.isShortNameNode) {
        node = tagToNode[node.childTags[0]];
    }
    return TreeConstructor.loadObjectiveRecursive(node, tagToNode);
}

/**
 * Recursive helper. Text is the text for the current expression.
 */
TreeConstructor.loadObjectiveRecursive = function(node, tagToNode) {
    if (node.parentTag == undefined) return node.name;
    var operator = tagToNode[node.parentTag];
    var position = operator.childTags.indexOf(node.tag);
    var newExpression = "";
    // Arithmetic operator
    if (TreeConstants.OPERATORS.indexOf(operator.name) != -1) {
        if (operator.childTags.length == 1) {
            newExpression = operator.name + node.name;
        } else { // Two arguments
            var lhExp = tagToNode[operator.childTags[0]];
            var rhExp = tagToNode[operator.childTags[1]];
            newExpression = lhExp.name + operator.name + rhExp.name; 
        }
    } else { // Atom
        // Create argument list
        var args = tagToNode[operator.childTags[0]].name;
        for (var i=1; i < operator.childTags.length; i++) {
            args = args + "," + tagToNode[operator.childTags[i]].name;
        }
        // Standard atoms
        var ellipsisIndex = operator.name.indexOf(TreeConstants.ELLIPSIS);
        if (ellipsisIndex == -1) {
            newExpression = operator.name + "(" + args + ")"
        } else { // Parameterized atoms
            newExpression = operator.name.substr(0, ellipsisIndex) + 
                            args + operator.name.substr(ellipsisIndex + TreeConstants.ELLIPSIS.length);
        }
    }
    var nextNode = tagToNode[operator.parentTag];
    // Surrounding parentheses
    var surroundingParens = TreeConstructor.getSurroundingParens(nextNode.name);
    for (var i=0; i < surroundingParens; i++) {
        newExpression = "(" + newExpression + ")";
    }
    nextNode.name = newExpression;
    return TreeConstructor.loadObjectiveRecursive(nextNode, tagToNode);
}

/**
 * Returns the number of parentheses surrounding the expression.
 */
TreeConstructor.getSurroundingParens = function(name) {
    // Stores the index of the matching close paren
    // for each open paren.
    var parenMatches = TreeConstructor.makeArrayOf(-1, name.length);
    // Stack of open parens to be matched
    var parenStack = []; 
    var balance = 0;
    for (var i=0; i < name.length; i++) {
        if (name[i] == "(") {
            parenStack.push(i);
        } else if (name[i] == ")") {
            var openParen = parenStack.pop();
            parenMatches[openParen] = i;
        }
    }
    var surroundingParens = 0;
    for (var i=0; i < parenMatches.length; i++) {
        if (parenMatches[i] != name.length - 1 - i) break;
        surroundingParens++;
    }
    return surroundingParens;
}

/**
 * Utility function for initializing arrays so all cells
 * hold a given value.
 * http://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array
 */
TreeConstructor.makeArrayOf = function(value, length) {
    var arr = []; var i = length;
    while (i--) {
        arr[i] = value;
    }
    return arr;
}