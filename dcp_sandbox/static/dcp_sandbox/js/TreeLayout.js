/**
 * Handles all client side computation of the tree layout.
 */
function TreeLayout() {

}

/**
 * Determines the box widths based on the number of characters in the name.
 */
TreeLayout.getWidths = function(root, widths) {
    var width = root.name.width(TreeConstants.FONT);
    if (root.isShortNameNode) {
        width += TreeConstants.SHORT_NAME_CONSTANT;
    } else if (root.isPrompt) {
        width += TreeConstants.PROMPT_CONSTANT;
    } else {
        width += TreeConstants.BOX_CONSTANT;
    }
    widths[root.tag] = width;
    if(!root.children) return;
    for (var i=0; i < root.children.length; i++) {
        TreeLayout.getWidths(root.children[i], widths);
    }
}

/**
 * Adds a left and right padding property to each node.
 * Ensures that subtrees can be isolated in a bounding box and cousins
 * are further away then siblings.
 */
TreeLayout.getPadding = function(root, widths) {
    root.childSpacing = 0;
    root.leftPadding = TreeConstants.MIN_BOX_SEP/2;
    root.rightPadding = TreeConstants.MIN_BOX_SEP/2;
    if (!root.children) return;
    // Recurse on children.
    for (var i = 0; i < root.children.length; i++) {
         TreeLayout.getPadding(root.children[i], widths);
     }
    // Set child spacing
    var spacing = [];
    for (var i = 1; i < root.children.length; i++) {
        spacing.push(root.children[i-1].rightPadding + root.children[i].leftPadding);
    };
    root.childSpacing = Math.max.apply(null, spacing);
    // Ensure cousins are further than siblings.
    var minCousinDist = TreeConstants.COUS_SIB_RATIO*root.childSpacing;
    var firstChild = root.children[0];
    var leftPadding = firstChild.leftPadding;
    if (firstChild.left) {
        leftPadding = Math.max(leftPadding, minCousinDist);
    }
    var lastChild = root.children[root.children.length-1];
    var rightPadding = lastChild.rightPadding;
    if (lastChild.right) {
        rightPadding = Math.max(rightPadding, minCousinDist);
    }
    // Set root left and right padding.
    var totalWidth = widths[firstChild.tag];
    for (var i = 1; i < root.children.length; i++) {
        totalWidth += root.children[i-1].rightPadding;
        totalWidth += widths[root.children[i].tag];
        totalWidth += root.children[i].leftPadding;
    }
    var basePadding = (totalWidth - widths[root.tag])/2;
    root.leftPadding = Math.max(root.leftPadding, basePadding + leftPadding);
    root.rightPadding = Math.max(root.rightPadding, basePadding + rightPadding);
}

/**
 * Determine the tree width so that the root node can be centered.
 */
TreeLayout.getTreeWidth = function(root, widths) {
    var padding = Math.max(root.leftPadding, root.rightPadding, TreeConstants.EDGE_SEP);
    return 2*padding + widths[root.tag];
}

/**
 * Determine children's centers from widths, child spacing, padding, and root's center.
 */
TreeLayout.getCenters = function(root, widths, centers) {
    if (!root.children) return;
    // Centers of children relative to edge of left most child.
    var offsets = [];
    offsets[0] = widths[root.children[0].tag]/2;
    // Right edge of the rightmost child visited so far.
    var rightEdge = widths[root.children[0].tag];
    for (var i=1; i < root.children.length; i++) {
        offsets[i] = rightEdge + root.childSpacing + widths[root.children[i].tag]/2;
        rightEdge = offsets[i] + widths[root.children[i].tag]/2;
    }
    var rightShift = centers[root.tag] - rightEdge/2;
    // Offsets are shifted right to get centers.
    for (var i=0; i < root.children.length; i++) {
        centers[root.children[i].tag] = offsets[i] + rightShift;
        TreeLayout.getCenters(root.children[i], widths, centers);
    }
}

//http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
/**
 * Add width function to String to get true String width.
 */
