/**
 * Manipulates the tree object.
 */
function TreeConstructor() {

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