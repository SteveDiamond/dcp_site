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

DEFAULT_DIFFICULTY = "intermediate";
DIFFICULTY_MAP = {easy: {prob_terminate: 0.05, prob_increase: 20},
                  intermediate: {prob_terminate: 0.01, prob_increase: 10},
                  advanced: {prob_terminate: 0.01, prob_increase: 5}
                 };

loadNewExpression = function() {
    var hash = window.location.hash;
    if (hash.length > 1) {
        hash = hash.substr(1);
    } else {
        hash = DEFAULT_DIFFICULTY;
    }

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
            positive: false,
            negative: false,
            convex: $("#convex").hasClass("active"),
            concave: $("#concave").hasClass("active"),
            prob_terminate: DIFFICULTY_MAP[hash].prob_terminate,
            prob_increase: DIFFICULTY_MAP[hash].prob_increase,
        },
        success: function(response) {
            TreeConstructor.parseObjective(response);
        }
    });
}