String.prototype.width = function(font) {
  var f = font || '12px arial',
      o = $('<div>' + this + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();
  o.remove();

  return w;
}

/**
 * Add height function to String to get true String height.
 */
String.prototype.height = function(font) {
  var f = font || '12px arial',
      o = $('<div>' + this + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      h = o.height();
  o.remove();

  return h;
}

// /**
//  * Returns [P,RNode,RWidth] where Px = 0, RNodex >= RWidthw + HORIZ_SEP*1.
//  * P ensures symmetry of children and parent nodes.
//  * RNode and RWidth ensure that boxes do not overlap.
//  */
// TreeLayout.getRelations = function(root, numNodes, levels) {
//     // Create P
//     var P = [];
//     TreeLayout.generateP(root, numNodes, P);
//     var RNode = [], RWidth = [];
//     TreeLayout.generateR(levels, numNodes, RNode, RWidth);
//     var Sib = [];
//     TreeLayout.generateSib(root, numNodes, Sib);
//     return [P,RNode,RWidth,Sib];
// }

// /**
//  * Sets rows of P so that for center children, child.tag = 1, parent.tag = -1
//  * and for paired children, child1.tag = 1/2, child2.tag = 1/2, parent.tag = -1.
//  */
// TreeLayout.generateP = function(root, numNodes, P) {
//     if(!root.children) return;
//     var length = root.children.length;
//     for (var i=0; i < length/2; i++) {
//       if (true || i == length-1-i) {
//         var arr = TreeLayout.makeArrayOf(0, numNodes);
//         arr[root.tag] = -1;
//         // Works for paired and unpaired.
//         var child1 = root.children[i];
//         var child2 = root.children[length-1-i];
//         arr[child1.tag] += 1/2;
//         arr[child2.tag] += 1/2;
//         P.push(arr);
//       }
//     }

//     // Recurse on children
//     for (var i=0; i < length; i++) {
//         TreeLayout.generateP(root.children[i], numNodes, P);
//     }
// }

// /**
//  * Sets rows of RNode so that if on level l, node i.tag = -1 and node i+1.tag = 1.
//  * Similarly sets rows of RWidth so that node i.tag = node i+1.tag = 1/2.
//  * Thus each node has a relation with its neighbor to the right. 
//  */
// TreeLayout.generateR = function(levels, numNodes, RNode, RWidth) {
//     for (var level=0; level < levels.length; level++) {
//         var nodes = levels[level];
//         for (var i=0; i < nodes.length-1; i++) {
//             var arr = TreeLayout.makeArrayOf(0, numNodes);
//             arr[nodes[i].tag] = -1;
//             arr[nodes[i+1].tag] = 1;
//             RNode.push(arr);
//             var arr = TreeLayout.makeArrayOf(0, numNodes);
//             arr[nodes[i].tag] = 1/2;
//             arr[nodes[i+1].tag] = 1/2;
//             RWidth.push(arr);
//         }
//     }
// }

// /**
//  * Sets rows of Sib so that child i.tag = -1, child i+1.tag = 1.
//  * Like RNode but only for siblings.
//  */
// TreeLayout.generateSib = function(root, numNodes, Sib) {
//     if(!root.children) return;
//     for (var i=0; i < root.children.length - 1; i++) {
//         var arr = TreeLayout.makeArrayOf(0, numNodes);
//         arr[root.children[i].tag] = -1;
//         arr[root.children[i+1].tag] = 1;
//         Sib.push(arr);
//     }
//     // Recurse on children
//     for (var i=0; i < root.children.length; i++) {
//         TreeLayout.generateSib(root.children[i], numNodes, Sib);
//     }
// }

// /**
//  * Solves the following LP to get box centers while minimizing tree width:
//  * minimize max + 1*Sib*centers
//  * subject to:
//  *  centers + 0.5*widths <= max*1 - EDGE_SEP
//  *  centers - 0.5*widths >= EDGE_SEP
//  *  RNode*centers >= RWidth*widths + HORIZ_SEP*1
//  *  P*centers = 0
//  */
// TreeLayout.getCenters = function(P, RNode, RWidth, Sib, widths, numNodes, root, levels) {
//     // x = [centers; max]
//     // Put into form: minimize c*x subject to A*x <= b, C*x = d.
//     // Inequality constraints
//     var b = numeric.dot(RWidth, widths);
//     b = numeric.add(b, TreeLayout.makeArrayOf(TreeConstants.HORIZ_SEP, b.length));
//     b = numeric.neg(b);
//     // Combine inequality constraints
//     for (var j=0; j < 2; j++) {
//         for (var i=0; i < widths.length; i++) {
//             b.push(-0.5*widths[i] - TreeConstants.EDGE_SEP);
//         }
//     }
//     var A = RNode;
//     // Add space for max
//     for (var i=0; i < A.length; i++) {
//         A[i].push(0);
//     }
//     A = numeric.neg(A);
//     // Combine inequality constraints
//     // center - 1/2 width >= 0
//     var I = numeric.identity(numNodes + 1);
//     I.pop();
//     I = numeric.neg(I);
//     for (var i=0; i < I.length; i++) {
//         A.push(I[i]);
//     }
//     // center + 1/2 width <= max
//     I = numeric.identity(numNodes + 1);
//     I.pop();
//     for (var i=0; i < I.length; i++) {
//         I[i][numNodes] = -1;
//         A.push(I[i]);
//     }
//     // Equality constraints
//     var C = P;
//     // Add space for max
//     for (var i=0; i < C.length; i++) {
//         C[i].push(0);
//     }
//     var d = TreeLayout.makeArrayOf(0, C.length);

//     // Optimization objective
//     // Add space for max
//     for (var i=0; i < Sib.length; i++) {
//         Sib[i].push(0);
//     }
//     // Combine optimization objectives
//     var tmp = TreeLayout.makeArrayOf(0, numNodes+1);
//     tmp[numNodes] = 1;
//     Sib.push(tmp);
//     var ones = TreeLayout.makeArrayOf(1, Sib.length);
//     var c = numeric.dot(ones, Sib);

//     return {'c':c, 'A':A, 'b':b, 'C':C, 'd':d, 'rowMajor':true};
// }

// /**
//  * Utility function for initializing arrays so all cells
//  * hold a given value.
//  * http://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array
//  */
// TreeLayout.makeArrayOf = function(value, length) {
//     var arr = []; var i = length;
//     while (i--) {
//         arr[i] = value;
//     }
//     return arr;
// }

// /**
//  * Get the spacing between the children of each node (i.e. siblings).
//  * Returns the width of the bounding box containing the root and all it's descendents.
//  */
// TreeLayout.getSiblingSpacing = function(root, widths, siblingSpacing) {
//     if (!root.children) {
//         siblingSpacing[root.tag] = 0;
//         return widths[root.tag]; 
//     }
//     // Find the distance between the edge of each node and the edge of it's
//     // children's bounding box.
//     var padding = [];
//     var boundingBoxes = [];
//     for (var i=0; i < root.children.length; i++) {
//         var sibling = root.children[i];
//         var bbWidth = TreeLayout.getSiblingSpacing(sibling, widths, siblingSpacing);
//         boundingBoxes.push(bbWidth);
//         padding.push(Math.max(0, (bbWidth - widths[sibling.tag])/2));
//     }
//     // Convert padding to spacing and get spacing needed for cousins to be
//     // more distant than siblings.
//     var cousinShortfall = [];
//     var spacing = [TreeConstants.MIN_BOX_SEP];
//     for (var i=1; i < root.children.length; i++) {
//         spacing.push(padding[i] + padding[i-1]);
//         cousinShortfall.push(
//             TreeLayout.getCousinShortfall(root, i, widths, boundingBoxes, siblingSpacing)
//         );
//     }
//     // Sibling space is largest gap between siblings when all the bounding
//     // boxes are concatenated.
//     siblingSpacing[root.tag] = Math.max.apply(null, spacing.concat(cousinShortfall));
//     // Bounding box width is the max of the node width and
//     // the combined bounding boxes and additional spacing of its children.
//     var childBBWidth = boundingBoxes[0];
//     for (var i=1; i < root.children.length; i++) {
//         childBBWidth += siblingSpacing[root.tag] - spacing[i];
//         childBBWidth += boundingBoxes[i];
//     }
//     return Math.max(widths[root.tag], childBBWidth);
// }

// /**
//  * Gets the spacing needed to make cousins sufficiently distant.
//  */
// TreeLayout.getCousinShortfall = function(root, childIndex, widths, boundingBoxes, siblingSpacing) {
//     var leftSib = root.children[childIndex-1];
//     var rightSib = root.children[childIndex];
//     if (!leftSib.children || !rightSib.children) return 0;
//     var cousinMin = TreeConstants.COUS_SIB_RATIO*Math.max(siblingSpacing[leftSib.tag], 
//                                                           siblingSpacing[rightSib.tag]);
//     // Distance between cousins if parents' bounding boxes touched 
//     // plus the distance between the parents.
//     var leftCousinDist = (widths[leftSib.tag]-boundingBoxes[i-1])/2;
//     var rightCousinDist = (widths[rightSib.tag]-boundingBoxes[i])/2;
//     return cousinMin - leftCousinDist - rightCousinDist;
// }