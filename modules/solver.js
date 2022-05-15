import * as rubik from './rubik.js';

export const solve = (cube) => {
    const solved_cube = rubik.create();
    if (rubik.is_equal(cube, solved_cube)) {
        return [];
    }

    // Double rotations get tried first
    const allowed_rotations = [
        rubik.rotation.F * 2,
        rubik.rotation.F,
        rubik.rotation.F * -1,
        rubik.rotation.B * 2,
        rubik.rotation.B,
        rubik.rotation.B * -1,
        rubik.rotation.R * 2,
        rubik.rotation.R,
        rubik.rotation.R * -1,
        rubik.rotation.L * 2,
        rubik.rotation.L,
        rubik.rotation.L * -1,
        rubik.rotation.D * 2,
        rubik.rotation.D,
        rubik.rotation.D * -1,
        rubik.rotation.U * 2,
        rubik.rotation.U,
        rubik.rotation.U * -1,
    ];

    const solution = solve_impl(cube, solved_cube, allowed_rotations, null, null, null, 6);
    if (solution !== null) {
        solution.reverse();
    }
    return solution;
};

const solve_impl = (cube, solved_cube, allowed_rotations,
                    last_rot, last_axis1, last_axis2, max_depth) => {
    if (max_depth === 0) {
        return null;
    }

    const normalize_rotation = (rotation) => {
        if (rotation === null) {
            return null;
        }
        return rubik.base_rotation(rotation);
    };

    for (const rotation of allowed_rotations) {
        const base_rot = rubik.base_rotation(rotation);
        let axis;
        switch (base_rot) {
        case rubik.rotation.F:
        case rubik.rotation.B:
            axis = 0;
            break;
        case rubik.rotation.R:
        case rubik.rotation.L:
            axis = 1;
            break;
        case rubik.rotation.U:
        case rubik.rotation.D:
            axis = 2;
            break;
        }

        // Can't do a move on the same side as the last move,
        // or a move on the same axis as the last 2 moves
        // e.g. F followed by F' (would cancel out) or F B followed by F (equivalent to F2 B)
        if (base_rot === last_rot || (axis === last_axis1 && axis === last_axis2)) {
            continue;
        }
        rubik.rotate(cube, rotation);
        if (rubik.is_equal(cube, solved_cube)) {
            return [rotation];
        }
        const possible_solution = solve_impl(
            cube, solved_cube, allowed_rotations, base_rot, last_axis2, axis, max_depth - 1);
        if (possible_solution !== null) {
            possible_solution.push(rotation);
            return possible_solution;
        }
        rubik.rotate(cube, -rotation);
    }
    return null;
};
