// Base module for pages that use the parse tree.
(function($) {
    $().ready(function(){
        // Listen to help toggle button.
        $("#help").click(function() {
            if (TreeDisplay.errorState) return;
            TreeConstructor.helpActive = !TreeConstructor.helpActive;
            $("#help").text(TreeConstants.HELP_BUTTON_TEXT[TreeConstructor.helpActive]);
            TreeConstructor.processParseTree(TreeConstructor.root);
        });
    });
}(jQuery));