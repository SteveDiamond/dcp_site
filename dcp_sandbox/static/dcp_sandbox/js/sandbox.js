/**
 * Sandbox Module
 * Handles control flow for interacting with the parse tree.
 */
(function($, numeric) {
    $().ready(function(){
        // http://stackoverflow.com/questions/7335780/how-to-post-a-django-form-with-ajax-jquery
        $('#expression').submit(function() { // catch the form's submit event
            TreeConstructor.parseObjective($("#scratchpad")[0].textContent);
            return false;
        });
    });
}(jQuery, numeric));