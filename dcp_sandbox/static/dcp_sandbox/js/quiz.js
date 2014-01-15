/**
 * Quiz Module
 * Handles page load for quiz.
 */
(function($) {
    // Level constants and variables.
    rightStreakLength = 0;
    wrongStreakLength = 0;
    level = 0;
    STREAK_TO_LEVEL_UP = 5;
    STREAK_TO_LEVEL_DOWN = 5;
    MAX_LEVEL = 2;
    // Difficulty contants.
    EASY_KEY = "Easy";
    MEDIUM_KEY = "Medium";
    HARD_KEY = "Hard";
    LEVEL_TO_DIFFICULTY = [EASY_KEY, MEDIUM_KEY, HARD_KEY];

    DIFFICULTY_MAP = {}
    DIFFICULTY_MAP[EASY_KEY] = {prob_terminate: 0.05, prob_increase: 20};
    DIFFICULTY_MAP[MEDIUM_KEY] = {prob_terminate: 0.01, prob_increase: 10};
    DIFFICULTY_MAP[HARD_KEY] = {prob_terminate: 0.01, prob_increase: 5};

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
    CONTINUE_BUTTON = "<button type=\"button\" " +
                      "id=\"newExpression\" " +
                      "class=\"btn btn-primary new-expression\">" +
                      "New Expression</button>";

    $().ready(function(){
        // Start with answers hidden.
        $(".answers").hide();
        // Nodes in the parse tree cannot be edited.
        TreeConstructor.editable = false;
        // Start with an expression.
        loadNewExpression();
        // Listen to the answer buttons.
        $(".answer").click(showParseTree);
        // Listen for change in difficulty.
        $(window).bind( 'hashchange', setDifficulty);
    });

    // Generate and display a random expression.
    function loadNewExpression() {
        var difficulty = getDifficulty();
        // Display the current difficulty.
        displayDifficulty(difficulty);
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
                function fn(root) {
                    TreeConstructor.setLeafLegendText(root);
                    $(".alert").alert('close');
                    // Don't show help for the box with the expression.
                    TreeConstructor.promptActive = true;
                    var expression = {name: response};
                    TreeConstructor.processParseTree(expression);
                    // Hide the new expression button until the user selects an answer.
                    $(".new-expression").hide();
                    $(".answers").show();
                }
                // After receiving parse tree, calls fn.
                TreeConstructor.parseObjective(response, fn);
            }
        });
    }

    // Get the current difficulty.
    function getDifficulty() {
        return LEVEL_TO_DIFFICULTY[level];
    }

    /**
     * Show the current difficulty.
     */
    function displayDifficulty(difficulty) {
        $("#difficulty").html("Difficulty: " + difficulty + 
                              " <b class=\"caret\"></b>");
    }

    /**
     * Loads a new expression with the difficulty
     * specified by the hash and resets level variables.
     */
     function setDifficulty() {
        var hash = window.location.hash;
        if (hash.length > 1) {
            hash = hash.substr(1);
            newLevel = LEVEL_TO_DIFFICULTY.indexOf(hash);
            if (newLevel != -1) {
                level = newLevel;
                rightStreakLength = 0;
                wrongStreakLength = 0;
                loadNewExpression();
            }
            window.location.hash = "";
        }
     }

    /**
     * Show the full parse tree for the current expression.
     */
    function showParseTree() {
        // Hide the answers until the user generates a new expression.
        $(".new-expression").show();
        $(".answers").hide();
        var expression = $("#"+TreeConstants.ROOT_TAG).text();
        // Show help if active.
        TreeConstructor.promptActive = false;
        var fn = partial(feedbackForAnswer, this.id);
        TreeConstructor.createParseTree(expression, TreeConstants.ROOT_TAG, fn);
    }

    /**
     * Show error message from the parser.
     * http://stackoverflow.com/questions/10082330/dynamically-create-bootstrap-alerts-box-through-javascript
     * answer - the user's answer.
     */
    function feedbackForAnswer(answer) {
        var curvature = TreeConstructor.root.curvature;
        var suffix = ". " + CONTINUE_BUTTON;
        if (curvature == answer) {
            var message = "The expression is " + 
                          CURVATURE_DISPLAY_NAME[curvature] + suffix;
            $(TreeConstants.ERROR_DIV).html('<div class="alert alert-success">' +
            '<span><strong>Correct!</strong> ' + message + '</span></div>')
        } else {
            var message = "The expression is " + CURVATURE_DISPLAY_NAME[curvature] + 
                          ", but you answered " + CURVATURE_DISPLAY_NAME[answer] +
                           suffix;
            $(TreeConstants.ERROR_DIV).html('<div class="alert alert-error">' +
            '<span><strong>Incorrect!</strong> ' + message + '</span></div>')
        }
        // Increase/decrease difficulty
        updateLevel(curvature == answer);
        // Listen to new expression button.
        $("#newExpression").click(loadNewExpression);
    }

    /**
     * Increase/decrease difficulty in response to streaks of correct/incorrect
     * answers.
     * correct - was the user's answer correct?
     */
    function updateLevel(correct) {
        if (correct) {
            rightStreakLength++;
            wrongStreakLength = 0;
        } else {
            rightStreakLength = 0;
            wrongStreakLength++;
        }
        // Increase/decrease difficulty based on performance.
        if (rightStreakLength >= STREAK_TO_LEVEL_UP) {
            rightStreakLength = 0;
            level = Math.min(level + 1, MAX_LEVEL)
        } else if (wrongStreakLength >= STREAK_TO_LEVEL_DOWN) {
            wrongStreakLength = 0;
            level = Math.max(level - 1, 0);
        }
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