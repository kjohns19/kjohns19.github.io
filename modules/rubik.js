const rubik = (() => {
const rubik = {};

// Public constants

rubik.face = {
    UP: 0,
    LEFT: 1,
    FRONT: 2,
    RIGHT: 3,
    BACK: 4,
    DOWN: 5,
};
rubik.color = {
    DONT_CARE: -1,
    WHITE: 1,
    ORANGE: 2,
    GREEN: 3,
    RED: 4,
    BLUE: 5,
    YELLOW: 6,
};
rubik.color_names = [
    'Don\'t Care', 'White', 'Orange', 'Green', 'Red', 'Blue', 'Yellow'
];
rubik.rotation = {
    F: 1,
    B: 3,
    R: 5,
    L: 7,
    U: 9,
    D: 11,
    M: 13,
    E: 15,
    S: 17,
    X: 19,
    Y: 21,
    Z: 23,
};

// Public functions

// Create a cube
rubik.create = (centers) => {
    //             U00 U01 U02
    //             U10 U11 U12
    //             U20 U21 U22
    // L00 L01 L02 F00 F01 F02 R00 R01 R02 B00 B01 B02
    // L10 L11 L12 F10 F11 F12 R10 R11 R12 B10 B11 B12
    // L20 L21 L22 F20 F21 F22 R20 R21 R22 B20 B21 B22
    //             D00 D01 D02
    //             D10 D11 D12
    //             D20 D21 D22
    // U => indices  0- 8
    // L => indices  9-17
    // F => indices 18-26
    // R => indices 27-35
    // B => indices 36-44
    // D => indices 45-53
    // Center orientation of each face => indices 54-59
    if (centers === undefined) {
        centers = [
            rubik.color.WHITE,
            rubik.color.ORANGE,
            rubik.color.GREEN,
            rubik.color.RED,
            rubik.color.BLUE,
            rubik.color.YELLOW
        ];
    }
    return [
        ...Array(9).fill(centers[0]),
        ...Array(9).fill(centers[1]),
        ...Array(9).fill(centers[2]),
        ...Array(9).fill(centers[3]),
        ...Array(9).fill(centers[4]),
        ...Array(9).fill(centers[5]),
        ...Array(6).fill(0),
    ];
};

// Resets an existing cube to its initial state
rubik.reset = (cube) => {
    const new_cube = rubik.create();
    rubik.copy_into(new_cube, cube);
};

// Clear a cube
rubik.clear = (cube) => {
    cube.fill(rubik.color.DONT_CARE);
    for (let i = 0; i < 6; i++) {
        cube[54 + i] = 0;
    }
};

// Returns whether two cubes are equal
rubik.is_equal = (c1, c2, check_center_orientation) => {
    const dont_care = rubik.color.DONT_CARE;
    const limit = check_center_orientation ? 60 : 54;
    for (let i = 0; i < limit; i++) {
        const e1 = c1[i];
        const e2 = c2[i];
        if (!(e1 === e2 || e1 === dont_care || e2 === dont_care))
            return false;
    }
    return true;
};

// Copy a cube
rubik.copy = (cube) => {
    return [...cube];
};

rubik.copy_into = (src, dest) => {
    src.forEach((elem, i) => {
        dest[i] = elem;
    });
};

rubik.for_each = (cube, func) => {
    // Only loop over the pieces, not the rotation data
    for (let i = 0; i < 54; i++)
        func(cube[i], i, cube);  // Called the same Array.forEach does it
};

// Set the face value at a position
rubik.set_at_index = (cube, index, value) => {
    cube[index] = value;
};

// Get the center colors of a cube
rubik.get_centers = (cube) => {
    return ([0, 1, 2, 3, 4, 5]).map((face) => cube[face * 9 + 4]);
};

// Get the center orientations of a cube
rubik.get_center_orientations = (cube) => {
    return ([0, 1, 2, 3, 4, 5]).map((face) => cube[9 * 6 + face]);
};

// Apply a rotation to the cube
rubik.rotate = (cube, rotation) => {
    const dest = Array(9 * 6 + 6);
    rubik.rotate_into(cube, dest, rotation);
    rubik.copy_into(dest, cube);
};
rubik.rotate_into = (cube, dest_cube, rotation) => {
    // This function is called *very* often, so we use traditional for loops for performance
    const rotation_data = cached_rotation_data[rotation];
    const indices = rotation_data.indices;
    const centers = rotation_data.centers;
    const center_rotations = rotation_data.center_rotations;

    // We know exactly how long the array is so we hard code the length
    // (54 = 3 * 3 * 6 = number of tiles on a cube)
    for (let i = 0; i < 54; i++) {
        dest_cube[i] = cube[indices[i]];
    }
    for (let i = 0; i < 6; i++) {
        dest_cube[54 + i] = cube[54 + centers[i]];
    }
    for (let i = 0; i < center_rotations.length; i += 2) {
        const idx = center_rotations[i];
        const amount = center_rotations[i + 1];
        dest_cube[54 + idx] = (dest_cube[54 + idx] + amount + 4) % 4;
    }
};

rubik.rotate_into_fast = (cube, dest_cube, rotation) => {
    // This function is called *very* often, so we use traditional for loops for performance
    // This function assumes that centers don't move, and exactly one center rotates
    const rotation_data = cached_rotation_data[rotation];
    const indices = rotation_data.indices;
    const center_rotations = rotation_data.center_rotations;

    // We know exactly how long the array is so we hard code the length
    // (54 = 3 * 3 * 6 = number of tiles on a cube)
    for (let i = 0; i < 54; i++) {
        dest_cube[i] = cube[indices[i]];
    }

    const idx = center_rotations[0];
    const amount = center_rotations[1];
    dest_cube[54 + idx] = (dest_cube[54 + idx] + amount + 4) % 4;
};

rubik.rotate_into_ignore_center_orientation = (cube, dest_cube, rotation) => {
    // This function is called *very* often, so we use traditional for loops for performance
    const rotation_data = cached_rotation_data[rotation];
    const indices = rotation_data.indices;

    // We know exactly how long the array is so we hard code the length
    // (54 = 3 * 3 * 6 = number of tiles on a cube)
    for (let i = 0; i < 54; i++) {
        dest_cube[i] = cube[indices[i]];
    }
};

rubik.parse_rotations = (rotations_str) => {
    const valid = Object.keys(rubik.rotation).join('');
    const regex = new RegExp(`[${valid}](?:'|2)?`, 'g');
    const match = rotations_str.toUpperCase().match(regex);
    if (match === null) {
        return [];
    }
    return match.map((rotation_str) => {
        if (rotation_str.length === 0 || rotation_str.length > 2) {
            return null;
        }
        let rot = rubik.rotation[rotation_str[0]];
        if (rot === undefined) {
            return null;
        }
        if (rotation_str.length === 2) {
            if (rotation_str[1] === '\'') {
                rot *= -1;
            } else if (rotation_str[1] === '2') {
                rot *= 2;
            } else {
                return null;
            }
        }
        return rot;
    }).filter((rotation) => rotation !== null);
};
rubik.rotations_to_string = (rotations) => {
    return rotations.map(rubik.rotation_to_string).join(' ');
};
rubik.rotation_to_string = (rotation) => {
    let suffix = '';
    if (rotation === 0) {
        return '?';
    }
    if (rotation < 0) {
        rotation *= -1;
        suffix = '\'';
    }
    else if (rotation % 2 === 0) {
        rotation /= 2;
        suffix = '2';
    }
    const data = rotation_data[rotation];
    if (data === undefined) {
        return '?';
    }
    return data.name + suffix;
};

// Convert a rotation to its base form (e.g. R' => R, R2 => R)
rubik.base_rotation = (rot) => {
    if (rot < 0) {
        rot *= -1;
    }
    if (rot % 2 === 0) {
        rot /= 2;
    }
    return rot;
};

// Private constants and functions

const rotation_data = {};

// Rotate a face clockwise or counter-clockwise
const rotate_face = (rotation, face, ccw) => {
    const indices = rotation.indices;
    const offset = face * 9;
    const new_face = [
        indices[offset + 6],
        indices[offset + 3],
        indices[offset + 0],
        indices[offset + 7],
        indices[offset + 4],
        indices[offset + 1],
        indices[offset + 8],
        indices[offset + 5],
        indices[offset + 2],
    ];
    if (ccw) {
        new_face.reverse();
    }
    for (let i = 0; i < 9; i++) {
        indices[offset + i] = new_face[i];
    }
};

const apply_index_transform = (data, indices) => {
    const copy = [...data];
    for (let i = 0; i < indices.length; i++) {
        data[i] = copy[indices[i]];
    }
}

const apply_stride_index_transform = (data, indices) => {
    const cube_index_data = indices.map((i) => data[i]);
    const stride = indices.length / 4;
    for (let i = 0; i < indices.length; i++) {
        data[indices[(i + stride) % indices.length]] = cube_index_data[i];
    }
}

const make_identity_rotation = () => {
    return {
        indices: [...Array(9 * 6).keys()],
        centers: [...Array(6).keys()],
        center_rotations: [],
    };
}

// Make a rotation for a single face
const make_face_rotation = (face, indices) => {
    const rotation = make_identity_rotation();
    rotate_face(rotation, face, false);
    apply_stride_index_transform(rotation.indices, indices);
    rotation.center_rotations.push(face);
    rotation.center_rotations.push(1);
    return rotation;
};

// Make a rotation for the whole cube
const make_cube_rotation = (face, ccw_face, indices, center_rotations) => {
    const rotation = make_identity_rotation();
    rotate_face(rotation, face, false);
    rotate_face(rotation, ccw_face, true);
    apply_stride_index_transform(rotation.indices, indices);
    apply_index_transform(rotation.centers, center_rotations);
    return rotation;
};

// Combine multiple rotations into a single one
const make_composed_rotation = (rotations) => {
    const rotation = make_identity_rotation();
    const total_center_rotations = Array(6).fill(0);

    for (const rot of rotations.split(' ')) {
        const rot_data = rotation_data[rot].rotation;
        apply_index_transform(rotation.indices, rot_data.indices);
        apply_index_transform(rotation.centers, rot_data.centers);
        apply_index_transform(total_center_rotations, rot_data.centers);
        for (let i = 0; i < rot_data.center_rotations.length; i += 2) {
            const face = rot_data.center_rotations[i];
            const amount = rot_data.center_rotations[i + 1];
            total_center_rotations[face] += amount;
        }
    }

    for (let face = 0; face < 6; face++) {
        const amount = (total_center_rotations[face] % 4 + 4) % 4;
        if (amount !== 0) {
            rotation.center_rotations.push(face);
            rotation.center_rotations.push(amount);
        }
    }

    return rotation;
};

const range = (a, b, step) => {
    if (step === undefined) {
        step = (b >= a) ? 1 : -1;
    }
    const length = Math.ceil((b - a) / step);
    if (length <= 0) {
        return [];
    }
    return Array.from({length: length}, (_, i) => a + i * step);
};

const off = {
    u: rubik.face.UP * 9,
    l: rubik.face.LEFT * 9,
    f: rubik.face.FRONT * 9,
    r: rubik.face.RIGHT * 9,
    b: rubik.face.BACK * 9,
    d: rubik.face.DOWN * 9,
};

// Define F, X, and Y on their own. The rest of the rotations can be defined entirely from them
rotation_data['F'] = {
    rotation: make_face_rotation(rubik.face.FRONT, [
        off.u + 6, off.u + 7, off.u + 8, off.r + 0, off.r + 3, off.r + 6,
        off.d + 2, off.d + 1, off.d + 0, off.l + 8, off.l + 5, off.l + 2,
    ])
};
rotation_data['X'] = {
    rotation: make_cube_rotation(rubik.face.RIGHT, rubik.face.LEFT, [
        ...range(off.b + 8, off.b - 1),
        ...range(off.d + 0, off.d + 9),
        ...range(off.f + 0, off.f + 9),
        ...range(off.u + 0, off.u + 9),
    ], [
        rubik.face.FRONT,
        rubik.face.LEFT,
        rubik.face.DOWN,
        rubik.face.RIGHT,
        rubik.face.UP,
        rubik.face.BACK,
    ])
};
rotation_data['Y'] = {
    rotation: make_cube_rotation(rubik.face.UP, rubik.face.DOWN, [
        ...range(off.r + 0, off.r + 9),
        ...range(off.f + 0, off.f + 9),
        ...range(off.l + 0, off.l + 9),
        ...range(off.b + 0, off.b + 9),
    ], [
        rubik.face.UP,
        rubik.face.FRONT,
        rubik.face.RIGHT,
        rubik.face.BACK,
        rubik.face.LEFT,
        rubik.face.DOWN,
    ])
};
rotation_data['Z'] = {
    rotation: make_composed_rotation('X Y X X X')
};
rotation_data['B'] = {
    rotation: make_composed_rotation('X X F X X')
};
rotation_data['U'] = {
    rotation: make_composed_rotation('X X X F X')
};
rotation_data['D'] = {
    rotation: make_composed_rotation('X F X X X')
};
rotation_data['L'] = {
    rotation: make_composed_rotation('Y Y Y F Y')
};
rotation_data['R'] = {
    rotation: make_composed_rotation('Y F Y Y Y')
};
rotation_data['M'] = {
    rotation: make_composed_rotation('X X X R L L L')
};
rotation_data['E'] = {
    rotation: make_composed_rotation('Y Y Y U D D D')
};
rotation_data['S'] = {
    rotation: make_composed_rotation('Z B F F F')
};

const cached_rotation_data = {};
for (const rot in rubik.rotation) {
    const val = rubik.rotation[rot];

    const rotation_entry = rotation_data[rot];
    rotation_data[val] = rotation_entry;

    rotation_entry.name = rot;
    rotation_entry.value = val;

    cached_rotation_data[val] = rotation_entry.rotation;
    cached_rotation_data[-val] = make_composed_rotation(`${rot} ${rot} ${rot}`);
    cached_rotation_data[val * 2] = make_composed_rotation(`${rot} ${rot}`);
    cached_rotation_data[val * -2] = cached_rotation_data[val * 2];
}

return rubik;
})();
