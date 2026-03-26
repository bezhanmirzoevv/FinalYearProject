Bezhan Mirzoev Final Year Project
======================

## Overview

This project is a web-based Sudoku game developed as part of my final year project.
It is designed to support experiments on automation bias through demonstrating the effect different types of computer advice (correct, slightly incorrect, blatantly incorrect) can have on user performance and reliance.

The system records user interactions such as moves, incorrect inputs, and hint usage, and stores them for later analysis.

---

## Features

* User login (session-based)
* Secure staff login for modification of experiment settings
* Sudoku puzzle generation and gameplay
* Real-time input validation
* Computer-generated advice with varying correctness levels:
  * Correct advice
  * Slightly incorrect advice
  * Blatantly incorrect advice
* Tracking of:
  * Moves made
  * Time taken per move
  * Incorrect inputs
  * Hint interactions
* Score tracking
* Stopwatch-based timing
* Dark mode toggle

---

## Folder Structure

The following structure outlines all files included in the project. While timer-based components were retained from the original template, the system uses only a stopwatch, as it provides a more accurate measure of user performance.

```
/project-root
│
├── audio
│   ├── audio-correct-move.mp3          # Sound effect played when correct move is made
│   ├── audio-incorrect-move.mp3        # Sound effect played when incorrect move is made
│   ├── audio-lose.wav          # Sound effect played when the player loses or fails the puzzle (only applicable if timer mode is used)
│   ├── audio-win.wav           # Sound effect played when the player completes the puzzle successfully
│
├── CSSstyles
│   ├── animated-countdown-timer.css    # Styles for the animated countdown timer (retained from template but not used)
│   ├── digital-timer.css               # Styles for the digital stopwatch display
│   ├── mybootstrap.css                 # Custom Bootstrap-related styling overrides and layout helpers
│   ├── progress-bar.css                # Styles for the gameplay progress bar (not used)
│   ├── snackbar-and-alert.css          # Styles for alerts, notifications, and feedback messages
│   ├── styles.css                      # Main stylesheet for layout, Sudoku grid, and UI components
│   ├── theme-toggle-button.css         # Styles for the dark/light theme toggle
│
├── JSscripts
│   ├── app.js                  # Main game controller; manages game state, board setup, and gameplay flow
│   ├── automation-alerts.js    # Handles experimental advice logic, including highlights and tips
│   ├── candidatesSudoku.js     # Generates candidate values for Sudoku cells
│   ├── countdown-timer.js      # Countdown timer functionality (retained from template but not used)
│   ├── database.js             # Handles Supabase database operations (sessions, moves, inputs, etc.)
│   ├── generateSudoku.js       # Generates and validates Sudoku puzzles
│   ├── helperSudoku.js         # Helper functions and initialisation for Sudoku logic
│   ├── login.js                # Manages participant/staff login, password hashing, and experiment settings
│   ├── progress-bar.js         # Progress bar logic for timed gameplay (not used)
│   ├── solveSudoku.js          # Sudoku solving and validation logic
│   ├── stopwatch.js            # Tracks elapsed gameplay time using a stopwatch
│   ├── supabase.js             # Configures and initialises the Supabase client
│   ├── utilitySudoku.js        # Utility functions for Sudoku board formatting and manipulation
│
├── index.html                  # Main HTML file defining the application structure
├── database.sql                # SQL schema for creating Supabase database tables
├── sudoku-icon.png             # Application icon used for browser tab display
├── LICENSE                     # License information for reused components
└── README.md                   # Project documentation and setup instructions
```

---

## Requirements

This project runs entirely in the browser.

You only need:

* A modern web browser (Chrome recommended)
* Optional: a local server (recommended for best behaviour)

---

## How to Run the Project

**Hosted Version:** https://bezhanmirzoevv.github.io/FinalYearProject/

---
### 1. Download and Extract the Project

Download the project files and extract the ZIP folder, ensuring the folder structure remains unchanged.

---

### 2. Set Up the Database

This project uses [Supabase](https://supabase.com) as its backend database.

1. Create a new Supabase project (free tier is sufficient)
2. Open the **SQL Editor** in Supabase
3. Copy the contents of [`database.sql`](./database.sql)
4. Run the script to create the required tables and schema

---

### 3. Configure Supabase Connection

1. Open [`supabase.js`](./JSscripts/supabase.js)
2. Add your Supabase credentials:

```javascript
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";
```

These values can be found in your Supabase project settings under **API**.

---

### 4. Run the Application

Open [`index.html`](./index.html) in a browser, or preferably run the project using a local development server.

#### Recommended steps using VS code

1. Open the project folder in VS Code
2. Install the **Live Server** extension
3. Right-click [`index.html`](./index.html)
4. Select **Open with Live Server**

---

## Dependencies

This project uses minimal external dependencies and runs primarily in the browser.

### Core Technologies

* Vanilla JavaScript
* HTML & CSS
* Browser Local Storage
* Web Crypto API (for password hashing)

### External Services

* [Supabase](https://supabase.com) – used for database storage, including participants, sessions, puzzle attempts, and move tracking

### Optional Tools

* Visual Studio Code with Live Server (for local development)

---

## Code Reuse

This project was implemented using the following open-source template:

https://github.com/huaminghuangtw/Web-Sudoku-Puzzle-Game.git

The template was adapted and extended to support:

* Integration of computer-generated advice and highlighting behaviour
* Customisation of puzzle generation logic
* Stopwatch-based timing for performance measurement
* User login and experiment configuration
* Data logging and storage using Supabase

***Note:*** The original template itself incorporates logic from other open-source Sudoku implementations (https://github.com/robatron/sudoku.js), which are acknowledged within the template’s source code.

---

## Author
Bezhan Mirzoev
Final Year Dissertation Project
BSc Computer Science
