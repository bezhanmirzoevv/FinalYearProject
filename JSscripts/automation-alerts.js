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

function highlightMatchingNumbers(value, clickedTile) {
    if (!value) return;

    let adviceState = getAdviceState();
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

function highlightRowAndColumn(tile) {
    if (!tile) return;

    let adviceState = getAdviceState();

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
    let isPatternMove = false;

    for (let n = 1; n <= 80; n++) {
        let patternValue = 4 * n + Math.pow(-1, n);
        if (moveNumber === patternValue) {
            isPatternMove = true;
            break;
        }
    }

    if (!isPatternMove) {
        return "correct";
    }

    return moveNumber % 2 === 0 ? "slightly-incorrect" : "blatantly-incorrect";
}

function display_tips() {
    let currentState = board_grid_to_string(currentBoard);
    candidates = get_candidates(currentState);
    if (lastBoardState != currentState) {
        tips = [];
        for (let r = 0; r < board_size; r++) {
            for (let c = 0; c < board_size; c++) {
                // Only check empty cells
                if (currentBoard[r][c] === BLANK_CHAR || currentBoard[r][c] === ".") {
                    console.log(`Checking cell at Row ${r+1}, Col ${c+1} with candidates:`, candidates[r][c]);
                    let possible = candidates[r][c];
                    // If only one candidate, it can be solved
                    if (possible.length === 1) {
                        tips.push(
                            "Row " + (r+1) + ", Col " + (c+1) + " → " + possible
                        );
                    }
                }
            }
        }

    
        // Shuffle tips randomly
        for (let i = tips.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tips[i], tips[j]] = [tips[j], tips[i]];
        }

        // Take 10 random tips
        console.log("Generated tips:", tips);
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