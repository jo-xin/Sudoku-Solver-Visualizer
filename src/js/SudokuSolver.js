'use strict';

import { Util } from './Util.js';

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
        this.currentSolverType = 'dfs'; // 添加当前求解器类型
    }

    setSudoku(sudoku) {
        this.sudoku = sudoku;
    }

    setSolvingSpeed(speed) {
        this.speed = speed;
    }

    async solve() {
        this.currentSolverType = document.getElementById('solver-type')?.value || 'dfs';
        if (this.currentSolverType === 'dfs') {
            return await this.solveDFS();
        } else if (this.currentSolverType === 'mrv') {
            return await this.solveMRV();
        } else {
            return await this.solveDFS();
        }
    }

    async solveDFS() {
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

                        // 修复：直接调用solveDFS而不是solve()
                        if (await this.solveDFS()) {
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
        if (this.isSolveCanceled) {
            this.wasCanceled = true;
            this.isBeingSolved = false;
            return true;
        }

        const mrvCell = this.findMRVCell();
        if (!mrvCell) {
            // 所有格子都填了，成功结束
            this.wasCanceled = false;
            this.isBeingSolved = false;
            return true;
        }

        // 如果没有可选值，说明当前路径无解，应回溯（返回 false）
        if (mrvCell.count === 0) {
            return false;
        }

        this.isBeingSolved = true;
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

        return false;
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
                    // 包含所有空单元格，即使候选数为0
                    cells.push({
                        row: i,
                        col: j,
                        candidates: candidates,
                        count: candidates.size
                    });
                }
            }
        }
        if (cells.length === 0) return null;
        return cells.reduce((min, current) => (current.count < min.count ? current : min), cells[0]);
    }

    cancelSolve() {
        if (this.isBeingSolved) {
            this.isSolveCanceled = true;
        }
    }
}

export { SudokuSolver, solvingSpeed };