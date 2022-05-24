import * as rubik from './rubik.js';

// Find solutions to a cube
// Returns an array of the solutions (each solution is an array of rotations)
// The array will contain a single empty array if the cube is already solved
// The array will be empty if there are no solutions
export const solve = (cube, allowed_rotations, max_moves) => {
    // The solved cube has the same centers as the scrambled one
    // so no full rotations are needed
    const solved_cube = rubik.create(rubik.get_centers(cube));

    // Check if it's already solved
    if (rubik.is_equal_with_ignored(cube, solved_cube)) {
        return [[]];
    }

    // Solve a copy so the original is unchanged
    const cube_copy = rubik.copy(cube);

    // Construct a graph of moves based on the allowed rotations
    const move_set = construct_move_set(allowed_rotations);

    const solutions = [];
    solve_impl(cube_copy, solved_cube, move_set, [], solutions, max_moves, 0);

    // Return solutions of minimum length
    const min_length = Math.min(...solutions.map((solution) => solution.length));
    return solutions.filter((solution) => solution.length === min_length);
};

// Returns the max depth that should be checked for future calls
const solve_impl = (cube, solved_cube, move_set, moves, solutions, max_depth, depth) => {
    // Base case - no moves left
    if (depth >= max_depth) {
        // Continue with current max depth since we didn't find anything here
        return max_depth;
    }
    if (depth <= 1) {
        console.log('   '.repeat(depth) + depth);
    }

    for (const rotation in move_set) {
        // Make the move
        rubik.rotate(cube, rotation);
        moves.push(rotation);

        // Add the solution if it's solved, otherwise try more moves
        const solved = rubik.is_equal_with_ignored(cube, solved_cube);
        if (solved) {
            solutions.push([...moves]);
        } else {
            max_depth = solve_impl(cube, solved_cube, move_set[rotation], moves, solutions, max_depth, depth + 1);
        }

        // Undo the move to try the next one
        moves.pop();
        rubik.rotate(cube, -rotation);

        if (solved) {
            // No point in trying more moves from here
            // Don't look any further than the current depth
            // (+1 since we stop when our depth equals it)
            return depth + 1;
        }
    }
    // Continue with current max depth since we didn't find anything here
    return max_depth;
};

const construct_move_set = (allowed_rotations) => {
    const move_set = {};

    const get_or_default = (obj, elem, def) => {
        const value = obj[elem];
        if (value !== undefined) {
            return value;
        }
        obj[elem] = def;
        return def;
    };
    const get_move_data = (move1, move2) => {
        const d1 = get_or_default(move_set, move1, {});
        const d2 = get_or_default(d1, move2, {});
        return d2;
    };

    const construct_impl = (moves, max_depth) => {
        if (max_depth === 0) {
            return;
        }
        for (const rotation of allowed_rotations) {
            if (!move_allowed(rotation, moves))
                continue;
            const move1 = moves.length > 1 ? moves[moves.length - 2] : null;
            const move2 = moves.length > 0 ? moves[moves.length - 1] : null;
            const move_data = get_move_data(move1, move2);
            move_data[rotation] = get_move_data(move2, rotation);
            moves.push(rotation);
            construct_impl(moves, max_depth - 1);
            moves.pop();
        }
    };

    construct_impl([], 3);
    return get_move_data(null, null);
};

const move_allowed = (rotation, moves) => {
    const axis = get_axis(rotation);
    const base = rubik.base_rotation(rotation);

    let index = moves.length - 1;
    for (let index = moves.length - 1; index >= 0; index--) {
        const move = moves[index];
        const move_axis = get_axis(move);
        const move_base = rubik.base_rotation(move);
        if (move_axis !== axis) {
            // The previous move was on a different axis, so this move is valid
            return true;
        } else if (move_base === base) {
            // The previous move was on the same face, so this move is invalid
            return false;
        } else {
            // The previous move was on the opposite face, so look at the move before it
            // Since this move can be reordered
            // (e.g. L R is equivalent to R L)
            continue;
        }
    }
    // No more previous moves - must be valid
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
