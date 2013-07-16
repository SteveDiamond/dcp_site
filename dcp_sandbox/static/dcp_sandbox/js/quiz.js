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
DIFFICULTY_MAP = {easy: 0.5, intermediate: 0.25, advanced: 0.1};

loadNewExpression = function() {
    var hash = window.location.hash;
    if (hash.length > 1) {
        hash = hash.substr(1);
    } else {
        hash = DEFAULT_DIFFICULTY;
    }
    if (isNaN(parseFloat(hash))) {
        var difficulty = DIFFICULTY_MAP[hash];
    } else {
        var difficulty = parseFloat(hash);
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
            prob_terminate: difficulty,
        },
        success: function(response) {
            TreeConstructor.parseObjective(response);
        }
    });
}