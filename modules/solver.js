import * as rubik from './rubik.js';

export const solve = (cube, allowed_rotations, max_moves) => {
    const solved_cube = rubik.create();
    if (rubik.is_equal_with_ignored(cube, solved_cube)) {
        return [];
    }

    const copy = rubik.copy(cube);

    // Double rotations get tried first
    const sorted_rotations = [...allowed_rotations];
    sorted_rotations.sort();
    sorted_rotations.reverse();

    const allowed_rotations_set = {};
    for (const rotation of sorted_rotations) {
        allowed_rotations_set[rotation] = 1;
    }

    const moves = [];
    const solved = solve_impl(cube, solved_cube, sorted_rotations, allowed_rotations_set, moves,
                              max_moves);

    // Restore the initial state
    rubik.copy_into(copy, cube);
    return solved ? moves : null;
};

const solve_impl = (cube, solved_cube, allowed_rotations, allowed_rotations_set, moves,
                    max_depth) => {
    // Base case - no moves left
    if (max_depth === 0) {
        return false;
    }

    for (const rotation of allowed_rotations) {
        // Skip move if it isn't valid
        if (!move_allowed(rotation, moves, allowed_rotations_set)) {
            continue;
        }

        // Make the move
        rubik.rotate(cube, rotation);
        moves.push(rotation);

        // The cube is solved if it's currently in a solved state
        // Or if we can continue making moves to get it to a solved state
        const solved = (
            rubik.is_equal_with_ignored(cube, solved_cube) ||
            solve_impl(cube, solved_cube, allowed_rotations, allowed_rotations_set, moves,
                       max_depth - 1));
        if (solved) {
            // The moves array contains the solution
            return true;
        }

        // Not solved - undo the move
        moves.pop();
        rubik.rotate(cube, -rotation);
    }

    // No solution
    return false;
};

const move_allowed = (rotation, moves, allowed_rotations) => {
    const axis = get_axis(rotation);

    let index = moves.length - 1;
    const get_move = () => {
        while (index >= 0) {
            const move = moves[index];
            index--;
            const move_axis = get_axis(move);
            // Skip move if it's on the opposite side of the rotation
            // (e.g. B when the rotation is F)
            // Since that doesn't affect this rotation and can be reordered
            if (move_axis === axis && !(move === rotation || move === -rotation ||
                                        move === (2 * Math.abs(rotation)) ||
                                        (2 * Math.abs(move)) === rotation)) {
                continue;
            }
            return move;
        }
        // No more moves
        return null;
    };

    // Check last move
    const move1 = get_move();
    if (!move1 || get_axis(move1) !== axis) {
        return true;
    }

    // F F' or F' F is never allowed
    if (move1 === -rotation) {
        return false;
    }
    // F2 F2 is never allowed
    if (move1 === rotation && (move1 % 2) === 0) {
        return false;
    }

    // F F or F' F' isn't allowed if F2 is a valid move
    if (move1 === rotation && allowed_rotations[2 * Math.abs(move1)]) {
        return false;
    }

    // F2 F isn't allowed if F' is a valid move
    // F2 F' isn't allowed if F is a valid move
    if (move1 === (2 * Math.abs(rotation)) && allowed_rotations[-rotation]) {
        return false;
    }
    // F F2 isn't allowed if F' is a valid move
    // F' F2 isn't allowed if F is a valid move
    if ((2 * Math.abs(move1)) === rotation && allowed_rotations[-move1]) {
        return false;
    }

    // At this point any move different from the last move is allowed
    if (move1 !== rotation) {
        return true;
    }

    // Check 2nd to last move
    const move2 = get_move();
    if (!move2 || get_axis(move2) !== axis) {
        return true;
    }

    // F F F isn't allowed if F' is a valid move
    // F' F' F' isn't allowed if F is a valid move
    if (move2 === move1 && allowed_rotations[-rotation]) {
        return false;
    }

    // At this point any move different from the 2nd to last move is allowed
    if (move2 !== rotation) {
        return true;
    }

    // Check 3rd to last move
    const move3 = get_move();
    if (!move3 || get_axis(move3) !== axis) {
        return true;
    }

    // F F F F or F' F' F' F' is never allowed
    if (move3 === move2) {
        return false;
    }

    // Valid move
    return true;
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
