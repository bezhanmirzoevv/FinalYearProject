// Global variables
var inputBoard;
var currentBoard;
var lastBoardState;
var candidates;
var solution;
var board_size = 9;
var box_size = 3;
var selectedNum;
var selectedTile;
var disableSelect;
var timerType;
var tips = [];
var score;
var scaleFactor = 1000;
var lastMoveTime = null;
var pauseStartTime;
var wrongInputsSinceLastMove;
var selectedCellCandidateCount;
var puzzleOrder = 0;
var moveNumber;
var lastHighlightedNumberValue;
let clickedForTips = false;


// Run script once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Clear local storage to ensure a fresh start for each session
    resetExperimentSession();

    // Initialize Sudoku library
    initializeSudokuLib();
    // Execute startGame function when start button is clicked
    id("start-btn").addEventListener("click", startGame);
    // Add event listener to theme toggle button
    id("theme-btn").addEventListener("change", function() {
        if (this.checked) {
            // dark mode
            qs(".box").setAttribute('style', 'background-color:#CCCCCC;')
            qs(".ball").setAttribute('style', 'transform:translatex(100%);')
            document.body.classList.remove("light");
            document.body.classList.add("dark");
            qs(":root").style.setProperty('--digitColor', '#82FA58');
            qs(":root").style.setProperty('--digitBackgroundColor', '#505050');
            id("spinner-element-1").style.color = "#ff9419";
            id("spinner-element-2").style.color = "#ff9419";
            qs(".header").classList.remove("light");
            qs(".header").classList.add("dark");
        } else {
            // light mode
            qs(".box").setAttribute('style', 'background-color:black; color:white;')
            qs(".ball").setAttribute('style', 'transform:translatex(0%);')
            document.body.classList.remove("dark");
            document.body.classList.add("light");
            qs(":root").style.setProperty('--digitColor', 'black');
            qs(":root").style.setProperty('--digitBackgroundColor', '#EEEEEE');
            qs(".header").classList.remove("dark");
            qs(".header").classList.add("light");
        }
    });
    // Add event listener to each of number in number container
    for (let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].addEventListener("click", function() {
            if (!disableSelect) {
                if (this.classList.contains("selected")) {
                    this.classList.remove("selected");
                    selectedNum = null;
                } else {
                    for (let i = 0; i < id("number-container").children.length; i++) {
                        id("number-container").children[i].classList.remove("selected");
                    }
                    clearHighlights();
                    this.classList.add("selected");
                    selectedNum = this;
                    updateMove();
                }
            }
        })
    }
    // Add event listener to "Tips" button
    id("tips-btn").addEventListener("click", async function () {
        await display_tips();
    });
    // Add event listener to "Refresh puzzle" button
    id("refresh-btn").addEventListener("click", refresh_puzzle);
    // Add event listener to "Pause" button
    id("pause-btn").addEventListener("click", pause);
    // Add event listener to "Resume" button
    id("resume-btn").addEventListener("click", resume);
});

