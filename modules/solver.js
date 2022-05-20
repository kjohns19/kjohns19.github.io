import * as rubik from './rubik.js';

export const solve = (cube, allowed_rotations) => {
    const solved_cube = rubik.create();
    if (rubik.is_equal(cube, solved_cube)) {
        return [];
    }

    const copy = rubik.copy(cube);

    // Double rotations get tried first
    const sorted_rotations = [...allowed_rotations];
    sorted_rotations.sort();
    sorted_rotations.reverse();

    const moves = [];
    const solved = solve_impl(cube, solved_cube, sorted_rotations, moves, 6);

    // Restore the initial state
    rubik.copy_into(copy, cube);
    return solved ? moves : null;
};

const solve_impl = (cube, solved_cube, allowed_rotations, moves, max_depth) => {
    if (max_depth === 0) {
        return false;
    }

    const last_rot1 = moves.length > 0 ? rubik.base_rotation(moves[moves.length - 1]) : null;
    const last_rot2 = moves.length > 1 ? rubik.base_rotation(moves[moves.length - 2]) : null;
    const last_axis1 = last_rot1 ? get_axis(last_rot1) : null;
    const last_axis2 = last_rot2 ? get_axis(last_rot2) : null;

    for (const rotation of allowed_rotations) {
        const base_rot = rubik.base_rotation(rotation);
        const axis = get_axis(rotation);

        // Can't do a move on the same side as the last move,
        // or a move on the same axis as the last 2 moves
        // e.g. F followed by F' (would cancel out) or F B followed by F (equivalent to F2 B)
        if (base_rot === last_rot1 || (axis === last_axis1 && axis === last_axis2)) {
            continue;
        }
        rubik.rotate(cube, rotation);
        moves.push(rotation);
        if (rubik.is_equal(cube, solved_cube)) {
            return true;
        }
        if (solve_impl(cube, solved_cube, allowed_rotations, moves, max_depth - 1)) {
            return true;
        }
        moves.pop();
        rubik.rotate(cube, -rotation);
    }
    return false;
};

const get_axis = (rotation) => {
    const base_rot = rubik.base_rotation(rotation);
    switch (base_rot) {
    case rubik.rotation.F:
    case rubik.rotation.B:
        return 0;
    case rubik.rotation.R:
    case rubik.rotation.L:
        return 1;
    case rubik.rotation.U:
    case rubik.rotation.D:
        return 2;
    }
};
