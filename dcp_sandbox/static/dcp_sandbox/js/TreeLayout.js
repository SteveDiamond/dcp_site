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
 * Ensures that subtrees can be isolated in a bounding box.
 */
TreeLayout.getPadding = function(root, widths) {
    root.leftPadding = TreeConstants.MIN_SIB_SEP/2;
    root.rightPadding = TreeConstants.MIN_SIB_SEP/2;
    if (!root.children) return;
    // Recurse on children.
    for (var i = 0; i < root.children.length; i++) {
         TreeLayout.getPadding(root.children[i], widths);
     }
    // Ensure cousins are further than siblings.
    var firstChild = root.children[0];
    var leftPadding = firstChild.leftPadding;
    if (firstChild.left) {
        leftPadding = Math.max(leftPadding, TreeConstants.MIN_COUS_SEP/2);
    }
    var lastChild = root.children[root.children.length-1];
    var rightPadding = lastChild.rightPadding;
    if (lastChild.right) {
        rightPadding = Math.max(rightPadding, TreeConstants.MIN_COUS_SEP/2);
    }
    // Set root left and right padding.
    // TODO not correct because of uniform child spacing.
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
        rightEdge += root.children[i-1].rightPadding;
        rightEdge += root.children[i].leftPadding;
        offsets[i] = rightEdge + widths[root.children[i].tag]/2;
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