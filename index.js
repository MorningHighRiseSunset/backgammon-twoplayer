var Board = {
    initialBoardState: [ 
        [2, 0], [0, 0], [0, 0], [0, 0], [0, 0], [5, 1],
        [0, 0], [3, 1], [0, 0], [0, 0], [0, 0], [5, 0],
        [5, 1], [0, 0], [0, 0], [0, 0], [3, 0], [0, 0],
        [5, 0], [0, 0], [0, 0], [0, 0], [0, 0], [2, 1]
    ],
    boardState: null,
    playerTurn: true,
    whiteScore: 15,
    blackScore: 15,
    firstDice: 0,
    secondDice: 0,
    isDouble: false,
    doubleCounter: 0,
    whiteOut: 0,
    blackOut: 0,
    
    initialize: function() {
        this.resetBoardState();
        this.populateBoard();
        this.interactBoard();
        this.assignTurn(); // Ensure the turn is assigned initially
    },
    
    resetBoardState: function() {
        this.boardState = Array.from(this.initialBoardState);
        console.log(this.boardState);
        this.clearBoard();
    },
   
    drawBoardState: function() {
        for (var i = 0; i < 24; i++) {
            if (this.boardState[i][0]) {
                var type = (this.boardState[i][1]) ? "white" : "black";
                var cont = document.getElementById("cl-" + (i + 1));
                for (var j = 0; j < this.boardState[i][0]; j++) {
                    cont.innerHTML += '<div class="item ' + type + '"></div>';
                }
            }
        }
    },
    
    clearBoard: function() {
        Array.from(document.getElementsByClassName('item')).forEach(function(item) {
            item.parentNode.removeChild(item);
        });
    },
    
    populateBoard: function() {
        // define lines
        for (var i = 1; i <= 4; i++) {
            var qdr = document.getElementsByClassName("qdr-" + i);
            for (var j = 1; j <= 6; j++) {
                qdr[0].innerHTML += '<div class="cl" id="cl-' + ((i - 1) * 6 + j) + '"></div>';
            }
        }

        // put pieces in place
        this.drawBoardState();

        // create dices
        var diceDots = "";
        for (var i = 1; i <= 9; i++) {
            diceDots += '<div class="dot"></div>'; 
        }
        var dice = "";
        for (var i = 1; i <= 6; i++) {
            dice += '<div class="dice-side dice-side-' + i + '">' + diceDots + '</div>';
        }
        document.getElementById("dice-1").innerHTML = dice;
        document.getElementById("dice-2").innerHTML = dice;
    },
    
    assignTurn: function() {
        document.body.setAttribute('current-player', this.playerTurn ? 'white' : 'black');
        
        document.body.style.backgroundColor = this.playerTurn 
            ? getComputedStyle(document.documentElement).getPropertyValue('--white-color')
            : getComputedStyle(document.documentElement).getPropertyValue('--black-color');
        
        var turn = this.playerTurn ? "item white" : "item black";
        var items = document.getElementsByClassName("item");
        for (var i = 0; i < items.length; i++) {
            // Remove attributes using standard method
            items[i].removeAttribute("draggable");
            items[i].removeAttribute("ondragstart");
            
            if (turn == items[i].getAttribute("class")) {
                if ((this.playerTurn && this.whiteOut) || (!this.playerTurn && this.blackOut)) {
                    if (items[i].parentNode.getAttribute("id") == "board-bar") {
                        items[i].setAttribute("draggable", "true");
                        items[i].setAttribute("ondragstart", "event.dataTransfer.setData('text/plain',null)"); 
                    }
                } else {
                    items[i].setAttribute("draggable", "true");
                    items[i].setAttribute("ondragstart", "event.dataTransfer.setData('text/plain',null)"); 
                }
            }
        }

        // Update the turn title
        document.getElementById("turn-title").innerText = this.playerTurn ? "White's Turn" : "Black's Turn";
    },
    
    throwDices: function() {
        this.isDouble = false;
        this.firstDice = this.rollDice();
        document.getElementById("dice-1").setAttribute("class", "dice dice-" + this.firstDice);

        this.secondDice = this.rollDice();
        document.getElementById("dice-2").setAttribute("class", "dice dice-" + this.secondDice);

        if (this.firstDice == this.secondDice) {
            this.isDouble = true;
            this.doubleCounter = 4; // Set to 4 for doubles
        }

        this.playerTurn = !this.playerTurn;
        this.assignTurn(); 
    },
    
    rollDice: function() {
        return Math.floor(Math.random() * 6) + 1; 
    },
    
    checkBearing: function() {
        var tmpSum = 0;
        var st = this.playerTurn ? 0 : 18;
        for (var i = st; i < st + 6; i++) {
            if (this.boardState[i][1] == this.playerTurn) tmpSum += this.boardState[i][0];
        }
        return tmpSum == (this.playerTurn ? this.whiteScore : this.blackScore) ? true : false;
    },
    
    checkWin: function() {
        var totalPieces = 15; // Assuming each player starts with 15 pieces
        if (this.whiteOut === totalPieces) {
            console.log("White wins!");
            alert("White wins!");
            // Handle end of game logic
        } else if (this.blackOut === totalPieces) {
            console.log("Black wins!");
            alert("Black wins!");
            // Handle end of game logic
        }
    },
    
    interactBoard: function() {
        var dragged;
        var self = this;

        document.addEventListener("drag", function(event) {}, false);
        
        document.addEventListener("dragstart", function(event) {
            if (event.target.parentNode) { // Added check for parentNode
                var currentLine = event.target.parentNode.getAttribute("id").split("-")[1];
            }
            dragged = event.target;
            var currentLine = event.target.parentNode.getAttribute("id").split("-")[1];
            
            if (self.whiteOut && self.playerTurn) currentLine = 25;
            if (self.blackOut && !self.playerTurn) currentLine = 0;

            currentLine = parseInt(currentLine);
            var direction = self.playerTurn ? -1 : 1;
            // target val explanation...... 0 - same position, 1 - first dice, 2 - second dice, 3 - both dices sum / double: 4 - 1/4, 5 - 2/4, 6 - 3/4, 7 - 4/4
            if (self.doubleCounter && self.isDouble) {
                // double
                var tmp = self.doubleCounter;
                var dblCnt = 1;
                while (dblCnt && tmp > 0) { // Ensure tmp is checked
                    var targetIndex = currentLine + dblCnt * self.firstDice * direction - 1;
                    if (targetIndex >= 0 && targetIndex < self.boardState.length) { // Check index bounds
                        if (self.boardState[targetIndex][0] == 0 || 
                            self.boardState[targetIndex][1] == self.playerTurn) {
                            document.getElementById("cl-" + (targetIndex + 1)).setAttribute("moveTarget", "true");
                            document.getElementById("cl-" + (targetIndex + 1)).setAttribute("targetVal", (dblCnt + 3).toString());    
                            tmp--; // Decrement tmp instead of doubleCounter
                            dblCnt++;
                        } else if (self.boardState[targetIndex][0] == 1) {
                            document.getElementById("cl-" + (targetIndex + 1)).setAttribute("moveTarget", "true");
                            document.getElementById("cl-" + (targetIndex + 1)).setAttribute("targetVal", (dblCnt + 3).toString());
                            break;
                        } else break;
                    } else {
                        break; // Exit if index is out of bounds
                    }
                }
            } else {
                // same position
                if (event.target.parentNode.getAttribute("id") != "board-bar") {
                    event.target.parentNode.setAttribute("moveTarget", "true");
                    event.target.parentNode.setAttribute("targetVal", "0");
                }
                
                // first dice
                if (self.firstDice != 0 && (
                    self.boardState[currentLine + self.firstDice * direction - 1][0] <= 1 || (
                    self.boardState[currentLine + self.firstDice * direction - 1][0] > 1 && 
                    self.boardState[currentLine + self.firstDice * direction - 1][1] == self.playerTurn
                    ))) {
                    document.getElementById("cl-" + (currentLine + self.firstDice * direction)).setAttribute("moveTarget", "true");
                    document.getElementById("cl-" + (currentLine + self.firstDice * direction)).setAttribute("targetVal", "1"); 
                }

                // second dice
                if (self.secondDice != 0 && (
                    self.boardState[currentLine + self.secondDice * direction - 1][0] <= 1 || (
                    self.boardState[currentLine + self.secondDice * direction - 1][0] > 1 && 
                    self.boardState[currentLine + self.secondDice * direction - 1][1] == self.playerTurn
                    ))) {
                    document.getElementById("cl-" + (currentLine + self.secondDice * direction)).setAttribute("moveTarget", "true");
                    document.getElementById("cl-" + (currentLine + self.secondDice * direction)).setAttribute("targetVal", "2"); 
                }

                // combination of dices, only if there is direct path (no blot hitting) or no entering
                if (!((self.whiteOut && self.playerTurn) || (self.blackOut && !self.playerTurn))) {
                    if ((self.firstDice != 0 && self.secondDice != 0 && (
                        self.boardState[currentLine + self.firstDice * direction - 1][0] == 0 || 
                        self.boardState[currentLine + self.firstDice * direction - 1][1] == self.playerTurn ||
                        self.boardState[currentLine + self.secondDice * direction - 1][0] == 0 || 
                        self.boardState[currentLine + self.secondDice * direction - 1][1] == self.playerTurn
                    ))) {
                        if (self.boardState[currentLine + (self.firstDice + self.secondDice) * direction - 1][0] <= 1 || (
                            self.boardState[currentLine + (self.firstDice + self.secondDice) * direction - 1][0] > 1 && 
                            self.boardState[currentLine + (self.firstDice + self.secondDice) * direction - 1][1] == self.playerTurn)) {
                            document.getElementById("cl-" + (currentLine + (self.firstDice + self.secondDice) * direction)).setAttribute("moveTarget", "true");
                            document.getElementById("cl-" + (currentLine + (self.firstDice + self.secondDice) * direction)).setAttribute("targetVal", "3");
                        }
                    }
                }
            }
        }, false);

        document.addEventListener("dragend", function(event) {
            event.target.style.opacity = "";
        }, false);

        document.addEventListener("dragover", function(event) { event.preventDefault(); }, false);
        
        document.addEventListener("dragenter", function(event) {
            if (event.target.getAttribute('moveTarget') == "true") {
                event.target.setAttribute("onTarget", "true");
            }
        }, false);

        document.addEventListener("dragleave", function(event) {
            if (event.target.getAttribute('moveTarget') == "true") {
                event.target.setAttribute("onTarget", "false");
            }
        }, false);

        document.addEventListener("drop", function(event) {
            event.preventDefault();
            if (event.target.getAttribute("moveTarget") == "true") {
                var targetIndex = parseInt(event.target.getAttribute("id").split("-")[1]) - 1;

                // Check if the player can bear off
                if (self.playerTurn && self.checkBearing()) {
                    // If the piece is in the home area, allow bearing off
                    if (targetIndex < 6) { // Assuming the first 6 positions are the home area for white
                        self.boardState[targetIndex][0]--; // Remove the piece from the board
                        self.whiteOut++; // Increment the whiteOut counter
                        console.log("White piece borne off from position: " + targetIndex);
                    } else if (targetIndex >= 18) { // Assuming the last 6 positions are the home area for black
                        self.boardState[targetIndex][0]--; // Remove the piece from the board
                        self.blackOut++; // Increment the blackOut counter
                        console.log("Black piece borne off from position: " + targetIndex);
                    }
                } else {
                    // Existing logic for moving pieces
                    switch (event.target.getAttribute("targetVal")) {
                        case "0": { break; }
                        case "1": { self.firstDice = 0; break; }
                        case "2": { self.secondDice = 0; break; }
                        case "3": { self.firstDice = 0; self.secondDice = 0; break; }
                        case "4": { self.doubleCounter--; break; }
                        case "5": { self.doubleCounter -= 2; break; }
                        case "6": { self.doubleCounter -= 3; break; }
                        case "7": { self.doubleCounter -= 4; break; }
                        default: { break; }
                    }

                    // Reset doubleCounter if it goes below 0
                    if (self.doubleCounter < 0) {
                        self.doubleCounter = 0;
                    }

                    // handling entering
                    var enteringFlag = false; // flag for resetting draggable attr if dice left after entering 
                    if (self.whiteOut && self.playerTurn) {
                        self.whiteOut--;
                        if (!self.whiteOut) enteringFlag = true;
                    } else if (self.blackOut && !self.playerTurn) {
                        self.blackOut--;
                        if (!self.blackOut) enteringFlag = true;
                    } else {
                        if (self.boardState[parseInt(dragged.parentNode.getAttribute("id").split("-")[1] - 1)]) {
                            self.boardState[parseInt(dragged.parentNode.getAttribute("id").split("-")[1] - 1)][0]--;
                        }
                    }
                    dragged.parentNode.removeChild(dragged);

                    // handling blot hitting
                    if (self.boardState[targetIndex] && self.boardState[targetIndex][0] == 1 && self.boardState[targetIndex][1] == !self.playerTurn) {
                        var tmp = event.target.childNodes[0];
                        event.target.removeChild(tmp);
                        document.getElementById("board-bar").appendChild(tmp);
                        self.boardState[targetIndex][0] = 0;
                        self.playerTurn ? self.blackOut++ : self.whiteOut++;
                    }

                    // Ensure targetIndex is valid before accessing
                    if (self.boardState[targetIndex]) {
                        self.boardState[targetIndex][0]++;
                        self.boardState[targetIndex][1] = self.playerTurn ? 1 : 0;
                    }
                    event.target.appendChild(dragged);
                    console.log(self);
                }
                
                // reset targets
                var targets = document.querySelectorAll('[moveTarget="true"]');
                for (var i = 0; i < targets.length; i++) {
                    targets[i].removeAttribute("moveTarget");
                    targets[i].removeAttribute("onTarget");
                    targets[i].removeAttribute("targetVal");
                }
                if ((self.firstDice == 0 && self.secondDice == 0) || (self.isDouble && self.doubleCounter === 0)) self.throwDices();
                else if (enteringFlag) {
                    self.assignTurn();
                }

                // Check for win condition
                self.checkWin();
            }
        }, false);

        // Right-click to bear off
        document.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            if (event.target.classList.contains('item')) {
                var currentLine = parseInt(event.target.parentNode.getAttribute("id").split("-")[1]) - 1;
                var menu = document.getElementById('menu');
                menu.style.display = 'block';
                menu.style.top = event.pageY + 'px';
                menu.style.left = event.pageX + 'px';
                menu.setAttribute('data-line', currentLine);
                menu.setAttribute('data-player', self.playerTurn ? 'white' : 'black');
            }
        }, false);

        var bearOffButton = document.getElementById('bear-off');
        if (bearOffButton) {
            bearOffButton.addEventListener('click', function() {
                var menu = document.getElementById('menu');
                var currentLine = parseInt(menu.getAttribute('data-line'));
                var player = menu.getAttribute('data-player');
                if (player === 'white' && self.checkBearing() && currentLine < 6) {
                    self.boardState[currentLine][0]--;
                    self.whiteOut++;
                    document.getElementById('cl-' + (currentLine + 1)).querySelector('.item').remove();
                    console.log("White piece borne off from position: " + currentLine);
                } else if (player === 'black' && self.checkBearing() && currentLine >= 18) {
                    self.boardState[currentLine][0]--;
                    self.blackOut++;
                    document.getElementById('cl-' + (currentLine + 1)).querySelector('.item').remove();
                    console.log("Black piece borne off from position: " + currentLine);
                }
                self.checkWin();
                menu.style.display = 'none';
            });
        }
    }
};

// start game
var game = Object.create(Board);

ready(function() {
    game.initialize();
    alert("Please click 'Roll Dice' to begin the game."); // Changed to alert
    document.getElementById("roll-dice").addEventListener("click", function() {
        game.throwDices(); // Connect roll dice button to throwDices
    });
    document.getElementById("end-turn").addEventListener("click", function() {
        game.throwDices();
    });
    document.getElementById("restart").addEventListener("click", function() {
        location.reload(); // Reloads the page to reset the website
    });
    document.addEventListener('contextmenu', function(e) {
        var menu = document.getElementById('menu');
        menu.style.display = 'block';
        menu.style.top = e.pageY + 'px';
        menu.style.left = e.pageX + 'px';
        e.preventDefault();
    }, false);
    document.addEventListener('click', function(e) {
        document.getElementById('menu').style.display = 'none';
    });
});

function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
