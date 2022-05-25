import * as solver from './modules/solver.js';

addEventListener('message', (message) => {
    const cube = message.data.cube;
    const allowed_rotations = message.data.allowed_rotations;
    const max_moves = message.data.max_moves;
    console.time('solve');
    const solutions = solver.solve(cube, allowed_rotations, max_moves);
    console.timeEnd('solve');
    postMessage({solutions: solutions});
});
