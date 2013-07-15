$(document).ready(function(){
    module("Tree Tests");

    test( "Test makeArrayOf", 1, function() {
        deepEqual(TreeConstructor.makeArrayOf(-1,3), [-1,-1,-1], "Passed!" );
    });

    test( "Test getSurroundingParens", 3, function() {
        equal(TreeConstructor.getSurroundingParens("(a)+1"), 0, "Passed!" );
        equal(TreeConstructor.getSurroundingParens("(((a)+1)-1)"), 1, "Passed!" );
        equal(TreeConstructor.getSurroundingParens("((((a)+1)-1))"), 2, "Passed!" );
    });
});