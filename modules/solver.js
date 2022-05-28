const solver = (() => {
const module = {};

// Find solutions to a cube
// Calls the callback regularly with an object of this format:
// {
//     progress: {
//         count: <number of moves made (number)>
//         total: <total number of moves to make (number)>
//     }
// }
// When a solution is found the callback is called with an object of this format:
// {
//     solution: <moves (array of rotations)>
// }
module.solve = (cube, allowed_rotations, max_moves, callback) => {
    // The solved cube has the same centers as the scrambled one
    // so no full rotations are needed
    const solved_cube = rubik.create(rubik.get_centers(cube));

    // Check if it's already solved
    if (rubik.is_equal_with_ignored(cube, solved_cube)) {
        return [[]];
    }

    // Each move will work with the previous move's resulting cube and write into another one
    const cubes = [...Array(max_moves + 1)].map(() => rubik.copy(cube));
    // This will be used to track the current set of moves at each depth
    const moves = Array(max_moves);

    // Construct a graph of moves based on the allowed rotations
    const move_set = construct_move_set(allowed_rotations);
    const move_counts = count_moves(move_set, max_moves);

    const progress = {
        total: move_counts[null][0],
        count: 0,
    };

    const solve_impl = (current_move_set, depth) => {
        // Base case - no moves left
        if (depth > max_moves) {
            return;
        }

        const cube = cubes[depth - 1];
        const next_cube = cubes[depth];

        for (const rotation in current_move_set) {
            // Make the move
            rubik.rotate_into(cube, next_cube, rotation);
            moves[depth - 1] = rotation;

            // Add the solution if it's solved, otherwise try more moves
            const solved = rubik.is_equal_with_ignored(next_cube, solved_cube);
            if (solved) {
                callback({
                    solution: moves.slice(0, depth)
                });
            } else {
                solve_impl(current_move_set[rotation], depth + 1);
            }

            if (depth + 5 === max_moves) {
                progress.count += move_counts[rotation][depth] || 0;
                callback({
                    progress: {
                        count: progress.count,
                        total: progress.total
                    }
                });
            }
            if (solved) {
                break;
            }
        }
    };

    solve_impl(move_set, 1);
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

    count_moves_impl(move_set, null, 0);
    return move_cache;
};

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

return module;
})();
