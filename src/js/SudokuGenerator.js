'use strict';

import { Sudoku } from './Sudoku.js';
import _ from 'lodash';
import { SudokuAnalyzer } from './SudokuAnalyzer.js';

class SudokuGenerator {
    constructor() {
        this.sudoku = new Sudoku();
    }

    solve() {
        const empty = this.sudoku.findNextEmpty();
        if (!empty) return true;
        const [row, col] = empty;
        const nums = _.shuffle([1,2,3,4,5,6,7,8,9]);
        for (const n of nums) {
            if (this.sudoku.isNumberValid(row, col, n)) {
                this.sudoku.board[row][col] = n;
                if (this.solve()) return true;
                this.sudoku.board[row][col] = 0;
            }
        }
        return false;
    }

    /**
     * 生成唯一解的数独谜题
     * @param {Number} targetHoles 想要挖掉的格子总数（例如 55）
     */
    generateSudoku(targetHoles = 55) {
        // 1. 先生成一个完整解
        this.sudoku.clear();
        this.solve();

        // 2. 按随机顺序列出所有格子
        const positions = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }
        const shuffled = _.shuffle(positions);

        // 3. 逐个尝试挖空
        let holes = 0;
        const puzzle = new Sudoku();
        puzzle.board = this.sudoku.board.map(r => r.slice());

        for (const [r, c] of shuffled) {
            if (holes >= targetHoles) break;

            // 如果此格已经是挖空或填0，则跳过
            if (puzzle.board[r][c] === 0) continue;

            const backup = puzzle.board[r][c];
            puzzle.board[r][c] = 0;

            // 检测唯一性：分析器只搜到 1 解才通过
            const analyzer = new SudokuAnalyzer(puzzle);
            const result = analyzer.analyze();  // 内部会用 countSolutions 模式

            if (result.uniqueSolution) {
                holes++;
            } else {
                // 恢复此格，保留数字
                puzzle.board[r][c] = backup;
            }
        }

        return puzzle;
    }
}

export { SudokuGenerator };