function resetGame() {
    // Hide game components before loading a new puzzle
    id("game-container").style.visibility = "hidden";
    // Close alert if it exists
    if (id("alert-pause")) { $("#alert-pause").slideUp("200"); }
    // Initialize variables
    disableSelect = false;
    timerType = "stopwatch";
    lastBoardState = null;
    score = 0;
    wrongInputsSinceLastMove = 0;
    lastMoveTime = Date.now();
    selectedCellCandidateCount = 0;
    displayScore(score);
    moveNumber = 0;
    lastHighlightedNumberValue = null;

    // Set how long the timer should be
    /*if (id("time-3mins").checked) {
        TIME_LIMIT = 60 * 3;
        timerType = "countdown";
    } else if (id("time-5mins").checked) {
        TIME_LIMIT = 60 * 5;
        timerType = "countdown";
    } else if (id("time-10mins").checked) {
        TIME_LIMIT = 60 * 10;
        timerType = "countdown";
    } else if (id("time-stopwatch").checked) {
        timerType = "stopwatch";
    }*/
    // Set up elements
    if (timerType == "countdown") {
        id("time-1").classList.remove("hidden");
        id("time-2").classList.add("hidden");
        if (useProgressBar) {
            id("digital-timer-container").classList.remove("hidden");
            id("digital-timer-container").innerHTML =
                `<div id="digital-timer">
					<span class="digit"></span>
					<span class="digit"></span>
					<span class="colon"></span>
					<span class="digit"></span>
					<span class="digit"></span>
				</div>`;
            id("progress-bar-container").classList.remove("hidden");
            id("progress-bar-container").innerHTML =
                `<div id="progress-bar" class="green"></div>`;
            qs(":root").style.setProperty("--scalingFactorForTimer", "0.8");
            // Start countdown timer and progress bar
            startProgressBar();
            startTimer(TIME_LIMIT);
        } else {
            id("animated-timer-container").classList.remove("hidden");
            id("animated-timer-container").classList.add("placement");
            id("animated-timer-container").innerHTML =
                `<div class="base-timer">
				<svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<g class="base-timer__circle">
						<circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
						<path
							id="base-timer-path-remaining"
							stroke-dasharray="283"
							class="base-timer__path-remaining ${remainingPathColor}"
							d="
								M 50, 50
								m -45, 0
								a 45,45 0 1,0 90,0
								a 45,45 0 1,0 -90,0
							"
						></path>
					</g>
				</svg>
				<div id="base-timer-label" class="base-timer__label">
					<span class="digit"></span>
					<span class="digit"></span>
					<span class="colon"></span>
					<span class="digit"></span>
					<span class="digit"></span>
				</div>
			</div>`;
            qs(":root").style.setProperty("--scalingFactorForTimer", "0.6");
            // Start countdown timer
            startTimer(TIME_LIMIT);
        }
    } else if (timerType == "stopwatch") {
        id("time-1").classList.add("hidden");
        id("time-2").classList.remove("hidden");
        id("stopwatch-container").classList.remove("hidden");
        id("stopwatch-container").innerHTML =
            `<div id="stopwatch">
				<span class="digit2"></span>
				<span class="digit2"></span>
				<span class="colon2"></span>
				<span class="digit2"></span>
				<span class="digit2"></span>
				<span class="colon2"></span>
				<span class="digit2"></span>
				<span class="digit2"></span>
			</div>`;
        qs(":root").style.setProperty("--scalingFactorForTimer", "0.8");
        // Start stopwatch
        startTimeCounter();
    }
    // Show number containers
    id("number-container").classList.remove("hidden");
    // Set button accessibility
    id("tips-btn").disabled = false;
    id("refresh-btn").disabled = false;
    id("pause-btn").disabled = false;
    id("resume-btn").disabled = true;
}

function initializeGame(inputBoard) {
    generateBoard(inputBoard);
    currentBoard = board_string_to_grid(inputBoard);
    // Compute solution for the given input Sudoku board
    solution = board_grid_to_string(solveSudoku(board_string_to_grid(inputBoard)));
    // Show game components when everything is ready
    id("game-container").style.visibility = "visible";
}

async function startGame() {
    if (!localStorage.getItem("participantId")) {
        document.getElementById("login-status").textContent = "Please sign in to start the game.";
        document.getElementById("login-status").style.color = "red";
        return;
    }

    resetGame();

    if (id("difficulty-easy").checked) {
        inputBoard = generateSudoku("easy");
    } else if (id("difficulty-medium").checked) {
        inputBoard = generateSudoku("medium");
    } else if (id("difficulty-hard").checked) {
        inputBoard = generateSudoku("hard");
    } else if (id("difficulty-veryhard").checked) {
        inputBoard = generateSudoku("very-hard");
    }

    try {
        await createAndStorePuzzleAttempt(localStorage.getItem("currentPuzzleID"));
        initializeGame(inputBoard);
    } catch (err) {
        console.error("Failed to create puzzle attempt:", err);
    }
}

