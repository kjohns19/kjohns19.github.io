import * as rubik from './rubik.js';

export const solve = (cube, allowed_rotations, max_moves) => {
    const solved_cube = rubik.create(rubik.get_centers(cube));
    if (rubik.is_equal_with_ignored(cube, solved_cube)) {
        return [];
    }

    const copy = rubik.copy(cube);

    // Double rotations get tried first
    const sorted_rotations = [...allowed_rotations];
    sorted_rotations.sort();
    sorted_rotations.reverse();

    const move_set = construct_move_set(sorted_rotations);
    const solutions = [];
    solve_impl(cube, solved_cube, move_set, [], solutions, max_moves);

    // Restore the initial state
    rubik.copy_into(copy, cube);
    if (!solutions) {
        return null;
    }
    const min_length = Math.min(...solutions.map((solution) => solution.length));
    return solutions.filter((solution) => solution.length === min_length);
};

const solve_impl = (cube, solved_cube, move_set, moves, solutions, max_depth) => {
    // Base case - no moves left
    if (max_depth === 0) {
        return;
    }

    for (const rotation of move_set.moves) {
        // Make the move
        rubik.rotate(cube, rotation);
        moves.push(rotation);

        // Add the solution if it's solved, otherwise try more moves
        const solved = rubik.is_equal_with_ignored(cube, solved_cube);
        if (solved) {
            solutions.push([...moves]);
        } else {
            solve_impl(cube, solved_cube, move_set.next[rotation], moves, solutions, max_depth - 1);
        }

        // Undo the move to try the next one
        moves.pop();
        rubik.rotate(cube, -rotation);

        if (solved) {
            // No point in trying more moves from here
            break;
        }
    }
};

const construct_move_set = (allowed_rotations) => {
    const allowed_rotations_set = {};
    for (const rotation of allowed_rotations) {
        allowed_rotations_set[rotation] = 1;
    }

    const move_set = {};

    const get_or_default = (obj, elem, def) => {
        const value = obj[elem];
        if (value !== undefined) {
            return value;
        }
        obj[elem] = def;
        return def;
    };
    const get_move_data = (move1, move2, move3) => {
        const d1 = get_or_default(move_set, move1, {});
        const d2 = get_or_default(d1, move2, {});
        const d3 = get_or_default(d2, move3, {moves: [], next: {}});
        return d3;
    };

    const construct_impl = (moves, max_depth) => {
        if (max_depth === 0) {
            return;
        }
        for (const rotation of allowed_rotations) {
            if (!move_allowed(rotation, moves, allowed_rotations_set))
                continue;
            const move1 = moves.length > 2 ? moves[moves.length - 3] : null;
            const move2 = moves.length > 1 ? moves[moves.length - 2] : null;
            const move3 = moves.length > 0 ? moves[moves.length - 1] : null;
            const data = get_move_data(move1, move2, move3);
            data.moves.push(rotation);
            data.next[rotation] = get_move_data(move2, move3, rotation);

            moves.push(rotation);
            construct_impl(moves, max_depth - 1);
            moves.pop();
        }
    };

    construct_impl([], 4);
    return get_move_data(null, null, null);
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
