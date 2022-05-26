import * as rubik from './rubik.js';

// Find solutions to a cube
// Returns an array of the solutions (each solution is an array of rotations)
// The array will contain a single empty array if the cube is already solved
// The array will be empty if there are no solutions
export const solve = (cube, allowed_rotations, max_moves, progress_callback) => {
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
    const move_counts = count_moves(move_set, max_moves);
    console.log('Moves:')
    console.log(move_counts);

    const progress = {
        total: move_counts[null][0],
        count: 0,
        last_percent: -1,
        callback: progress_callback
    };
    console.log(progress);
    const solutions = [];
    solve_impl(cube_copy, solved_cube, move_set, move_counts, [], solutions, progress, max_moves, 1);

    // Return solutions of minimum length
    const min_length = Math.min(...solutions.map((solution) => solution.length));
    return solutions.filter((solution) => solution.length === min_length);
};

// Returns the max depth that should be checked for future calls
const solve_impl = (cube, solved_cube, move_set, move_counts, moves, solutions, progress, max_depth, depth) => {
    // Base case - no moves left
    if (depth > max_depth) {
        // Continue with current max depth since we didn't find anything here
        return max_depth;
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
            const next_max_depth = solve_impl(cube, solved_cube, move_set[rotation], move_counts,
                                              moves, solutions, progress, max_depth, depth + 1);
            if (depth + 5 === max_depth && progress.callback) {
                progress.count += move_counts[rotation][depth] || 0;
                progress.callback(progress.count, progress.total);
            }
            max_depth = next_max_depth;
        }

        // Undo the move to try the next one
        moves.pop();
        rubik.rotate(cube, -rotation);

        if (solved) {
            // No point in trying more moves from here
            // Don't look any further than the current depth
            return depth;
        }
    }
    // Continue with current max depth since we didn't find anything here
    return max_depth;
};

const count_moves = (move_set, max_depth) => {
    const move_cache = {};

    const count_moves_impl = (move_set, move, depth) => {
        if (depth >= max_depth) {
            return 0;
        }
        let cached = move_cache[move];
        let cached_depth;
        if (cached === undefined) {
            cached = {};
            move_cache[move] = cached;
        } else {
            cached_depth = cached[depth];
            if (cached_depth !== undefined) {
                return cached_depth;
            }
        }
        cached_depth = 0;
        for (const rotation in move_set) {
            cached_depth += count_moves_impl(move_set[rotation], rotation, depth + 1) + 1;
        }
        cached[depth] = cached_depth;
        return cached_depth;
    };

    console.log(move_cache);
    count_moves_impl(move_set, null, 0);
    return move_cache;
}

const construct_move_set = (allowed_rotations) => {
    const move_set = {};

    const get_move_data = (move) => {
        const value = move_set[move];
        if (value !== undefined) {
            return value;
        }
        const new_value = {};
        move_set[move] = new_value;
        return new_value;
    };

    const construct_impl = (last_move, max_depth) => {
        if (max_depth === 0) {
            return;
        }
        for (const rotation of allowed_rotations) {
            if (!move_allowed(rotation, last_move))
                continue;
            const move_data = get_move_data(last_move);
            move_data[rotation] = get_move_data(rotation);
            construct_impl(rotation, max_depth - 1);
        }
    };

    construct_impl(null, 2);
    return get_move_data(null);
};

const move_allowed = (rotation, last_move) => {
    if (last_move === null) {
        // No previous move - must be valid
        return true;
    }

    const axis = get_axis(rotation);
    const base = rubik.base_rotation(rotation);

    const last_axis = get_axis(last_move);
    const last_base = rubik.base_rotation(last_move);

    if (last_axis !== axis) {
        // The previous move was on a different axis, so this move is valid
        return true;
    } else if (last_base === base) {
        // The previous move was on the same face, so this move is invalid
        return false;
    } else  {
        // The previous move was on the opposite face, so whether this move is valid
        // depends on the "order" of the faces - R can be after L, but L can't be after R
        return last_base > base;
    }
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
