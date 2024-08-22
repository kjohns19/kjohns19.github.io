importScripts(
    './modules/rubik.js',
    './modules/solver.js'
);

addEventListener('message', (message) => {
    const cube = message.data.cube;
    const allowed_rotations = message.data.allowed_rotations;
    const max_moves = message.data.max_moves;
    const check_center_orientation = message.data.check_center_orientation;
    console.time('solve');
    solver.solve(cube, allowed_rotations, max_moves, check_center_orientation, postMessage);
    console.timeEnd('solve');
    postMessage({
        done: {}
    });
});
