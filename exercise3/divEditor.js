(function () {
    //Constants
    var container = document.getElementById("container");
    var editor = document.getElementById("editor");
    var controls = document.getElementById("controls");
    var borderColorCtrl = document.getElementById("borderColor");
    var borderThicknessCtrl = document.getElementById("borderThickness");
    var backgroundColorCtrl = document.getElementById("backgroundColor");
    var roundedNoCtrl = document.getElementById("roundedNoRdo");
    var roundedYesCtrl = document.getElementById("roundedYesRdo");
    var undoCtrl = document.getElementById("undo");
    var recordCtrl = document.getElementById("record");
    var eraseCtrl = document.getElementById("erase");
    var applyCtrl = document.getElementById("apply");

    //Variables
    var historyStack = [];
    var divElements = {};
    var macroQueue = [];
    var isRecording = false;

    //Event Listeners
    container.addEventListener("dragstart", dragStart, false);
    container.addEventListener("drop", drop, false);
    container.addEventListener("dragover", dragOver, false);

    editor.addEventListener("dragstart", dragStart, false);
    editor.addEventListener("drop", drop, false);
    editor.addEventListener("dragover", dragOver, false);

    controls.addEventListener("change", change, false);
    undoCtrl.addEventListener("click", undo, false);
    recordCtrl.addEventListener("click", record, false);
    eraseCtrl.addEventListener("click", erase, false);
    applyCtrl.addEventListener("click", apply, false);

    window.addEventListener("load", init, false);

    //Event Functions
    function init() {       
        var state;
        for (var i = 0; i < container.children.length; i++) {
            divElements[container.children[i].id] = { historyStack: [], commandStacks: {}, addToHistory: addToHistory };
        }
        
    }

    function dragStart() {
        event.dataTransfer.setData("text", event.target.id);
    }

    function drop() {
        event.preventDefault();
        var data = event.dataTransfer.getData("text");
        var draggedElement = document.getElementById(data)
        event.target.appendChild(draggedElement);
        if (event.target.id == "editor") {
            loadControls(draggedElement);
        }
    }

    function dragOver() {
        event.preventDefault();
    }

    function change() {
        var changedElements = [];
        for (var i = 0; i < editor.children.length; i++) {
            changedElements.push(editor.children[i]);
        }
        if (undoCtrl.disabled && !isRecording && changedElements.length > 0) {
            undoCtrl.disabled = false;
        }
        if (isRecording && eraseCtrl.disabled) {
            eraseCtrl.disabled = false;
        }

        switch (event.target.id) {
            case "borderColor":
                if (changedElements.length > 0) {
                    editorManager.setDivBorderColor(changedElements, borderColorCtrl.value);
                    historyStack.push(changedElements);
                }                
                if (isRecording) {
                    macroQueue.push({ command: "setDivBorderColor", value: borderColorCtrl.value });
                }
                break;
            case "borderThickness":
                if (changedElements.length > 0) {
                    editorManager.setDivBorderThickness(changedElements, borderThicknessCtrl.value);
                    historyStack.push(changedElements);
                }
                if (isRecording) {
                    macroQueue.push({ command: "setDivBorderThickness", value: borderThicknessCtrl.value });
                }
                break;
            case "backgroundColor":
                if (changedElements.length > 0) {
                    editorManager.setDivBackgroundColor(changedElements, backgroundColorCtrl.value);
                    historyStack.push(changedElements);
                }
                if (isRecording) {
                    macroQueue.push({ command: "setDivBackgroundColor", value: backgroundColorCtrl.value });
                }
                break;
            case "roundedYesRdo":
                if (changedElements.length > 0) {
                    editorManager.setDivBorderRadius(changedElements, 50);
                    historyStack.push(changedElements);
                }
                if (isRecording) {
                    macroQueue.push({ command: "setDivBorderRadius", value: "50" });
                }
                break;
            case "roundedNoRdo":
                if (changedElements.length > 0) {
                    editorManager.setDivBorderRadius(changedElements, 0);
                    historyStack.push(changedElements);
                }
                if (isRecording) {
                    macroQueue.push({ command: "setDivBorderRadius", value: "0" });
                }
                break;
        }
    }

    function undo() {
        //pop elements from history stack (hstack)
        //update the elements with their previous style (got from their own hstack)
        var changedElements = historyStack.pop();
        if (changedElements) {
            for (var i = 0; i < changedElements.length; i++) {
                var command = divElements[changedElements[i].id].historyStack.pop();
                if (command) {
                    divElements[changedElements[i].id].commandStacks[command].pop();
                    var state = divElements[changedElements[i].id].commandStacks[command].pop();
                    if (state) {
                        editorManager.execute(state.command, state.element, state.style, true);
                    } else {
                        switch (command) {
                            case "setDivBorderColor":
                                changedElements[i].style.borderColor = "#000000";
                                break;
                            case "setDivBorderThickness":
                                changedElements[i].style.borderWidth = "1px";
                                break;
                            case "setDivBackgroundColor":
                                changedElements[i].style.backgroundColor = "#FFFFFF";
                                break;
                            case "setDivBorderRadius":
                                changedElements[i].style.borderRadius = "0px";
                                break;
                        }
                    }
                }
            }
        }
        if (historyStack.length === 0){
            undoCtrl.disabled = true;
        }
    }

    function record() {
        //turn on recording flag
        if (isRecording) {
            isRecording = false;
            recordCtrl.textContent = "Record Macro";
            if (historyStack.length > 0){
                undoCtrl.disabled = false;
            }
            if (macroQueue.length > 0) {
                applyCtrl.disabled = false;
            }
        } else {
            isRecording = true;
            recordCtrl.textContent = "Stop Recording";
            undoCtrl.disabled = true;
            applyCtrl.disabled = true;
        }
        
    }

    function apply() {
        var changedElements = [];
        for (var i = 0; i < editor.children.length; i++) {
            changedElements.push(editor.children[i]);
        }
        if (undoCtrl.disabled && changedElements.length > 0) {
            undoCtrl.disabled = false;
        }
        if (changedElements.length > 0) {
            for (var i = 0; i < macroQueue.length; i++) {
                var macro = macroQueue[i];
                editorManager.execute(macro.command, changedElements, macro.value);
                historyStack.push(changedElements);
            }
        }
    }

    function erase() {
        macroQueue = [];
        applyCtrl.disabled = true;
        eraseCtrl.disabled = true;
    }

    //Command Pattern
    var editorManager = {
        //update div functions
        setDivBorderColor: function (changedElements, color, isUndo) {
            for (var i = 0; i < changedElements.length; i++) {
                changedElements[i].style.borderColor = color;
                divElements[changedElements[i].id].addToHistory("setDivBorderColor", changedElements[i], color, isUndo);
            }
        },
        setDivBorderThickness: function (changedElements, thickness, isUndo) {
            for (var i = 0; i < changedElements.length; i++) {
                changedElements[i].style.borderWidth = thickness + "px";
                divElements[changedElements[i].id].addToHistory("setDivBorderThickness", changedElements[i], thickness, isUndo);
            }
        },
        setDivBackgroundColor: function (changedElements, color, isUndo) {
            for (var i = 0; i < changedElements.length; i++) {
                changedElements[i].style.backgroundColor = color;
                divElements[changedElements[i].id].addToHistory("setDivBackgroundColor", changedElements[i], color, isUndo);
            }
        },
        setDivBorderRadius: function (changedElements, radius, isUndo) {
            for (var i = 0; i < changedElements.length; i++) {
                changedElements[i].style.borderRadius = radius + "px";
                divElements[changedElements[i].id].addToHistory("setDivBorderRadius", changedElements[i], radius, isUndo);
            }
        },
        //update controls functions
        setCtrlBorderColor: function (color) {
            borderColorCtrl.value = color;
        },
        setCtrlBorderThickness: function (thickness) {
            borderThicknessCtrl.value = thickness;
        },
        setCtrlBackgroundColor: function (color) {
            backgroundColorCtrl.value = color;
        },
        setCtrlBorderRadius: function (radius) {
            if (radius) {
                roundedNoCtrl.checked = true;
            } else {
                roundedYesCtrl.checked = true;
            }
        }

    }

    editorManager.execute = function (commandName) {
        return editorManager[commandName] && editorManager[commandName].apply(editorManager, [].slice.call(arguments, 1));
    }

    //Utility Functions
    function addToHistory(command, element, style, isUndo) {
        var arrayElement = [element];
        var state = { command: command, element: arrayElement, style: style };
        if (!isUndo) {
            divElements[element.id].historyStack.push(command);
        }
        if (!divElements[element.id].commandStacks[command]) {
            divElements[element.id].commandStacks[command] = [];
        }
        divElements[element.id].commandStacks[command].push(state);
    }

    function loadControls(draggedElement) {
        var draggedStyle = window.getComputedStyle(draggedElement);

        editorManager.setCtrlBorderColor(getStyleValue("rgb2hex", draggedStyle.getPropertyValue("border-color")));
        editorManager.setCtrlBorderThickness(getStyleValue("px2int", draggedStyle.getPropertyValue("border-width")));
        editorManager.setCtrlBackgroundColor(getStyleValue("rgb2hex", draggedStyle.getPropertyValue("background-color")));
        editorManager.setCtrlBorderRadius(getStyleValue("px2int", draggedStyle.getPropertyValue("border-radius")));
    }

    //Conversion Functions
    function getStyleValue(type, from) {
        var types = {
            rgb2hex: rgb2hex,
            px2int: px2int,
        }
        return types[type](from);
    }

    function rgb2hex(rgb) {
        if (rgb.search("rgb") == -1) {
            return rgb;
        } else {
            rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }
    }

    function px2int(pixels) {
        return pixels.match(/(\d+)/)[0];
    }

})();