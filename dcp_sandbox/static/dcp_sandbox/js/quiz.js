/**
 * Quiz Module
 * Handles page load for quiz.
 */
(function($) {
    $().ready(function(){
        // Listen to new expression button.
        $("#newExpression").click(loadNewExpression);
    });
}(jQuery))

loadNewExpression = function() {
    TreeDisplay.errorState = false;
    $.ajax({ // create an AJAX call...
        crossDomain: false,
                    beforeSend: function(xhr, settings) {
                        xhr.setRequestHeader("X-CSRFToken", 
                                             $.cookie('csrftoken'));
                    },
        url: 'new_expr',
        type: 'POST',
        data: {
            true_str: "true",
            positive: $("#positive").hasClass("active"),
            negative: $("#negative").hasClass("active"),
            convex: $("#convex").hasClass("active"),
            concave: $("#concave").hasClass("active"),
            prob_terminate: 0.1,
        },
        success: function(response) {
            TreeConstructor.parseObjective(response);
        }
    });
}