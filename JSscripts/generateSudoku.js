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
     * e.g., 0 - > 17, and 100 - > 81.
     */

    // If 'difficulty' is a string or undefined, convert it to a number or
    // default it to "easy" if undefined.
    if (typeof difficulty === "string" || typeof difficulty === "undefined") {
        difficulty = DIFFICULTY[difficulty] || DIFFICULTY.easy;
    }

    // Force difficulty between 17 and 81 inclusive
    difficulty = _force_range(difficulty, NUM_SQUARES + 1, MIN_GIVENS);

    // Get a set of squares and all possible candidates for each square
    var blank_board = "";
    for (var i = 0; i < NUM_SQUARES; ++i) {
        blank_board += '.';
    }
    var candidates = _get_candidates_map(blank_board);

    // For each item in a shuffled list of squares
    var shuffled_squares = _shuffle(SQUARES);
    for (var s in shuffled_squares) {
        var square = shuffled_squares[s];

        // If an assignment of a random choice causes a contradiction,
        // give up and try again!
        var rand_candidate_idx = _rand_range(candidates[square].length);
        var rand_candidate = candidates[square][rand_candidate_idx];
        if (!_assign(candidates, square, rand_candidate)) { break; }

        // Make a list of all squares with one single candidate
        var single_candidates = [];
        for (var s in SQUARES) {
            var square = SQUARES[s];
            if (candidates[square].length == 1) {
                single_candidates.push(candidates[square]);
            }
        }

        // If the number of squares with one single candidate is >= 'difficulty', and
        // the unique candidate count is at least 8, return the puzzle!
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

            // If the number of squares with one single candidate is > 'difficulty',
            // remove some random givens until we're down to exactly 'difficulty'
            var nr_givens = givens_idxs.length;
            if (nr_givens > difficulty) {
                givens_idxs = _shuffle(givens_idxs);
                for (var i = 0; i < nr_givens - difficulty; ++i) {
                    var target = parseInt(givens_idxs[i]);
                    board = board.substring(0, target) + BLANK_CHAR + board.substring(target + 1);
                }
            }

            // Double check board is solvable and well-formed
            // Double check board is solvable and well-formed
            let solvable = false;

            try {solvable = solveSudoku(board);
            } catch (error) {
                console.log("Solver failed on generated board:", error);
                solvable = false;
            }

            if (solvable && isValidGeneratedBoard(board, difficultyLabel) && hasGoodDistribution(board)) {
                console.log("Generated board:", board);
                console.log("Board length:", board.length);
                console.log("Difficulty:", difficultyLabel);

                const puzzleID = generatePuzzleID(board, difficultyLabel);
                localStorage.setItem("currentPuzzleID", puzzleID);
                console.log("Puzzle ID:", puzzleID);

                return board;
            }
        }
    }

    // Give up and try a new puzzle
    return generateSudoku(difficultyLabel);
}