async function endGame() {
    disableSelect = true;

    await completePuzzleAttempt({ 
        puzzleAttemptId: parseInt(localStorage.getItem("puzzleAttemptId"), 10),
        score: Math.round(score),
        totalTimeSeconds: (Math.floor(elapsedTime)) / 1000 // Convert to seconds
    });

    if (timerType == "countdown") {
        cancelAnimationFrame(countdown_timer);
        var t = formatTime(timeLeft).split(":");
        var m = t[0];
        var s = t[1];

        if (parseInt(m, 10) == 0 && parseInt(s, 10) == 0) {
            var x = id("snackbar-lose");
            var audio = new Audio('./audio/audio-lose.wav');
            title_txt = "GAME OVER.😮";
        } else {
            var x = id("snackbar-win");
            var audio = new Audio('./audio/audio-win.wav');
            title_txt = "Congrats!🎉";
        }

    } else if (timerType == "stopwatch") {
        cancelAnimationFrame(stopwatch);
        var x = id("snackbar-win");
        var audio = new Audio('./audio/audio-win.wav');
        title_txt = "Congrats!🎉";
    }

    audio.play();
    x.classList.add("show");

    setTimeout(function() {
        x.classList.remove("show");
    }, 2999);

    swal({
        title: title_txt,
        text: "Try again? Press 'New game!'🚀",
        icon: "info",
    });

    id("tips-btn").disabled = true;
    id("pause-btn").disabled = true;
    id("resume-btn").disabled = true;
}

function readInput(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText.split("\n");
                inputBoard = '';
                for (let i = 1; i < allText.length; i++) {
                    inputBoard += allText[i];
                }
                inputBoard = inputBoard.replaceAll('0', '.');
                inputBoard = inputBoard.replaceAll(' ', '');
                inputBoard = inputBoard.replace(/\r/g, '');
                inputBoard = inputBoard.trim();
                inputBoard = inputBoard.substring(0, 81);
            }
        }
    }
    rawFile.send(null);
    return inputBoard;
}

function generateBoard(board) {
    clearPrevious();

    for (let i = 0; i < board.length; i++) {
        let tile = document.createElement("p");
        tile.id = i;
        tile.classList.add("tile");

        if (board[i] != BLANK_CHAR) {
            tile.textContent = board[i];
        }

        tile.addEventListener("click", async function() {
            clearHighlights();
            if (disableSelect) return;

            // If this tile already has a number, highlight all matching numbers
            if (tile.textContent !== "") {
                if (selectedTile) {selectedTile.classList.remove("selected");
                    selectedTile = null;
                }
                lastHighlightedNumberValue = tile.textContent;
                await highlightMatchingNumbers(tile.textContent, tile);
                return;
            }

            // Otherwise keep the normal blank-tile behaviour
            if (tile.classList.contains("selected")) {
                tile.classList.remove("selected");
                selectedTile = null;
            } else {
                if (selectedTile) {selectedTile.classList.remove("selected");}
                tile.classList.add("selected");
                selectedTile = tile;
                await highlightRowAndColumn(tile);
                updateMove();
            }
        });

        id("board").appendChild(tile);

        let row = Math.floor(i / board_size) + 1;
        let col = i % board_size + 1;

        if (col % box_size == 0 && col != board_size) {
            tile.classList.add("rightBorder");
        }
        if (row % box_size == 0 && row != board_size) {
            tile.classList.add("bottomBorder");
        }
    }
}

async function updateMove() {
    if (!selectedTile || !selectedNum) return;

    const moveContext = getMoveContext();

    selectedCellCandidateCount = get_candidates_without_logic(currentBoard, moveContext.row, moveContext.col).length;
    selectedTile.textContent = selectedNum.textContent;

    if (isCorrect(selectedTile)) {
        await handleCorrectMove(moveContext);
    } else {
        await handleIncorrectMove(moveContext);
    }

    hideToastIfOpen();
}

