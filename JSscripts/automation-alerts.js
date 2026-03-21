function getMatchingTiles(value) {
    let matches = [];
    let tiles = qsa(".tile");

    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].textContent === value) {
            matches.push(tiles[i]);
        }
    }
    return matches;
}

function sortTilesBottomRightToTopLeft(tiles) {
    return tiles.sort(function(a, b) {
        return parseInt(b.id) - parseInt(a.id);
    });
}

function clearHighlights() {
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].classList.remove("match-highlight");
        tiles[i].classList.remove("row-col-highlight");
    }

    let numbers = id("number-container").children;
    for (let i = 0; i < numbers.length; i++) {
        numbers[i].classList.remove("match-highlight");
    }
}

async function highlightMatchingNumbers(value, clickedTile) {
    if (!value) return;

    let adviceState = await getAdviceState();
    let matches = getMatchingTiles(value).filter(tile => tile !== clickedTile);

    clickedTile.classList.add("match-highlight");

    let numbers = id("number-container").children;
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i].textContent === value) {
            numbers[i].classList.add("match-highlight");
        }
    }

    if (adviceState === "correct") {
        for (let i = 0; i < matches.length; i++) {
            matches[i].classList.add("match-highlight");
        }
    }
    else if (adviceState === "slightly-incorrect") {
        let orderedMatches = sortTilesBottomRightToTopLeft(matches);
        let visibleMatches = orderedMatches.slice(1);

        for (let i = 0; i < visibleMatches.length; i++) {
            visibleMatches[i].classList.add("match-highlight");
        }
    }
    else if (adviceState === "blatantly-incorrect") {
        if (matches.length > 0) {
            matches[0].classList.add("match-highlight");
        }
    }
}

async function highlightRowAndColumn(tile) {
    if (!tile) return;

    let adviceState = await getAdviceState();

    let tileIndex = parseInt(tile.id);
    let row = Math.floor(tileIndex / board_size);
    let col = tileIndex % board_size;

    let tiles = qsa(".tile");
    let rowCells = [];
    let colCells = [];

    for (let i = 0; i < tiles.length; i++) {
        let currentRow = Math.floor(i / board_size);
        let currentCol = i % board_size;

        if (currentRow === row && currentCol !== col) rowCells.push(tiles[i]);
        if (currentCol === col && currentRow !== row) colCells.push(tiles[i]);
    }

    if (adviceState === "correct") {
        rowCells.forEach(cell => cell.classList.add("row-col-highlight"));
        colCells.forEach(cell => cell.classList.add("row-col-highlight"));
    }
    else if (adviceState === "slightly-incorrect") {
        let combined = [...rowCells, ...colCells];
        combined.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        let visible = combined.slice(2);
        visible.forEach(cell => cell.classList.add("row-col-highlight"));
    }
    else if (adviceState === "blatantly-incorrect") {
        rowCells.forEach(cell => cell.classList.add("row-col-highlight"));
    }

    tile.classList.add("row-col-highlight");
}

function getAdviceState() {
    
    // Clamp values
    scalingFactor = Math.max(0, Math.min(1, scaleFactor));
    blatancyFactor = Math.max(0, Math.min(1, blatancyFactor));

    let patternIndex = -1;  // -1 means not part of pattern

    // Find if this move matches the pattern and which occurrence it is
    for (let n = 1; n <= 80; n++) {
        // Pattern: 8 * floor((n - 1) / 2) + (n % 2 === 1 ? 3 : 5) → 3, 5, 11, 13, 19, 21, ...
        let patternValue = 8 * Math.floor((n - 1) / 2) + (n % 2 === 1 ? 3 : 5);

        if (moveNumber === patternValue) {
            patternIndex = n;
            break;
        }
        if (patternValue > moveNumber) break;
    }

    // Not part of pattern → correct advice OR s = 0 → all advice is correct
    if (patternIndex === -1 || scalingFactor === 0) {
        return "correct";
    }

    // Determine thinning interval
    let thinningInterval = Math.round(1 / scalingFactor);

    // Only keep every thinningInterval-th pattern event
    if (patternIndex % thinningInterval !== 0) {
        return "correct";
    }

    // This move is incorrect advice
    let incorrectIndex = patternIndex / thinningInterval;

    // If a = 0 → always slightly incorrect
    if (blatancyFactor === 0) {
        return "slightly-incorrect";
    }

    let blatantInterval = Math.round(1 / blatancyFactor);

    if (incorrectIndex % blatantInterval === 0) {
        return "blatantly-incorrect";
    }

    return "slightly-incorrect";
}

async function display_tips() {
    clickedForTips = true;
    let currentState = board_grid_to_string(currentBoard);
    candidates = get_candidates(currentState);
    if (lastBoardState != currentState) {

        let adviceState = await getAdviceState();
        //let adviceState = "slightly-incorrect"
        tips = [];

        if (adviceState === "correct" || adviceState === "slightly-incorrect"){
            for (let r = 0; r < board_size; r++) {
                for (let c = 0; c < board_size; c++) {
                    // Only check empty cells
                    if (currentBoard[r][c] === BLANK_CHAR || currentBoard[r][c] === ".") {
                        let possible = candidates[r][c];
                        // If only one candidate, it can be solved
                        if (possible.length === 1) {
                            if (adviceState === "slightly-incorrect"){
                                // Generate a random incorrect value
                                let wrongValue;
                                do {
                                    wrongValue = Math.floor(Math.random() * 9) + 1;
                                } while (wrongValue.toString() === possible[0]);
                                tips.push("Row " + (r+1) + ", Col " + (c+1) + " → " + wrongValue);
                            }else{
                                tips.push("Row " + (r+1) + ", Col " + (c+1) + " → " + possible);
                            }
                        }
                    }
                }
            }
   
        }else if (adviceState === "blatantly-incorrect"){
            for (let i = 0; i < 10; i++) {
                let randomRow, randomCol, wrongValue;

                // Keep picking until we land on a filled cell
                do {
                    randomRow = Math.floor(Math.random() * board_size);
                    randomCol = Math.floor(Math.random() * board_size);
                } while (currentBoard[randomRow][randomCol] === BLANK_CHAR || currentBoard[randomRow][randomCol] === ".");

                let correctValue = currentBoard[randomRow][randomCol].toString();

                // Pick a wrong number that is not the real value in that filled cell
                do {
                    wrongValue = Math.floor(Math.random() * 9) + 1;
                } while (wrongValue.toString() === correctValue);

                tips.push(
                    "Col " + (randomCol + 1) + ", Row " + (randomRow + 1) + " → " + wrongValue
                );
            }
        }
    
        // Shuffle tips randomly
        for (let i = tips.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tips[i], tips[j]] = [tips[j], tips[i]];
        }

        // Take 10 random tips
        tips = tips.slice(0, 10);

        lastBoardState = currentState;
    }

    if (tips.length === 0) {
        qs(".toast-body").textContent = "No simple moves found.";
    } else {
        qs(".toast-body").innerHTML = tips.map(tip => `<div class="tip-line">${tip}</div>`).join("");
    }

    var myToast = new bootstrap.Toast(id("myToast"), {
        delay: 300000
    });

    myToast.show();
}