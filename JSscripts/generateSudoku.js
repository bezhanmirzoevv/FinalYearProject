/* ----------------------------------------------- *
 * Based on: https://github.com/robatron/sudoku.js *
 * ----------------------------------------------- */

// Define difficulties by how many filled squares (cells) are given to the player in a new puzzle
var DIFFICULTY = {
    "easy": 62,
    "medium": 53,
    "hard": 44,
    "very-hard": 35,
    "insane": 26,
    "inhuman": 17,
};

function generatePuzzleID(board, difficulty) {
    let str = board;
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }

    return difficulty.toLowerCase() + "_" + Math.abs(hash);
}

function isValidGeneratedBoard(board, difficulty) {
    if (typeof board !== "string") return false;
    if (board.length !== 81) return false;
    if (!/^[1-9.]+$/.test(board)) return false;

    const givenCount = board.replace(/\./g, "").length;
    const expectedGivens = DIFFICULTY[difficulty];

    return givenCount === expectedGivens;
}

function hasGoodDistribution(board) {
    // At least 2 givens in every row
    for (let row = 0; row < 9; row++) {
        let count = 0;
        for (let col = 0; col < 9; col++) {
            if (board[row * 9 + col] !== ".") count++;
        }
        if (count < 2) return false;
    }

    // At least 2 givens in every column
    for (let col = 0; col < 9; col++) {
        let count = 0;
        for (let row = 0; row < 9; row++) {
            if (board[row * 9 + col] !== ".") count++;
        }
        if (count < 2) return false;
    }

    // At least 1 given in every 3x3 box
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            let count = 0;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    let index = (boxRow * 3 + r) * 9 + (boxCol * 3 + c);
                    if (board[index] !== ".") count++;
                }
            }
            if (count < 1) return false;
        }
    }

    return true;
}

function isSafeStringBoard(boardArray, row, col, num) {
    let value = num.toString();

    // Check row
    for (let c = 0; c < 9; c++) {
        if (boardArray[row * 9 + c] === value) {
            return false;
        }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
        if (boardArray[r * 9 + col] === value) {
            return false;
        }
    }

    // Check 3x3 box
    let boxRowStart = Math.floor(row / 3) * 3;
    let boxColStart = Math.floor(col / 3) * 3;

    for (let r = boxRowStart; r < boxRowStart + 3; r++) {
        for (let c = boxColStart; c < boxColStart + 3; c++) {
            if (boardArray[r * 9 + c] === value) {
                return false;
            }
        }
    }

    return true;
}

function countSolutions(board, limit = 2) {
    let boardArray = board.split("");
    let solutionCount = 0;

    function solve() {
        if (solutionCount >= limit) {
            return;
        }

        let emptyIndex = boardArray.indexOf(".");

        if (emptyIndex === -1) {
            solutionCount++;
            return;
        }

        let row = Math.floor(emptyIndex / 9);
        let col = emptyIndex % 9;

        for (let num = 1; num <= 9; num++) {
            if (isSafeStringBoard(boardArray, row, col, num)) {
                boardArray[emptyIndex] = num.toString();
                solve();
                boardArray[emptyIndex] = ".";
            }
        }
    }

    solve();
    return solutionCount;
}

function generateSudoku(difficulty) {
    let difficultyLabel = difficulty;
    /*
     * Generate a new Sudoku puzzle of a particular 'difficulty',
     * e.g., generateSudoku("easy");
     *
     * Difficulties are as follows, and represent the number of given squares:
     * "easy": 62, "medium": 53, "hard": 44, "very-hard": 35, "insane": 26, "inhuman": 17
     *
     * You may also enter a custom number of squares to be given,
     * e.g., generateSudoku(60)
     *
     * 'difficulty' must be a number between 17 and 81 inclusive.
     * If it's outside of that range, 'difficulty' will be set to the closest bound,
     * e.g., 0 -> 17, and 100 -> 81.
     */

    if (typeof difficulty === "string" || typeof difficulty === "undefined") {
        difficulty = DIFFICULTY[difficulty] || DIFFICULTY.easy;
    }

    difficulty = _force_range(difficulty, NUM_SQUARES + 1, MIN_GIVENS);

    var blank_board = "";
    for (var i = 0; i < NUM_SQUARES; ++i) {
        blank_board += ".";
    }
    var candidates = _get_candidates_map(blank_board);

    var shuffled_squares = _shuffle(SQUARES);
    for (var s in shuffled_squares) {
        var square = shuffled_squares[s];

        var rand_candidate_idx = _rand_range(candidates[square].length);
        var rand_candidate = candidates[square][rand_candidate_idx];
        if (!_assign(candidates, square, rand_candidate)) { break; }

        var single_candidates = [];
        for (var s in SQUARES) {
            var square = SQUARES[s];
            if (candidates[square].length == 1) {
                single_candidates.push(candidates[square]);
            }
        }

        if (single_candidates.length >= difficulty && _strip_dups(single_candidates).length >= 8) {
            var board = "";
            var givens_idxs = [];
            for (var i in SQUARES) {
                var square = SQUARES[i];
                if (candidates[square].length == 1) {
                    board += candidates[square];
                    givens_idxs.push(i);
                } else {
                    board += BLANK_CHAR;
                }
            }

            var nr_givens = givens_idxs.length;
            if (nr_givens > difficulty) {
                givens_idxs = _shuffle(givens_idxs);
                for (var i = 0; i < nr_givens - difficulty; ++i) {
                    var target = parseInt(givens_idxs[i]);
                    board = board.substring(0, target) + BLANK_CHAR + board.substring(target + 1);
                }
            }

            let solutionCount = 0;

            try {
                solutionCount = countSolutions(board, 2);
            } catch (error) {
                console.log("Solution counting failed:", error);
                solutionCount = 0;
            }

            if (
                solutionCount === 1 &&
                isValidGeneratedBoard(board, difficultyLabel) &&
                hasGoodDistribution(board)
            ) {
                const puzzleID = generatePuzzleID(board, difficultyLabel);
                localStorage.setItem("currentPuzzleID", puzzleID);

                return board;
            }
        }
    }
    return generateSudoku(difficultyLabel);
}