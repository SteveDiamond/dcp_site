/**
 * Quiz Module
 * Handles page load for quiz.
 */
(function($) {
    DEFAULT_DIFFICULTY = "intermediate";
    DIFFICULTY_MAP = {easy: {prob_terminate: 0.05, prob_increase: 20},
                      intermediate: {prob_terminate: 0.01, prob_increase: 10},
                      advanced: {prob_terminate: 0.01, prob_increase: 5}
                     };
    EXPRESSION_TYPES = [{convex: true, concave: false, dcp:true},
                        {convex: false, concave: true, dcp:true},
                        {convex: false, concave: false, dcp:false},
                       ];
    // Internal curvature name to display name.
    CURVATURE_DISPLAY_NAME = {"constant": "constant",
                              "affine": "affine",
                              "convex": "convex",
                              "concave": "concave",
                              "non-convex": "non-DCP"
                             }

    $().ready(function(){
        // Start with answers hidden.
        $(".answers").hide();
        // Nodes in the parse tree cannot be edited.
        TreeConstructor.editable = false;
        // Listen to new expression button.
        $("#newExpression").click(loadNewExpression);
        // Start with an expression.
        $("#newExpression").click();
        // Listen to the answer buttons.
        $(".answer").click(showParseTree);
    });

    // Generate and display a random expression.
    function loadNewExpression() {
        // Hide the new expression button until the user selects an answer.
        toggleButtons();
        var difficulty = getDifficulty();
        // http://stackoverflow.com/questions/10134237/javascript-random-integer-between-two-numbers
        var choice = Math.floor(Math.random() * 3);
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
                convex: EXPRESSION_TYPES[choice].convex,
                concave: EXPRESSION_TYPES[choice].concave,
                prob_terminate: DIFFICULTY_MAP[difficulty].prob_terminate,
                prob_increase: DIFFICULTY_MAP[difficulty].prob_increase,
                dcp: EXPRESSION_TYPES[choice].dcp,
            },
            success: function(response) {
                $(".alert").alert('close');
                // Don't show help for the box with the expression.
                TreeConstructor.promptActive = true;
                var expression = {name: response};
                TreeConstructor.processParseTree(expression);
            }
        });
    }

    // Get the current difficulty.
    function getDifficulty() {
        var hash = window.location.hash;
        if (hash.length > 1) {
            hash = hash.substr(1);
        } else {
            hash = DEFAULT_DIFFICULTY;
        }
        return hash;
    }

    /**
     * Show the full parse tree for the current expression.
     * answerBtn - the answer button clicked.
     */
    function showParseTree() {
        // Hide the answers until the user generates a new expression.
        toggleButtons();
        var expression = $("#"+TreeConstants.ROOT_TAG).text();
        // Show help if active.
        TreeConstructor.promptActive = false;
        var fn = partial(feedbackForAnswer, this.id);
        TreeConstructor.parseObjective(expression, TreeConstants.ROOT_TAG, fn);
    }

    /**
     * Show error message from the parser.
     * http://stackoverflow.com/questions/10082330/dynamically-create-bootstrap-alerts-box-through-javascript
     * answer - the user's answer.
     */
    function feedbackForAnswer(answer) {
        var curvature = TreeConstructor.root.curvature;
        if (curvature == answer) {
            var message = "The expression is " + CURVATURE_DISPLAY_NAME[curvature] +
                          ". Click \"New Expression\" to continue."
            $(TreeConstants.ERROR_DIV).html('<div class="alert alert-success">' +
            '<span><strong>Correct!</strong> ' + message + '</span></div>')
        } else {
            var message = "The expression is " + CURVATURE_DISPLAY_NAME[curvature] + 
                          ", but you answered " + CURVATURE_DISPLAY_NAME[answer] +
                          ". Click \"New Expression\" to continue."
            $(TreeConstants.ERROR_DIV).html('<div class="alert alert-error">' +
            '<span><strong>Incorrect!</strong> ' + message + '</span></div>')
        }  
    }

    // Alternately hide and show the answer buttons and new expression button.
    function toggleButtons() {
        $(".answers").toggle();
        $(".new-expression").toggle();
    }

    // Utility function to call functions with some arguments supplied.
    // http://stackoverflow.com/questions/321113/how-can-i-pre-set-arguments-in-javascript-function-call-partial-function-appli
    function partial(func /*, 0..n args */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
            return func.apply(this, args);
        };
    }
}(jQuery))