async function handleCorrectMove(moveContext) {
    clearHighlights();

    const timeTakenSeconds = getTimeTakenSeconds();
    const cellIndex = getDisplayCellIndex(moveContext.index);
    const totalTimeSeconds = (Math.floor(elapsedTime)) / 1000; // Convert to seconds

    workOutScore();
    moveNumber++;

    selectedTile.classList.add("correct");

    currentBoard[moveContext.row][moveContext.col] = selectedNum.textContent;

    await logCorrectMoveToDatabase(cellIndex, timeTakenSeconds);
    await updatePuzzleAttemptProgress({ 
        puzzleAttemptId: parseInt(localStorage.getItem("puzzleAttemptId"), 10),
        score: Math.round(score),
        totalTimeSeconds: totalTimeSeconds
    });

    lastMoveTime = Date.now();
    wrongInputsSinceLastMove = 0;
    clickedForTips = false;

    clearSelectedNumber();
    clearSelectedTileAfterDelay("correct");

    if (isDone()) {
        endGame();
    }
}



async function logCorrectMoveToDatabase(cellIndex, timeTakenSeconds) {
    try {
        const puzzleAttemptId = localStorage.getItem("puzzleAttemptId");
        if (!puzzleAttemptId) return;

        const moveLog = await logMove({
            puzzleAttemptId: parseInt(puzzleAttemptId, 10),
            moveNumber: moveNumber,
            cellIndex: cellIndex,
            adviceState: getAdviceState(),
            tips: clickedForTips && tips && tips.length > 0 ? tips : null,
            incorrectInputsCount: wrongInputsSinceLastMove,
            timeTakenSeconds: timeTakenSeconds,
            finalInput: selectedTile.textContent
        });

        localStorage.setItem("lastMoveLogId", moveLog.id);
        console.log("Move logged:", moveLog);
    } catch (err) {
        console.error("Failed to log move:", err);
    }
}

async function handleIncorrectMove(moveContext) {
    clearHighlights();
    disableSelect = true;

    selectedTile.classList.add("incorrect");

    const incorrectInput = parseInt(selectedNum.textContent, 10);
    const selectedTileRef = selectedTile;

    await logIncorrectMoveToDatabase(moveContext, incorrectInput);
    clearSelectedNumber();

    setTimeout(function () {
        disableSelect = false;
        selectedTileRef.classList.remove("incorrect");
        selectedTileRef.classList.remove("selected");
        selectedTileRef.textContent = "";

        if (selectedTile === selectedTileRef) {
            selectedTile = null;
        }

        wrongInputsSinceLastMove++;
    }, 1000);
}

async function logIncorrectMoveToDatabase(moveContext, incorrectInput) {
    try {
        const puzzleAttemptId = localStorage.getItem("puzzleAttemptId");
        if (!puzzleAttemptId) return;

        const row = moveContext.row + 1;
        const col = moveContext.col + 1;
        const correctValue = parseInt(solution[moveContext.index], 10);

        await logIncorrectInput({
            puzzleAttemptId: parseInt(puzzleAttemptId, 10),
            moveNumber: moveNumber + 1,
            attemptNumber: wrongInputsSinceLastMove + 1,
            cellIndex: getDisplayCellIndex(moveContext.index),
            inputValue: incorrectInput,
            correctValue: correctValue,
            matchedTip: clickedForTips && doesIncorrectInputMatchATip(row, col, incorrectInput),
            matchedMatchingNumbers: didMatchingNumberHighlightInfluenceInput(incorrectInput),
            matchedRowColGrid: getRowColGridMatches(moveContext, incorrectInput)
        });
    } catch (err) {
        console.error("Failed to log incorrect input:", err);
    }
}

function parseTip(tip) {
    if (!tip) return null;

    const match = tip.match(/(?:Row\s+(\d+),\s*Col\s+(\d+)|Col\s+(\d+),\s*Row\s+(\d+))\s*→\s*(\d+)/i);
    if (!match) return null;

    const row = parseInt(match[1] || match[4], 10);
    const col = parseInt(match[2] || match[3], 10);
    const value = parseInt(match[5], 10);

    if (Number.isNaN(row) || Number.isNaN(col) || Number.isNaN(value)) {
        return null;
    }

    return { row, col, value };
}

