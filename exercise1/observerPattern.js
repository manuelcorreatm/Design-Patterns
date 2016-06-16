/*-----------------------------------------------------------------------*/
//Observer Pattern Module
var observerPattern = (function () {

    /*-----------------------------------------------------------------------*/
    //Observer Class

    function Observer() {
        this.update = function () {
            //method to be overriden by the concrete class
        }
    }

    /*-----------------------------------------------------------------------*/
    //Subject Class

    function Subject() {
        this.observers = new ObserverList();
    }

    Subject.prototype.addObserver = function (observer) {
        this.observers.add(observer);
    };

    Subject.prototype.removeObserver = function (observer) {
        this.observers.removeAt(this.observers.indexOf(observer, 0));
    };

    Subject.prototype.notify = function (context) {
        var observerCount = this.observers.count();
        for (var i = 0; i < observerCount; i++) {
            this.observers.get(i).update(context);
        }
    };

    /*-----------------------------------------------------------------------*/
    //ObserverList Class

    function ObserverList() {
        this.observerList = [];
    }

    ObserverList.prototype.add = function (obj) {
        return this.observerList.push(obj);
    };

    ObserverList.prototype.count = function () {
        return this.observerList.length;
    };

    ObserverList.prototype.get = function (index) {
        if (index > -1 && index < this.observerList.length) {
            return this.observerList[index];
        }
    };

    ObserverList.prototype.indexOf = function (obj, startIndex) {
        var i = startIndex;
        while (i < this.observerList.length) {
            if (this.observerList[i] === obj) {
                return i;
            }
            i++;
        }
        return -1;
    };

    ObserverList.prototype.removeAt = function (index) {
        this.observerList.splice(index, 1);
    }

    /*-----------------------------------------------------------------------*/
    //implementation methods

    function addNewObserver(observer, subject) {
        extend(observer, new Observer());
        subject.addObserver(observer);
    }

    function createSubject(obj) {
        extend(obj, new Subject());
    }


    /*-----------------------------------------------------------------------*/
    //utils

    function extend(obj, extension) {
        for (var key in extension) {
            obj[key] = extension[key];
        }
    }

    /*-----------------------------------------------------------------------*/
    //return module

    return {
        createSubject: createSubject,
        addNewObserver: addNewObserver
    }
})();

