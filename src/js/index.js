'use strict';

import { SudokuRenderer } from './SudokuRenderer.js';
import { solvingSpeed } from './SudokuSolver.js';
import { SudokuGenerator } from './SudokuGenerator.js';
import { SudokuAnalyzer } from './SudokuAnalyzer.js';


// Import custom stylesheets
import '../css/index.css';
import '../css/layout.css';

const sudokuTblElement = document.getElementById('sudoku');
const sldSolvingSpeed = document.getElementById('sld-solving-speed');
const btnClear = document.getElementById('btn-clear');
const btnSolve = document.getElementById('btn-solve');
const btnGenerate = document.getElementById('btn-generate');
const sudokuStatus = document.getElementById('sudoku-status');

const sudokuRenderer = new SudokuRenderer(sudokuTblElement);
sudokuRenderer.renderSudoku();
sudokuRenderer.setEditable(true);

sldSolvingSpeed.addEventListener('change', evt => {
    const sliderValue = parseInt(evt.target.value);

    switch (sliderValue) {
        case 0:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.SLOW);
            break;
        case 1:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.AVERAGE);
            break;
        case 2:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.FAST);
            break;
        case 3:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.FASTEST);
            break;
    }
});

btnClear.addEventListener('click', evt => {
    sudokuRenderer.clear();
    sudokuRenderer.setEditable(true);
    sudokuStatus.textContent = '';
    btnSolve.disabled = false;
});

// btnSolve.addEventListener('click', async evt => {
//     sudokuRenderer.setEditable(false);
//     sudokuStatus.textContent = '';
//     sudokuStatus.classList.value = '';
//     evt.target.disabled = true;
//     if (await sudokuRenderer.renderSolve()) {
//         if (!sudokuRenderer.solver.wasCanceled) {
//             sudokuStatus.classList.add('status-success');
//             sudokuStatus.textContent = 'Solved!';
//         }
//     }
//     else {
//         sudokuStatus.classList.add('status-failed');
//         sudokuStatus.textContent = 'Unsolvable!';
//     }
//     evt.target.disabled = false;
// });

btnSolve.addEventListener('click', async evt => {
    sudokuRenderer.setEditable(false);
    sudokuStatus.textContent = '';
    sudokuStatus.classList.value = '';
    evt.target.disabled = true;
    try {
        if (await sudokuRenderer.renderSolve()) {
            if (sudokuRenderer.solver.wasCanceled) {
                sudokuStatus.classList.add('status-info');
                sudokuStatus.textContent = 'Solved was canceled!';
            }
            else {
                sudokuStatus.classList.add('status-success');
                sudokuStatus.textContent = 'Solved!';
            }
        } else {
            sudokuStatus.classList.add('status-failed');
            sudokuStatus.textContent = 'Unsolvable!';
        }
    } finally {
        evt.target.disabled = false;
    }
});


btnGenerate.addEventListener('click', evt => {
    const sudokuGenerator = new SudokuGenerator();
    const generatedSudoku = sudokuGenerator.generateSudoku();
    sudokuRenderer.setSudoku(generatedSudoku);
    sudokuRenderer.renderSudoku();
    sudokuStatus.textContent = '';

    // 分析难度
    const analyzer = new SudokuAnalyzer(generatedSudoku);
    const result = analyzer.analyze();

    const reportDiv = document.getElementById('difficulty-report');
    reportDiv.innerHTML = `
    <strong>难度评估：<span style="color:${getColor(result.difficulty)}">${result.difficulty}</span></strong><br>
    DFS解题步数：${result.steps}<br>
    分支点数量：${result.branches}<br>
    唯一解：${result.uniqueSolution ? '✅ 是' : '❌ 否'}<br>
    简单可填数：${result.simpleFills}
`;
});

function getColor(difficulty) {
    switch (difficulty) {
        case '简单': return 'green';
        case '中等': return 'orange';
        case '困难': return 'red';
        default: return 'black';
    }
}