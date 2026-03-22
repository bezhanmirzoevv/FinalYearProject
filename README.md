Web Sudoku Puzzle Game
======================


> Welcome to my final year project! - An interactive web Sudoku puzzle game developed in HTML, CSS, and JavaScript with automated alerts and advice.

### Live Demo
🔗 https://bezhanmirzoevv.github.io/FinalYearProject/

---

### Motivation
Since I first studied parallel programming, I developed a [personal side project](https://github.com/huaminghuangtw/Parallel-Sudoku-Solver) that aims to solve *large* Sudoku puzzles as efficiently as possible by means of various parallelization techniques and solving algorithms. The main focus/goal of this project, however, is not only to make an *interactive* Sudoku puzzle game that the user can play around with, but also to hone my web development/design skills. Based on [RedFlyer Coding's tutorial video on YouTube](https://www.youtube.com/watch?v=ea3UBpMHDoc&ab_channel=RedFlyerCoding), I've added several widgets and features/functionalities in the webpage which I hope you will enjoy and have fun!😊

---

### Description
Sudoku is one of the most popular puzzle games of all time.
The objective of Sudoku is to fill a 9-by-9 grid with digits from 1 to 9 such that each column, row, and box (or called "subgrid", "region", "block") contain every number in the set {1, ... , 9} exactly once.

This web application features **generating** and **solving** standard 9-by-9 Sudoku puzzles of different difficulty levels (i.e., easy, medium, and hard). For the Sudoku generating algorithm, please refer to [2]. The backtracking technique [3] is implemented as the solving algorithm here.

<p align="center">
    <img src="https://user-images.githubusercontent.com/43208378/148444472-bb6d43ae-c3cd-4b8e-b530-0f7cb2db1067.png" width=350>
</p>

---

### Test cases
A collection of test grids of various difficulty levels are present in the [`Test_Cases`](./Test_Cases) directory. These text files are used for the **initial** Sudoku boards of respective difficulty levels. When the user clicks the "Refresh puzzle" button, **random** Sudoku boards are subsequently generated via the approach proposed by Rob McGuir [2].

---

### References

[1] [Template](https://github.com/huaminghuangtw/Web-Sudoku-Puzzle-Game)

[2] [A Sudoku puzzle generator and solver JavaScript library - sudoku.js](https://github.com/robatron/sudoku.js)

[3] [Wikipedia - Sudoku solving algorithms: Backtracking](https://en.wikipedia.org/wiki/Sudoku_solving_algorithms#Backtracking)

---

### Contact


---

### License

This project is licensed under the terms of [![MIT](https://img.shields.io/github/license/huaminghuangtw/Web-Sudoku-Puzzle-Game.svg?style=flat-square&label=License&colorB=black)](./LICENSE).
