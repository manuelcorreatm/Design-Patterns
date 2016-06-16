(function () {
    //Constants
    var canvasMovin = document.getElementById("canvasMovin");
    var canvasPainted = document.getElementById("canvasPainted");
    var contextPainted = canvasPainted.getContext("2d");
    var contextMovin = canvasMovin.getContext("2d");
    var controls = document.getElementById("figures");
    var offsetLeft = canvasMovin.getBoundingClientRect().left - canvasMovin.style.borderWidth + window.scrollX;
    var offsetTop = canvasMovin.getBoundingClientRect().top - canvasMovin.style.borderWidth + window.scrollY;
    var defaultStyle = "black";
    var shadowStyle = "gray";
    var shapeFactory = new ShapeFactory();

    //Variables
    var shapeType;
    var shapeList = [];
    var isDragging = false;
    var draggedShape;

    //Event Listeners
    window.addEventListener("load", function () {
        //reset radio buttons
        var circleRadio = document.getElementById("circleRadio");
        circleRadio.checked = true;
        shapeType = "circle";
    }, false);

    controls.addEventListener("change", function () {
        //changes the shape constructor according to the radio buttons
        shapeType = event.target.value;
    }, false);

    canvasMovin.addEventListener("mousedown", mouseDown, false);
    canvasMovin.addEventListener("mousemove", mouseMove, false);
    canvasMovin.addEventListener("mouseup", mouseUp, false);
    canvasMovin.addEventListener("mouseleave", mouseUp, false);

    //Event Functions
    function mouseDown(event) {
        //calculates position of the click and starts drawing or dragging
        var x = event.pageX - offsetLeft;
        var y = event.pageY - offsetTop;
        
        draggedShape = getShapeIn(x, y);

        if (draggedShape) {
            //start dragging
            isDragging = true;
        } else {
            //Call factory method, draw shape and push it into shapeList
            var newShape = shapeFactory.createShape(shapeType, x, y);
            newShape.draw(contextPainted);
            shapeList.push(newShape);
        }
    }

    function mouseUp(event) {
        //finish dragging, draw shape, push it into shapeList again, and rerender the canvas
        if (isDragging) {
            isDragging = false;
            var x = event.pageX - offsetLeft;
            var y = event.pageY - offsetTop;
            draggedShape.draw(contextPainted, x, y);
            shapeList.push(draggedShape);
            clearCanvas(canvasMovin, contextMovin);
            clearCanvas(canvasPainted, contextPainted);
            for (var i = shapeList.length - 1; i >= 0; i--) {
                var obj = shapeList[i];
                obj.draw(contextPainted);
            }
        }
    }

    function mouseMove(event) {
        //While holding and moving a shape, erase canvas and draw the shape in new position
        if (isDragging) {
            var x = event.pageX - offsetLeft;
            var y = event.pageY - offsetTop;
            clearCanvas(canvasMovin, contextMovin);
            draggedShape.draw(contextMovin, x, y);
        }
    }

    //Utility Functions
    function getShapeIn(x, y) {
        //loops through all the shapes searching for a shape that matches the click. Returns the selected shape.
        for (var i = shapeList.length - 1; i >= 0; i--) {
            var obj = shapeList[i];
            if (obj.check(contextPainted, x, y)) return shapeList.splice(i, 1)[0];
        }
    }

    function clearCanvas(canvas, context) {
        //clears the entire canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    //Factory Method Class
    function ShapeFactory() { }
    ShapeFactory.prototype.createShape = function (shapeType, x, y) {
        switch (shapeType) {
            case "circle":
                this.shapeType = Circle;
                break;
            case "square":
                this.shapeType = Square;
                break;
            case "triangle":
                this.shapeType = Triangle;
                break;
        }
        return new this.shapeType(x, y);
    }

    //Constructors
    //Circle Class
    function Circle(x, y) {
        //location
        this.x = x;
        this.y = y;
        //size
        this.width = 40;
        this.height = 40;
    }
    Circle.prototype.draw = function (context, x, y) {
        if (x && y) {
            this.x = x;
            this.y = y;
        }
        context.beginPath();
        context.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
        context.fill();                
    };
    Circle.prototype.check = function (context, x, y) {
        context.beginPath();
        context.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
        if (context.isPointInPath(x, y)) {
            context.fillStyle = shadowStyle;
            context.fill();
            context.fillStyle = defaultStyle;
            return true;
        }
        return false;
    }

    //Square Class
    function Square(x, y) {
        //location
        this.x = x;
        this.y = y;
        //size
        this.width = 40;
        this.height = 40;
    }
    Square.prototype.draw = function (context, x, y) {
        if (x && y) {
            this.x = x;
            this.y = y;
        }
        context.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    };
    Square.prototype.check = function (context, x, y) {
        context.beginPath();
        context.rect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
        if (context.isPointInPath(x, y)) {
            context.fillStyle = shadowStyle;
            context.fill();
            context.fillStyle = defaultStyle;
            return true;
        }
        return false;
    }

    //Triangle Class
    function Triangle(x, y) {
        //location
        this.x = x;
        this.y = y;
        //size
        this.width = 40;
        this.height = 40;
    }
    Triangle.prototype.draw = function (context, x, y) {
        if (x && y) {
            this.x = x;
            this.y = y;
        }
        context.beginPath();
        context.moveTo(this.x, this.y - (this.height / 2));
        context.lineTo(this.x + (this.width / 2), this.y + (this.height / 2));
        context.lineTo(this.x - (this.width / 2), this.y + (this.height / 2));
        context.fill();
    }
    Triangle.prototype.check = function (context, x, y) {
        context.beginPath();
        context.moveTo(this.x, this.y - (this.height / 2));
        context.lineTo(this.x + (this.width / 2), this.y + (this.height / 2));
        context.lineTo(this.x - (this.width / 2), this.y + (this.height / 2));
        if (context.isPointInPath(x, y)) {
            context.fillStyle = shadowStyle;
            context.fill();
            context.fillStyle = defaultStyle;
            return true;
        }
        return false;
    }

})();

