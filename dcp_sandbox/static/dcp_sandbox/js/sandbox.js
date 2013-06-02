// Sandbox Module
(function($, numeric) {
    // Minimum HORIZ_SEP between boxes
    var HORIZ_SEP = 10;
    // Minimum separation of boxes from edges
    var EDGE_SEP = 10;
    // Constants for computing the box width
    var PIXELS_PER_CHAR = 6; 
    var BOX_CONSTANT = 40;
    var SHORT_NAME_CONSTANT = 10;
    // Constants for block height and space in between
    var BOX_HEIGHT = 20;
    var VERT_SEP = 20;
    // Separation between the first block and the top of the svg element.
    var INIT_VERT_SEP = 20;
    // Constant for text height
    var CHAR_HEIGHT = 12;

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
                    var results = getCenters(relationMatrices, widths, root, numNodes);
                    var centers = results[0];
                    var treeWidth = results[1];
                    $('#chart').html(''); // Clear old tree
                    drawTree('#chart', root, numNodes, levels, widths, centers, treeWidth); // update the DIV
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
        var width = root.name.length * PIXELS_PER_CHAR;
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
          if (i == length-1-i) {
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
    function getCenters(relationMatrices, widths, root, numNodes) {
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
        // Solve the LP
        // http://stackoverflow.com/questions/4342926/how-can-i-send-json-data-to-server
        var data = {'relationMatrices':relationMatrices, 
                    'widths':widths, 
                    'rootTag':root.tag,
                    'numNodes'
                   };
        $.ajax({ // create an AJAX call...
                crossDomain: false, // obviates need for sameOrigin test
                beforeSend: function(xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
                },
                url: 'solveLP',
                type: 'POST',
                contentType:'application/json',
                data: JSON.stringify(data),
                dataType:'json',
                success: function(response) { // on success..
                }
              });
        var result = numeric.solveLP(c, A, b, C, d);
        var x = result.solution;
        var centers = x.slice(0,numNodes);
        var max = x[numNodes];
        return [centers,max];
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
        // http://bl.ocks.org/mbostock/1093025
        var numLevels = levels.length;
        var treeHeight = numLevels*BOX_HEIGHT + (numLevels-1)*VERT_SEP + INIT_VERT_SEP;

        var svg = d3.select(location).append("svg:svg")
            .attr("width", treeWidth)
            .attr("height", treeHeight);

        for (var i=0; i < numLevels; i++) {
            var nodeEnter = svg.selectAll("rect"+i)
               .data(levels[i])
               .enter()
               .append("svg:g")
               .attr("class", "node")
               .attr("transform", function(d) { return "translate(" + (centers[d.tag] - 0.5*widths[d.tag]) +
                                                        "," + levelY(i) + ")"; })

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
        }
    }

    /**
     * Gets the y-coordinate of nodes at the given level.
     */
    function levelY(level) {
        return level*(BOX_HEIGHT + VERT_SEP) + INIT_VERT_SEP;
    }
}(jQuery, numeric));

  /*http://stackoverflow.com/questions/6802085/jquery-ui-styled-text-input-box
  $('input:text, input:password')
  .button()
  .css({
          'font' : 'inherit',
         'color' : 'inherit',
    'text-align' : 'left',
       'outline' : 'none',
        'cursor' : 'text'
  });*/
/*
  setTimeout(function() {

            svg.selectAll("line")
               .data(links)
               .enter().append("line")
               .attr("class", "link")
               .attr("x1", function(d) { return d.source.x; })
               .attr("y1", function(d) { return d.source.y; })
               .attr("x2", function(d) { return d.target.x; })
               .attr("y2", function(d) { return d.target.y; });

            svg.append("svg:g")
               .selectAll("circle")
               .data(nodes)
               .enter().append("svg:circle")
               .attr("class", "node")
               .attr("cx", function(d) { return d.x; })
               .attr("cy", function(d) { return d.y; })
               .attr("r", 4);

            svg.append("svg:g")
               .selectAll("text")
               .data(nodes)
               .enter().append("svg:text")
               .attr("class", "label")
               .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
               .attr("text-anchor", "middle")
               .attr("y", ".3em")
               .text(function(d) { return d.value; });

        }, 10);

  function update() {
    var nodes = flatten(root),
        links = d3.layout.tree().links(nodes);
    //addLevelLinks(nodes, links);

    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .start();

    // Update the links…
    link = vis.selectAll("line.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links.
    link.enter().insert("svg:line", ".node")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.level * 50; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.level * 50; });

    // Exit any old links.
    link.exit().remove();

    // Update the nodes…
    node = vis.selectAll("circle.node")
        .data(nodes, function(d) { return d.id; })
        .style("fill", color);

    // Enter any new nodes.
    node.enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.level *50})//return d.y; })
        .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
        .style("fill", color)
        .on("click", click)
        .call(force.drag);

    // Exit any old nodes.
    node.exit().remove();
  }

  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.level * 50; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.level * 50; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.level *50});
  }

  // Color leaf nodes orange, and packages white or blue.
  function color(d) {
    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update();
  }

  // Returns a list of all nodes under the root.
  function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      if (!node.id) node.id = ++i;
      nodes.push(node);
    }

    recurse(root);
    return nodes;
  }

  // Add links between nodes at the same level
  function addLevelLinks(nodes, links) {
    for (var i=0; i < nodes.length; i++) {
      for (var j=i+1; j < nodes.length; j++) {
        if (nodes[i].level == nodes[j].level && nodes[i].id < nodes[j].id) {
          links.push({source : nodes[i], target: nodes[j]})
        }
      }
    }
  }

    // Records the distance from the root for all descendents.
  function assignLevels(root, level) {
    root.level = level;
    if(root.children) {
      for (var i=0; i < root.children.length; i++) {
        assignLevels(root.children[i],level+1)
      }
    }
  };

  // Add siblings
  function addSiblings(root) {
    if(!root.children) return;
    for (var i=0; i < root.children.length; i++) {
      for (var j=i+1; j < root.children.length; j++) {
        if(!root.children[i].siblings) root.children[i].siblings = [];
        root.children[i].siblings.push(root.children[j]);
        if(!root.children[j].siblings) root.children[j].siblings = [];
        root.children[j].siblings.push(root.children[i]);
      }
    }

    for (var i=0; i < root.children.length; i++) {
      addSiblings(root.children[i]);
    }
  }
}*/