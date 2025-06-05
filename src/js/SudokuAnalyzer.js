'use strict';

import { Sudoku } from './Sudoku.js';

class SudokuAnalyzer {
    constructor(sudoku) {
        this.sudoku = sudoku;
        this.steps = 0;
        this.branches = 0;
        this.solutionCount = 0;
    }

    cloneBoard(board) {
        return board.map(row => row.slice());
    }

    countSimpleFills(board) {
        let count = 0;
        let temp = new Sudoku();
        temp.board = this.cloneBoard(board);

        let changed;
        do {
            changed = false;
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (temp.board[i][j] === 0) {
                        let candidates = [];
                        for (let n = 1; n <= 9; n++) {
                            if (temp.isNumberValid(i, j, n)) {
                                candidates.push(n);
                            }
                        }
                        if (candidates.length === 1) {
                            temp.board[i][j] = candidates[0];
                            count++;
                            changed = true;
                        }
                    }
                }
            }
        } while (changed);

        return count;
    }

    solveWithMetrics(board, countSolutions = false, maxSolutions = 2) {
        const next = this.findNextEmpty(board);
        if (!next) {
            this.solutionCount++;
            return true;
        }

        const [row, col] = next;
        let found = false;

        for (let num = 1; num <= 9; num++) {
            if (this.isValid(board, row, col, num)) {
                board[row][col] = num;
                this.steps++;

                const nextEmpty = this.findNextEmpty(board);
                if (nextEmpty) {
                    let validCount = 0;
                    for (let n = 1; n <= 9; n++) {
                        if (this.isValid(board, nextEmpty[0], nextEmpty[1], n)) {
                            validCount++;
                        }
                    }
                    if (validCount > 1) {
                        this.branches++;
                    }
                }

                if (this.solveWithMetrics(board, countSolutions, maxSolutions)) {
                    found = true;
                    if (countSolutions && this.solutionCount >= maxSolutions) return true;
                }

                board[row][col] = 0;
            }
        }

        return found;
    }

    isValid(board, row, col, number) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === number || board[i][col] === number) return false;
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] === number) return false;
            }
        }
        return true;
    }

    findNextEmpty(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) return [i, j];
            }
        }
        return null;
    }

    getDifficultyLevel(steps, branches) {
    if (steps < 5000) return '简单';
    if (steps <= 15000) return '中等';
    return '困难';
}

    analyze() {
        const initialBoard = this.cloneBoard(this.sudoku.board);
        const simpleFills = this.countSimpleFills(initialBoard);
        this.solveWithMetrics(this.cloneBoard(this.sudoku.board), true);
        const hasUniqueSolution = this.solutionCount === 1;

        return {
            steps: this.steps,
            branches: this.branches,
            uniqueSolution: hasUniqueSolution,
            simpleFills: simpleFills,
            difficulty: this.getDifficultyLevel(this.steps, this.branches)
        };
    }
}

export { SudokuAnalyzer };
