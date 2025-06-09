'use strict';

import { Sudoku } from './Sudoku.js';
import { SudokuSolver } from './SudokuSolver.js';

class SudokuRenderer {
    constructor(sudokuHTMLElement) {
        this.sudokuHTMLElement = sudokuHTMLElement;
        this.sudoku = new Sudoku();
        this.solver = new SudokuSolver(this.sudoku, this.renderCell);
        this.originalBoard = this.cloneBoard(this.sudoku.board);
    }

    cloneBoard(board) {
        return board.map(row => [...row]);
    }

    renderSudoku() {
        while (this.sudokuHTMLElement.firstChild) {
            this.sudokuHTMLElement.removeChild(this.sudokuHTMLElement.firstChild);
        }

        for (let i = 0; i < this.sudoku.board.length; i++) {
            let sudokuRow = document.createElement('tr');
            for (let j = 0; j < this.sudoku.board.length; j++) {
                let sudokuCell = document.createElement('td');
                let num = this.sudoku.board[i][j];

                sudokuCell.id = `cell-${i}-${j}`;

                sudokuCell.addEventListener('keydown', evt => {
                    let [row, col] = evt.target.id.match(/\d/g).map(Number);
                    let input = parseInt(evt.key);

                    if (evt.target.textContent.length > 0 || isNaN(input)) {
                        if (evt.key === 'Backspace') {
                            evt.target.classList.remove('given-num');
                            evt.target.classList.add('discovered-num');
                            this.sudoku.board[row][col] = 0;
                        } else {
                            evt.preventDefault();
                        }
                    } else {
                        if (this.sudoku.isNumberValid(row, col, input)) {
                            evt.target.classList.remove('discovered-num');
                            evt.target.classList.add('given-num');
                            this.sudoku.board[row][col] = input;
                        } else {
                            evt.preventDefault();
                        }
                    }
                });

                sudokuCell.addEventListener('focusin', evt => {
                    let [row, col] = evt.target.id.match(/\d/g).map(Number);
                    let rowStart = row - row % 3;
                    let colStart = col - col % 3;
                    for (let k = 0; k < 9; k++) {
                        document.getElementById(`cell-${row}-${k}`).classList.add('focused-cell');
                        document.getElementById(`cell-${k}-${col}`).classList.add('focused-cell');
                    }
                    for (let x = rowStart; x < rowStart + 3; x++) {
                        for (let y = colStart; y < colStart + 3; y++) {
                            document.getElementById(`cell-${x}-${y}`).classList.add('focused-cell');
                        }
                    }
                });

                sudokuCell.addEventListener('focusout', evt => {
                    let [row, col] = evt.target.id.match(/\d/g).map(Number);
                    let rowStart = row - row % 3;
                    let colStart = col - col % 3;
                    for (let k = 0; k < 9; k++) {
                        document.getElementById(`cell-${row}-${k}`).classList.remove('focused-cell');
                        document.getElementById(`cell-${k}-${col}`).classList.remove('focused-cell');
                    }
                    for (let x = rowStart; x < rowStart + 3; x++) {
                        for (let y = colStart; y < colStart + 3; y++) {
                            document.getElementById(`cell-${x}-${y}`).classList.remove('focused-cell');
                        }
                    }
                });

                if (num !== 0) {
                    sudokuCell.textContent = num;
                    sudokuCell.classList.add('given-num');
                } else {
                    sudokuCell.classList.add('discovered-num');
                }

                if (i === 2 || i === 5) sudokuCell.classList.add('box-boundary-row');
                if (j === 2 || j === 5) sudokuCell.classList.add('box-boundary-col');

                sudokuRow.appendChild(sudokuCell);
            }
            this.sudokuHTMLElement.appendChild(sudokuRow);
        }
    }

    renderCell(cellId, value) {
        const cell = document.getElementById(cellId);
        if (cell) cell.textContent = value;
    }

    async renderSolve() {
        // 保存题目副本，供 clear 使用
        this.originalBoard = this.cloneBoard(this.sudoku.board);
        return await this.solver.solve();
    }

    clear() {
        this.solver.cancelSolve();

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.getElementById(`cell-${i}-${j}`);
                if (this.originalBoard[i][j] === 0) {
                    this.sudoku.board[i][j] = 0;
                    if (cell) {
                        cell.textContent = '';
                        cell.classList.remove('given-num');
                        cell.classList.add('discovered-num');
                    }
                } else {
                    this.sudoku.board[i][j] = this.originalBoard[i][j];
                    if (cell) {
                        cell.textContent = this.originalBoard[i][j];
                        cell.classList.remove('discovered-num');
                        cell.classList.add('given-num');
                    }
                }
            }
        }
    }

    setSudoku(sudoku) {
        this.sudoku = sudoku;
        this.originalBoard = this.cloneBoard(sudoku.board);
        this.solver.setSudoku(sudoku);
    }

    setEditable(editable) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let cell = document.getElementById(`cell-${i}-${j}`);
                if (cell) cell.contentEditable = editable;
            }
        }
    }
}

export { SudokuRenderer };
