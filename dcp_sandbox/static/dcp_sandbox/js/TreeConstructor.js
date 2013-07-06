/**
 * Initializes tree construction and manipulates the tree object.
 */
function TreeConstructor() {

}

// True until the user enters a valid objective/constraint.
TreeConstructor.promptActive = true;

/**
 * Parses the given objective/constraint and creates a parse tree visualization.
 */
TreeConstructor.parseObjective = function(objective) {
    $.ajax({ // create an AJAX call...
        crossDomain: false,
                    beforeSend: function(xhr, settings) {
                        xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
                    },
        url: 'parse',
        type: 'POST',
        data: {text: objective},
        success: function(response) {
            var root = JSON.parse(response); // Load parse tree
            TreeConstructor.deactivatePrompt();
            TreeConstructor.processParseTree(root);
        },
        error: function(jqXHR, textStatus, errorThrown) {}
    });
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
    var numNodes = TreeConstructor.augmentTree(root, 0); // Add short_name nodes and number nodes.
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
    var treeWidth = TreeLayout.getTreeWidth(root, widths);
    // Get the centers of the nodes.
    var centers = [];
    centers[root.tag] = treeWidth/2;
    TreeLayout.getCenters(root, widths, centers);
    $(TreeConstants.TREE_DIV).html(''); // Clear old tree
    TreeDisplay.drawTree(TreeConstants.TREE_DIV, root, numNodes, levels, widths, centers, treeWidth);

    // // Returns [P,RNode,RWidth, RSib] where Px = 0, RNodex >= RWidthw + SEPARTION*1
    // // Sib used for optimization objective.
    // var relationMatrices = TreeLayout.getRelations(root, numNodes, levels);
    // var P = relationMatrices[0], RNode = relationMatrices[1],
    // RWidth = relationMatrices[2], Sib = relationMatrices[3];
    // // Formats layout problem as LP
    // var data = TreeLayout.getCenters(P, RNode, RWidth, Sib, widths, numNodes, root, levels);
    // // Solves LP to get box centers with minimum tree width.
    // // Then draws tree.
    // TreeDisplay.getLayout(data, root, numNodes, levels, widths);
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
 * Stores a map of node tag to minimized node object as an attribute of TreeConstructor.
 * The stored node contains the name, isShortNameNode, parent tag, and children's tags.
 */
TreeConstructor.storeNodeMap = function(root) {
    var tagToNode = {};
    TreeConstructor.storeNodeMapRecursive(root, undefined, tagToNode);
    TreeConstructor[TreeConstants.TAG_TO_NODE] = tagToNode;
}

/**
 * Recursive helper.
 */
TreeConstructor.storeNodeMapRecursive = function(node, parentTag, tagToNode) {
    var nodeInfo = {'name': node.name, 
                    'isShortNameNode': node.isShortNameNode,
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
    var tagToNode = $.extend(true, {}, TreeConstructor[TreeConstants.TAG_TO_NODE]);
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
    var parenMatches = TreeLayout.makeArrayOf(-1, name.length);
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