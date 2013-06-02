// Sandbox Module
(function($, numeric) {
    // Minimum HORIZ_SEP between boxes
    var HORIZ_SEP = 10;
    // Minimum separation of boxes from edges
    var EDGE_SEP = 10;
    // Constants for computing the box width
    var BOX_CONSTANT = 40;
    var SHORT_NAME_CONSTANT = 10;
    var FONT = "12px sans-serif";
    // Constants for block height and space in between
    var BOX_HEIGHT = 20;
    var VERT_SEP = 20;
    // Separation between the first block and the top of the svg element.
    var EDGE_VERT_SEP = 20;
    // Constant for text height
    var CHAR_HEIGHT = 12;
    // Tree location
    var TREE_DIV = "#chart";

    $().ready(function(){
        // http://stackoverflow.com/questions/7335780/how-to-post-a-django-form-with-ajax-jquery
        $('#expression').submit(function() { // catch the form's submit event
            $.ajax({ // create an AJAX call...
                data: $(this).serialize(), // get the form data
                type: $(this).attr('method'), // GET or POST
                url: $(this).attr('action'), // the file to call
                success: function(response) { // on success..
                    var root = JSON.parse(response); // Load parse tree
                    var numNodes = augmentTree(root, 0); // Add short_name nodes and number nodes.
                    var widths = [];
                    getWidths(root, widths); // get node box widths
                    // Map distance from root to list of nodes in left to right order.
                    var levels = [];
                    generateLevels(root, levels, 0);
                    // Returns [P,RNode,RWidth] where Px = 0, RNodex >= RWidthw + SEPARTION*1
                    var relationMatrices = getRelations(root, numNodes, levels); 
                    // Solves LP to get box centers with minimum tree width.
                    // Then draws tree.
                    getCenters(relationMatrices, widths, numNodes, root, levels);
                }
            });
            return false;
        });
    });

    /**
     * Adds short_name nodes (e.g. log_sum_exp from log_sum_exp(x,y),
     * numbers the nodes in a preorder traversal (starting at 0, stored in tag attribute).
     */
    function augmentTree(root, nextTag) {
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
            nextTag = augmentTree(shortNameNode.children[i], nextTag);
        }
        return nextTag;
    }

    /**
     * Determines the box widths based on the number of characters in the name.
     */
    function getWidths(root, widths) {
        var width = root.name.width(FONT);
        if (root.isShortNameNode) {
            width += SHORT_NAME_CONSTANT;
        } else {
            width += BOX_CONSTANT;
        }
        widths[root.tag] = width;
        if(!root.children) return;
        for (var i=0; i < root.children.length; i++) {
            getWidths(root.children[i], widths);
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
     * Returns [P,RNode,RWidth] where Px = 0, RNodex >= RWidthw + HORIZ_SEP*1.
     * P ensures symmetry of children and parent nodes.
     * RNode and RWidth ensure that boxes do not overlap.
     */
    function getRelations(root, numNodes, levels) {
        // Create P
        var P = [];
        generateP(root, numNodes, P);
        var RNode = [];
        var RWidth = [];
        generateR(levels, numNodes, RNode, RWidth);
        return [P,RNode,RWidth];
    }

    /**
     * Sets rows of P so that for center children, child.tag = 1, parent.tag = -1
     * and for paired children, child1.tag = 1/2, child2.tag = 1/2, parent.tag = -1.
     */
    function generateP(root, numNodes, P) {
        if(!root.children) return;
        var length = root.children.length;
        for (var i=0; i < length/2; i++) {
          if (true || i == length-1-i) {
            var arr = makeArrayOf(0, numNodes);
            arr[root.tag] = -1;
            // Works for paired and unpaired.
            var child1 = root.children[i];
            var child2 = root.children[length-1-i];
            arr[child1.tag] += 1/2;
            arr[child2.tag] += 1/2;
            P.push(arr);
          }
        }

        // Recurse on children
        for (var i=0; i < length; i++) {
            generateP(root.children[i], numNodes, P);
        }
    }

    /**
     * Sets entry i of levels to be an array of the nodes at level i in left to right order.
     */
    function generateLevels(root, levels, curLevel) {
        if(!levels[curLevel]) {
          levels[curLevel] = [];
        }
        levels[curLevel].push(root);

        // Recurse on children
        if(!root.children) return;
        for (var i=0; i < root.children.length; i++) {
            generateLevels(root.children[i], levels, curLevel+1);
        }
    }

    /**
     * Sets rows of RNode so that if on level l, node i.tag = -1 and node i+1.tag = 1.
     * Similarly sets rows of RWidth so that node i.tag = node i+1.tag = 1/2.
     * Thus each node has a relation with its neighbor to the right. 
     */
    function generateR(levels, numNodes, RNode, RWidth) {
        for (var level=0; level < levels.length; level++) {
            var nodes = levels[level];
            for (var i=0; i < nodes.length-1; i++) {
                var arr = makeArrayOf(0, numNodes);
                arr[nodes[i].tag] = -1;
                arr[nodes[i+1].tag] = 1;
                RNode.push(arr);
                var arr = makeArrayOf(0, numNodes);
                arr[nodes[i].tag] = 1/2;
                arr[nodes[i+1].tag] = 1/2;
                RWidth.push(arr);
            }
        }
    }

    /**
     * Solves the following LP to get box centers while minimizing tree width:
     * minimize max
     * subject to:
     *  centers + 0.5*widths <= max*1
     *  centers - 0.5*widths >= 0
     *  RNode*centers >= RWidth*widths + HORIZ_SEP*1
     *  Px = 0
     */
    function getCenters(relationMatrices, widths, numNodes, root, levels) {
        // x = [centers; max]
        var P = relationMatrices[0];
        var RNode = relationMatrices[1];
        var RWidth = relationMatrices[2];
        // Put into form: minimize c*x subject to A*x <= b, C*x = d.
        // Inequality constraints
        var b = numeric.dot(RWidth, widths);
        b = numeric.add(b, makeArrayOf(HORIZ_SEP, b.length));
        b = numeric.neg(b);
        // Combine inequality constraints
        for (var j=0; j < 2; j++) {
            for (var i=0; i < widths.length; i++) {
                b.push(-0.5*widths[i] - EDGE_SEP);
            }
        }
        var A = RNode;
        // Add space for max
        for (var i=0; i < A.length; i++) {
            A[i].push(0);
        }
        A = numeric.neg(A);
        // Combine inequality constraints
        // center - 1/2 width >= 0
        var I = numeric.identity(numNodes + 1);
        I.pop();
        I = numeric.neg(I);
        for (var i=0; i < I.length; i++) {
            A.push(I[i]);
        }
        // center + 1/2 width <= max
        I = numeric.identity(numNodes + 1);
        I.pop();
        for (var i=0; i < I.length; i++) {
            I[i][numNodes] = -1;
            A.push(I[i]);
        }
        // Equality constraints
        var C = P;
        // Add space for max
        for (var i=0; i < C.length; i++) {
            C[i].push(0);
        }
        var d = makeArrayOf(0, C.length);

        var c = makeArrayOf(0, numNodes+1);
        c[numNodes] = 1;
        // Solve the LP server side
        // http://stackoverflow.com/questions/4342926/how-can-i-send-json-data-to-server
        var data = {'c':c, 'A':A, 'b':b, 'C':C, 'd':d};
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
                $(TREE_DIV).html(''); // Clear old tree
                drawTree(TREE_DIV, root, numNodes, levels, widths, centers, treeWidth); // update the DIV
            }
        });
        return false;
    }

    /**
     * Utility function for initializing arrays so all cells
     * hold a given value.
     * http://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array
     */
    function makeArrayOf(value, length) {
        var arr = []; var i = length;
        while (i--) {
            arr[i] = value;
        }
        return arr;
    }

    /**
     * Draws the parse tree.
     */
    function drawTree(location, root, numNodes, levels, widths, centers, treeWidth) {
        // Inspired by http://bl.ocks.org/mbostock/1093025
        var numLevels = levels.length;
        var treeHeight = numLevels*BOX_HEIGHT + (numLevels-1)*VERT_SEP + 2*EDGE_VERT_SEP;

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
               .attr("transform", function(d) { return "translate(" + (centers[d.tag] - 0.5*widths[d.tag]) +
                                                        "," + getLevelY(i) + ")"; })

            nodeEnter.append("svg:rect")
               .attr("width", function(d) { return widths[d.tag]; })
               .attr("height", BOX_HEIGHT);

            nodeEnter.append("svg:text")
                .attr("dy", BOX_HEIGHT/2 + CHAR_HEIGHT/4)
                .attr("dx", function (d) { if (d.isShortNameNode) {
                                                return SHORT_NAME_CONSTANT/2;
                                            } else {
                                                return BOX_CONSTANT/2;
                                            } 
                                          })
                .text(function(d) { return d.name; });
            // Draw links
            for (var node=0; node < levels[i].length; node++) {
                var cur = levels[i][node];
                if (cur.children) {
                    svg.selectAll("level"+i+",node"+node)
                       .data(cur.children)
                       .enter()
                       .append("svg:line")
                       .attr("class", "link")
                       .attr("x1", centers[cur.tag])
                       .attr("y1", getLevelY(i) + BOX_HEIGHT)
                       .attr("x2", function(d) { return centers[d.tag]; })
                       .attr("y2", getLevelY(i+1))
                }
            }
        }
    }

    /**
     * Gets the y-coordinate of nodes at the given level.
     */
    function getLevelY(level) {
        return level*(BOX_HEIGHT + VERT_SEP) + EDGE_VERT_SEP;
    }
}(jQuery, numeric));