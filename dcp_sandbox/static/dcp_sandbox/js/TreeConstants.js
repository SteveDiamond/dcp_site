/**
 * Constants used in sandbox.js and Tree classes.
 */
function TreeConstants() {

}

// Minimum HORIZ_SEP between boxes
TreeConstants.HORIZ_SEP = 10;
// Minimum separation of boxes from edges
TreeConstants.EDGE_SEP = 10;
// Constants for computing the box width
TreeConstants.BOX_CONSTANT = 40;
TreeConstants.SHORT_NAME_CONSTANT = 10;
TreeConstants.FONT = "12px sans-serif";
// Constants for block height and space in between
TreeConstants.BOX_HEIGHT = 20;
TreeConstants.VERT_SEP = 20;
// Separation between the first block and the top of the svg element.
TreeConstants.EDGE_VERT_SEP = 20;
// Margin around curvature and sign symbols
TreeConstants.SYMBOL_MARGIN = TreeConstants.BOX_CONSTANT/12;
// Constant for text height
TreeConstants.CHAR_HEIGHT = 12;
// Tree location
TreeConstants.TREE_DIV = "#chart";
// Location of images
TreeConstants.IMAGE_PREFIX = "/static/dcp_sandbox/images/";
// Key for tagToNode map in cookie
TreeConstants.TAG_TO_NODE = "tagToNode";
// Constants for reconstructing objective/constraint
TreeConstants.OPERATORS = ["+","-","*","/"];
TreeConstants.ELLIPSIS = "...";