function doesIncorrectInputMatchATip(row, col, inputValue) {
    if (!Array.isArray(tips) || tips.length === 0) return false;

    return tips.some(function(tip) {
        const parsedTip = parseTip(tip);
        return parsedTip &&
               parsedTip.row === row &&
               parsedTip.col === col &&
               parsedTip.value === inputValue;
    });
}

function didMatchingNumberHighlightInfluenceInput(inputValue) {
    if (!lastHighlightedNumberValue) return false;
    return String(lastHighlightedNumberValue) === String(inputValue);
}

function getRowColGridMatches(moveContext, inputValue) {
    const row = moveContext.row;
    const col = moveContext.col;
    const input = String(inputValue);

    const matches = [];

    // Check row
    for (let c = 0; c < board_size; c++) {
        if (c !== col && String(currentBoard[row][c]) === input) {
            matches.push("row");
            break;
        }
    }

    // Check column
    for (let r = 0; r < board_size; r++) {
        if (r !== row && String(currentBoard[r][col]) === input) {
            matches.push("column");
            break;
        }
    }

    // Check grid
    const boxSize = Math.sqrt(board_size);
    const startRow = Math.floor(row / boxSize) * boxSize;
    const startCol = Math.floor(col / boxSize) * boxSize;

    for (let r = startRow; r < startRow + boxSize; r++) {
        for (let c = startCol; c < startCol + boxSize; c++) {
            if (r === row && c === col) continue;

            if (String(currentBoard[r][c]) === input) {
                matches.push("grid");
                r = startRow + boxSize; // exit both loops
                break;
            }
        }
    }

    return matches;
}

function clearSelectedNumber() {
    selectedNum.classList.remove("selected");
    selectedNum = null;
}

function clearSelectedTileAfterDelay(cssClassName) {
    setTimeout(function () {
        selectedTile.classList.remove(cssClassName);
        selectedTile.classList.remove("selected");
        selectedTile = null;
    }, 1000);
}

function hideToastIfOpen() {
    let toast = bootstrap.Toast.getInstance(id("myToast"));
    if (toast) toast.hide();
}

function isCorrect(tile) {
    if (solution[tile.id] == tile.textContent) { return true; } else { return false; }
}

function isDone() {
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].textContent === "") return false;
    }
    return true;
}

function clearPrevious() {
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].remove();
    }
    for (let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].classList.remove("selected");
    }
    selectedTile = null;
    selectedNum = null;
}

function displayScore(score) {
    id("lives").textContent = "Score: " + Math.round(score);
}

function workOutScore() {
    let now = Date.now();
    // Time taken in seconds, with a minimum of 0.1 seconds to prevent division by zero or very high scores for very fast moves
    let timeTakenSeconds = Math.max(((now - lastMoveTime) / 1000), 0.1);
    let wrongDivisor = wrongInputsSinceLastMove + 1;
    let difficultyMultiplier =
        id("difficulty-easy").checked ? 1 :
        id("difficulty-medium").checked ? 2 :
        id("difficulty-hard").checked ? 3 : 4;

    // The score for a move is calculated based on the time taken, the number of wrong inputs since the last correct move, the difficulty level, and the number of candidates for the cell. The scale factor is used to adjust the overall scoring.
    let moveScore = scaleFactor * difficultyMultiplier * (selectedCellCandidateCount / timeTakenSeconds) / wrongDivisor;

    score += moveScore;
    displayScore(score);

    lastMoveTime = now;
}

function show_solution() {
    // Display solution to the current Sudoku puzzle, highlighting the answers with green color
    for (let i = 0; i < id("board").children.length; i++) {
        var tile = id("board").children[i];
        if (tile.textContent != solution[tile.id]) {
            tile.textContent = solution[tile.id];
            // Update the curernt status of Sudoku board
            currentBoard[Math.floor(tile.id / board_size)][tile.id % board_size] = solution[tile.id];
            tile.classList.add("green-text");
        }
    }
    // Display solution to the console
    console.log(board_string_to_display_string(solution));
    // Pause countdown timer or stopwatch
    pause();
    // Set button accessibility
    id("tips-btn").disabled = true;
    id("resume-btn").disabled = true;
    // Display message to the user
    swal({
        title: "Try again?😉",
        text: "Press 'New game!' button.🚀",
        icon: "info",
    });
}

