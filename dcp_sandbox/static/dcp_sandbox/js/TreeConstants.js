/**
 * Constants used in sandbox.js and Tree classes.
 */
function TreeConstants() {

}
// Tag of the root node.
TreeConstants.ROOT_TAG = 0;
// Minimum separation between siblings.
TreeConstants.MIN_SIB_SEP = 20;
// Minimum separation between cousins.
TreeConstants.MIN_COUS_SEP = 40;
// Minimum HORIZ_SEP between boxes
TreeConstants.HORIZ_SEP = 10;
// Minimum separation of boxes from edges
// Depends on whether legends present.
TreeConstants.EDGE_SEP = {true: 10, false: 100}
// Constants for computing the box width
TreeConstants.BOX_CONSTANT = 40;
TreeConstants.SHORT_NAME_CONSTANT = 10;
TreeConstants.FONT = "14px sans-serif";
// Constants for block height and space in between
TreeConstants.BOX_HEIGHT = 30;
TreeConstants.VERT_SEP = 20;
// Separation between the first block and the top of the svg element.
TreeConstants.EDGE_VERT_SEP = 20;
// Margin around curvature and sign symbols
TreeConstants.SYMBOL_MARGIN = TreeConstants.BOX_CONSTANT/12;
// Can the browser handle svg subimages?
TreeConstants.SVG_IMAGE_SUFFIX = navigator.userAgent.indexOf("Firefox") == -1 ? ".svg" : ".png";
// Classes for left and right symbols.
TreeConstants.LEFT_SYMBOL = "left";
TreeConstants.RIGHT_SYMBOL = "right";
// Tree location
TreeConstants.TREE_DIV = "#chart";
// Location of images
TreeConstants.IMAGE_PREFIX = "/static/dcp_sandbox/images/";
// Key for tagToNode map in cookie
TreeConstants.TAG_TO_NODE = "tagToNode";
// Constants for reconstructing objective/constraint
TreeConstants.OPERATORS = ["+","-","*","/","<=",">=","=="];
TreeConstants.ELLIPSIS = "...";
// Constants for the legend listing the variables and parameters used.
TreeConstants.LEAVES_TEXT_HEIGHT = 22;
TreeConstants.LEAVES_ARROW_HEIGHT = 22;
TreeConstants.LEAVES = {
    "Variables": ["x", "y", "z", "u", "v", "w"],
    "Parameters": ["a", "b", "c"],
    "Positive Parameters": ["d", "e", "f"],
}
// The text in the leaf legend at the analyzer prompt.
TreeConstants.PROMPT_LEAF_LEGEND = [
    "Variables: x,y,z,u,v,w",
    "Parameters: a,b,c",
    "Positive Parameters: d,e,f",
    "Constants: Any",
    "Functions: See Functions page",
]
// Editable and fixed text classes.
TreeConstants.EDITABLE_TEXT = "editable-text";
TreeConstants.FIXED_TEXT = "fixed-text";
// Class of a node in an error state.
TreeConstants.ERROR_NODE = "error-node";
// Initial prompt
TreeConstants.PROMPT = "Click here and type in an expression.";
TreeConstants.PROMPT_CONSTANT = 200;
// Demo objective
TreeConstants.DEMO = "log(square(z)) - log_sum_exp(2*x*z, -square(y), z) + (norm(x,3) + log(y))";

// Map of help active/inactive to help button text.
TreeConstants.HELP_BUTTON_TEXT = {true: "Hide Legends", false: "Show Legends"}

// Legend constants
// Space for legends on the left and right.
TreeConstants.LEGEND_PADDING = 75;
TreeConstants.LEGEND_WIDTH = 200;
TreeConstants.LEGEND_TEXT_HEIGHT = 30;
TreeConstants.LEGEND_ARROW_WIDTH = 8;
TreeConstants.LEGEND_ARROW_HEIGHT = 2*TreeConstants.LEGEND_ARROW_WIDTH;
TreeConstants.CURVATURE_LEGEND = {"title": "Curvature",
    "text": [{"symbol": "constant", "name": "constant"},
             {"symbol": "affine", "name": "affine"},
             {"symbol": "convex", "name": "convex"},
             {"symbol": "concave", "name": "concave"},
             {"symbol": "non-convex", "name": "unknown"},
            ],
    "left": true,
};
TreeConstants.SIGN_LEGEND = {"title": "Sign", 
    "text": [{"symbol": "positive", "name": "positive"},
             {"symbol": "negative", "name": "negative"},
             {"symbol": "unknown", "name": "unknown"},
            ],
    "left": false,
};

// Alert div location.
TreeConstants.ERROR_DIV = "#errorPlaceholder";

// Query prefix for passing expressions in URL
TreeConstants.URL_QUERY_PREFIX = "?expr=";
