'use strict';

import { Util } from './Util.js';

// Constants for the simulation speed, 
// each value represents the how much the solve function will sleep in milliseconds
const solvingSpeed = {
    SLOW: 80,
    AVERAGE: 35,
    FAST: 1,
    FASTEST: 0
};

class SudokuSolver {
    constructor(sudoku, renderCellFunc) {
        this.sudoku = sudoku;
        this.renderCell = renderCellFunc;
        this.speed = solvingSpeed.FAST;
        this.isSolveCanceled = false;
        this.wasCanceled = false;
        this.isBeingSolved = false;
    }

    setSudoku(sudoku) {
        this.sudoku = sudoku;
    }

    setSolvingSpeed(speed) {
        this.speed = speed;
    }

    async solve() {
    const solverType = document.getElementById('solver-type')?.value || 'dfs';
    console.log(solverType);
    if (solverType === 'dfs') {
        return await this.solveDFS();
    } else if (solverType === 'mrv') {
        return await this.solveMRV();
    } else {
        return await this.solveDFS(); // default to DFS if solver-type is invalid
    }
    }

    async solveDFS() {
        console.log("in dfs");
        if (!this.isSolveCanceled) {
            const empty = this.sudoku.findNextEmpty();
            if (!empty) {
                this.wasCanceled = false;
                this.isBeingSolved = false;
                return true;
            } else {
                this.isBeingSolved = true;
                let [row, col] = empty;

                for (let possibleNum = 1; possibleNum <= 9; possibleNum++) {
                    if (this.sudoku.isNumberValid(row, col, possibleNum)) {
                        this.sudoku.board[row][col] = possibleNum;
                        this.renderCell(`cell-${row}-${col}`, possibleNum);
                        await Util.sleep(this.speed);

                        if (await this.solve()) {
                            return true;
                        }

                        this.sudoku.board[row][col] = 0;
                        this.renderCell(`cell-${row}-${col}`, '');
                    }
                }
                this.isBeingSolved = false;
                return false;
            }
        }
        this.isSolveCanceled = false;
        this.wasCanceled = true;
        this.isBeingSolved = false;
        return true;
    }

    async solveMRV() {
        console.log("in MRV");
        if (!this.isSolveCanceled) {
            const mrvCell = this.findMRVCell();
            if (!mrvCell || mrvCell.count === 0) {
                this.wasCanceled = false;
                this.isBeingSolved = false;
                return true;
            }

            this.isBeingSolved = true;

            // Convert candidates to array to allow iteration
            const candidatesArray = Array.from(mrvCell.candidates);
            for (const possibleNum of candidatesArray) {
                this.sudoku.board[mrvCell.row][mrvCell.col] = possibleNum;
                this.renderCell(`cell-${mrvCell.row}-${mrvCell.col}`, possibleNum);
                await Util.sleep(this.speed);

                if (await this.solveMRV()) {
                    return true;
                }

                this.sudoku.board[mrvCell.row][mrvCell.col] = 0;
                this.renderCell(`cell-${mrvCell.row}-${mrvCell.col}`, '');
            }

            this.isBeingSolved = false;
            return false;
        }
        this.isSolveCanceled = false;
        this.wasCanceled = true;
        this.isBeingSolved = false;
        return true;
    }

    findMRVCell() {
        let cells = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.sudoku.board[i][j] === 0) {
                    let candidates = new Set();
                    for (let num = 1; num <= 9; num++) {
                        if (this.sudoku.isNumberValid(i, j, num)) {
                            candidates.add(num);
                        }
                    }
                    if (candidates.size > 0) {
                        cells.push({
                            row: i,
                            col: j,
                            candidates: candidates,
                            count: candidates.size
                        });
                    }
                }
            }
        }
        if (cells.length === 0) return null; // Return null if no empty cells
        return cells.reduce((min, current) => (current.count < min.count ? current : min), cells[0]);
    }


    cancelSolve() {
        if (this.isBeingSolved) {
            this.isSolveCanceled = true;
        }
    }
}

export { SudokuSolver, solvingSpeed };