function solve_one_step() {
    for (let i = 0; i < id("board").children.length; i++) {
        var tile = id("board").children[i];
        if (tile.textContent != solution[tile.id]) {
            tile.textContent = solution[tile.id];
            // Update the curernt status of Sudoku board
            currentBoard[Math.floor(tile.id / board_size)][tile.id % board_size] = solution[tile.id];
            tile.classList.add("green-text");
            break;
        }
    }
}

async function refresh_puzzle() {
    resetGame();
    //id("spinner-container").classList.remove("hidden");
    if (id("difficulty-easy").checked) {
        inputBoard = generateSudoku("easy");
    } else if (id("difficulty-medium").checked) {
        inputBoard = generateSudoku("medium");
    } else if (id("difficulty-hard").checked) {
        inputBoard = generateSudoku("hard");
    } else if (id("difficulty-veryhard").checked) {
        inputBoard = generateSudoku("very-hard");
    }

    //id("spinner-container").classList.add("hidden");

    try {
        await createAndStorePuzzleAttempt(localStorage.getItem("currentPuzzleID"));
        initializeGame(inputBoard);
    } catch (err) {
        console.error("Failed to create puzzle attempt:", err);
    }
}

function pause() {
    disableSelect = true;
    pauseStartTime = Date.now();
    if (timerType == "countdown") {
        pauseTimer();
    } else if (timerType == "stopwatch") {
        pauseTimeCounter();
    }
    // Set button accessibility
    id("tips-btn").disabled = true;
}

function resume() {
    disableSelect = false;
    let pausedDuration = Date.now() - pauseStartTime;
    lastMoveTime += pausedDuration;

    if (timerType == "countdown") {
        resumeTimer();
    } else if (timerType == "stopwatch") {
        resumeTimeCounter();
    }
    // Set button accessibility
    id("tips-btn").disabled = false;
}

async function createAndStorePuzzleAttempt(puzzleId) {
    const experimentSessionId = localStorage.getItem("experimentSessionId");

    if (!experimentSessionId) {
        throw new Error("No experiment session found.");
    }

    puzzleOrder++;
    moveNumber = 0;
    wrongInputsSinceLastMove = 0;
    lastMoveTime = Date.now();

    localStorage.removeItem("lastMoveLogId");
    localStorage.removeItem("puzzleAttemptId");

    const puzzleAttempt = await createPuzzleAttempt(
        parseInt(experimentSessionId, 10),
        puzzleId,
        puzzleOrder
    );

    localStorage.setItem("puzzleAttemptId", puzzleAttempt.id);
    console.log("Puzzle attempt created:", puzzleAttempt);

    return puzzleAttempt;
}

function resetExperimentSession() {
    localStorage.removeItem("participantId");
    localStorage.removeItem("participantUsername");
    localStorage.removeItem("participantLoggedIn");
    localStorage.removeItem("experimentSessionId");
    localStorage.removeItem("puzzleAttemptId");
    localStorage.removeItem("lastMoveLogId");
}

function getMoveContext() {
    const index = Number(selectedTile.id);
    const row = Math.floor(index / board_size);
    const col = index % board_size;
    const currentCandidates = get_candidates(board_grid_to_string(currentBoard));

    return {index, row, col, currentCandidates};
}

function getDisplayCellIndex(index) {
    const row = Math.floor(index / board_size) + 1;
    const col = (index % board_size) + 1;
    return row * 10 + col;
}

function getTimeTakenSeconds() {
    return Math.max((Date.now() - lastMoveTime) / 1000, 0.1);
}

// Helper functions
function id(id) {
    return document.getElementById(id);
}

function qs(selectors) {
    return document.querySelector(selectors);
}

function qsa(selectors) {
    return document.querySelectorAll(selectors);
}

function setIntervalImmediately(func, interval) {
    func();
    return setInterval(func, interval);
}


// In JavaScript, strings are immutable.
// You cannot do an in-place replacement, but creating a new string and returns it.
function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}