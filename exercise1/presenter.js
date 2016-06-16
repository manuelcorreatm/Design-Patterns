(function () {
    //private variables
    var wordsParagraph;
    var searchBox;
    var escaperRegex = /[\W]/gi;
    var acceptAllRegex = /[\s\S]+/;

    /*-----------------------------------------------------------------------*/
    //presenter functions
    function updateView(value) {
        var regex = genRegex(value);
        var filteredWords = model.getFilteredCountries(regex);
        updateParagraph(filteredWords);
    }

    function genRegex(value) {
        //generate the regex from the word the user wrote.
        var regex;
        var parsedInput = "";
        if (value) {
            parsedInput = value.replace(escaperRegex, "\\$&");
            regex = RegExp("[\\s\\S]*" + parsedInput + "[\\s\\S]*", "i");
        } else {
            regex = acceptAllRegex;
        }
        return regex;
    }

    function updateParagraph(filteredWords) {
        //get filtered words from model and re render the view
        wordsParagraph.textContent = filteredWords.join(", ");
    }


    /*-----------------------------------------------------------------------*/
    //init

    //create concrete subject
    searchBox = document.getElementById("searchBox");
    observerPattern.createSubject(searchBox);
    searchBox.addEventListener("input", function () {
        searchBox.notify(this.value);
    }, false);

    //create concrete observer
    wordsParagraph = document.getElementById("wordsParagraph");
    observerPattern.addNewObserver(wordsParagraph, searchBox);
    wordsParagraph.update = function (value) {
        updateView(value);
    };

    //Render the words for the first time
    wordsParagraph.update();

})();