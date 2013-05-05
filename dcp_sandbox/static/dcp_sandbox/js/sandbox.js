$().ready(function(){
  //drawTree()
  // http://stackoverflow.com/questions/7335780/how-to-post-a-django-form-with-ajax-jquery
  $('#expression').submit(function() { // catch the form's submit event
      $.ajax({ // create an AJAX call...
          data: $(this).serialize(), // get the form data
          type: $(this).attr('method'), // GET or POST
          url: $(this).attr('action'), // the file to call
          success: function(response) { // on success..
              $('#chart').html(''); // Clear old tree
              drawTree('#chart', response); // update the DIV
          }
      });
      return false;
  });
});



function drawTree(container, json_str) {
  // http://bl.ocks.org/mbostock/1093025
  var w = 960,
      h = 800,
      i = 0,
      barHeight = 20,
      barWidth = w * .8,
      duration = 400,
      root;

  var tree = d3.layout.tree()
      .size([h, 100]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var vis = d3.select(container).append("svg:svg")
      .attr("width", w)
      .attr("height", h)
    .append("svg:g")
      .attr("transform", "translate(20,30)");
  
  var json = JSON.parse(json_str);
  json.x0 = 0;
  json.y0 = 0;
  update(root = json);

  // d3.json("/static/dcp_sandbox/js/flare.json", function(json) {
  //   json.x0 = 0;
  //   json.y0 = 0;
  //   update(root = json);
  // });

  function update(source) {

    // Compute the flattened node list. TODO use d3.layout.hierarchy.
    var nodes = tree.nodes(root);
    
    // Compute the "layout".
    nodes.forEach(function(n, i) {
      n.x = i * barHeight;
    });
    
    // Update the nodes…
    var node = vis.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });
    
    var nodeEnter = node.enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .style("opacity", 1e-6);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("svg:rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", barWidth)
        .style("fill", color)
        .on("click", click);
    
    nodeEnter.append("svg:text")
        .attr("dy", 3.5)
        .attr("dx", 5.5)
        .style("font-size", 12)
        .text(function(d) { 
          return nodeToStr(d); 
        });
    
    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);
    
    node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
      .select("rect")
        .style("fill", color);
    
    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6)
        .remove();
    
    // Update the links…
    var link = vis.selectAll("path.link")
        .data(tree.links(nodes), function(d) { return d.target.id; });
    
    // Enter any new links at the parent's previous position.
    link.enter().insert("svg:path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        })
      .transition()
        .duration(duration)
        .attr("d", diagonal);
    
    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);
    
    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();
    
    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
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
    update(d);
  }

  // String representation for a node
  function nodeToStr(d) {
    result = "Function: " + d.short_name // TODO Variable, Parameter, Operator
    // Add arguments for non-leaf nodes
    children = d.children || d._children;
    if (children) {
      result += "; Arguments: "
      for (var i=0; i < children.length; i++){
        result += children[i].name;
        // Add monotonicity if appropriate
        if (d.monotonicity) {
          result += " " + d.monotonicity[i];
        }
        if (i < children.length - 1) result += ", ";
      }
    }

    result += "; Curvature: " + d.curvature + "; Sign: " + d.sign
    return result;
  }

  // Dark blue hidden with children, light blue for no hidden children,
  // red for DCP violation that causes non-convexity, black for inherited non-convexity
  function color(d) {
    if (nonConvex(d)) {
      return errorOrigin(d) ? "red" : "black";
    } else {
      return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
    }
  }

  function nonConvex(d) {
    return d.curvature == "non-convex"
  }

  function errorOrigin(d) {
    children = d.children || d._children;
    for (var i=0; i < children.length; i++){
      if (nonConvex(children[i])) return false;
    }
    return true;
  }
}