importScripts(
    './modules/rubik.js',
    './modules/solver.js'
);

addEventListener('message', (message) => {
    const cube = message.data.cube;
    const allowed_rotations = message.data.allowed_rotations;
    const max_moves = message.data.max_moves;
    console.time('solve');
    const callback = (count, total) => {
        postMessage({percent: count / total * 100});
    };
    const solutions = solver.solve(cube, allowed_rotations, max_moves, callback);
    console.timeEnd('solve');
    postMessage({solutions: solutions});
});
