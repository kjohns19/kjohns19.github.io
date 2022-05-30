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
    DONT_CARE: 0,
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
};

// Returns whether two cubes are equal
rubik.is_equal = (c1, c2) => {
    return c1.every((elem, i) => elem === c2[i]);
};
rubik.is_equal_with_ignored = (c1, c2) => {
    return c1.every((elem, i) => elem === c2[i] ||
                                 elem === rubik.color.DONT_CARE ||
                                 c2[i] === rubik.color.DONT_CARE);
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
    cube.forEach(func);
};

// Set the face value at a position
rubik.set_at_index = (cube, index, value) => {
    cube[index] = value;
};

// Get the center colors of a cube
rubik.get_centers = (cube) => {
    return ([0, 1, 2, 3, 4, 5]).map((face) => cube[face * 9 + 4]);
};

// Apply a rotation to the cube
rubik.rotate = (cube, rotation) => {
    const dest = Array(9 * 6);
    rubik.rotate_into(cube, dest, rotation);
    rubik.copy_into(dest, cube);
};
rubik.rotate_into = (cube, dest_cube, rotation) => {
    // This function is called *very* often, so we use a traditional for loop for performance
    // We know exactly how long the array is so we hard code the length
    // (54 = 3 * 3 * 6 = number of tiles on a cube)
    const index_data = cached_rotation_data[rotation];
    for (let i = 0; i < 54; i++) {
        dest_cube[i] = cube[index_data[i]];
    }
};

rubik.parse_rotations = (rotations_str) => {
    const valid = Object.keys(rotation).join('');
    const regex = new RegExp(`[${valid}](?:'|2)?`, 'g');
    const match = rotations_str.toUpperCase().match(regex);
    if (match === null) {
        return [];
    }
    return match.map((rotation_str) => {
        if (rotation_str.length === 0 || rotation_str.length > 2) {
            return null;
        }
        let rot = rotation[rotation_str[0]];
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
    const data = rotate_data[rotation];
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

// Private constants

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

const rotate_data = [];
rotate_data[rubik.rotation.F] = {
    name: 'F',
    face: rubik.face.FRONT,
    indices: [
        off.u + 6, off.u + 7, off.u + 8, off.r + 0, off.r + 3, off.r + 6,
        off.d + 2, off.d + 1, off.d + 0, off.l + 8, off.l + 5, off.l + 2,
    ],
};
rotate_data[rubik.rotation.B] = {
    name: 'B',
    face: rubik.face.BACK,
    indices: [
        off.u + 2, off.u + 1, off.u + 0, off.l + 0, off.l + 3, off.l + 6,
        off.d + 6, off.d + 7, off.d + 8, off.r + 8, off.r + 5, off.r + 2,
    ],
};
rotate_data[rubik.rotation.R] = {
    name: 'R',
    face: rubik.face.RIGHT,
    indices: [
        off.u + 8, off.u + 5, off.u + 2, off.b + 0, off.b + 3, off.b + 6,
        off.d + 8, off.d + 5, off.d + 2, off.f + 8, off.f + 5, off.f + 2,
    ],
};
rotate_data[rubik.rotation.L] = {
    name: 'L',
    face: rubik.face.LEFT,
    indices: [
        off.u + 0, off.u + 3, off.u + 6, off.f + 0, off.f + 3, off.f + 6,
        off.d + 0, off.d + 3, off.d + 6, off.b + 8, off.b + 5, off.b + 2,
    ],
};
rotate_data[rubik.rotation.U] = {
    name: 'U',
    face: rubik.face.UP,
    indices: [
        off.b + 2, off.b + 1, off.b + 0, off.r + 2, off.r + 1, off.r + 0,
        off.f + 2, off.f + 1, off.f + 0, off.l + 2, off.l + 1, off.l + 0,
    ],
};
rotate_data[rubik.rotation.D] = {
    name: 'D',
    face: rubik.face.DOWN,
    indices: [
        off.f + 6, off.f + 7, off.f + 8, off.r + 6, off.r + 7, off.r + 8,
        off.b + 6, off.b + 7, off.b + 8, off.l + 6, off.l + 7, off.l + 8,
    ],
};
rotate_data[rubik.rotation.M] = {
    name: 'M',
    indices: [
        off.u + 1, off.u + 4, off.u + 7, off.f + 1, off.f + 4, off.f + 7,
        off.d + 1, off.d + 4, off.d + 7, off.b + 7, off.b + 4, off.b + 1,
    ],
};
rotate_data[rubik.rotation.E] = {
    name: 'E',
    indices: [
        off.f + 3, off.f + 4, off.f + 5, off.r + 3, off.r + 4, off.r + 5,
        off.b + 3, off.b + 4, off.b + 5, off.l + 3, off.l + 4, off.l + 5,
    ],
};
rotate_data[rubik.rotation.S] = {
    name: 'S',
    indices: [
        off.u + 3, off.u + 4, off.u + 5, off.r + 1, off.r + 4, off.r + 7,
        off.d + 5, off.d + 4, off.d + 3, off.l + 7, off.l + 4, off.l + 1,
    ],
};
rotate_data[rubik.rotation.X] = {
    name: 'X',
    face: rubik.face.RIGHT,
    ccw_face: rubik.face.LEFT,
    indices: [
        ...range(off.b + 8, off.b - 1),
        ...range(off.d + 0, off.d + 9),
        ...range(off.f + 0, off.f + 9),
        ...range(off.u + 0, off.u + 9),
    ],
};
rotate_data[rubik.rotation.Y] = {
    name: 'Y',
    face: rubik.face.UP,
    ccw_face: rubik.face.DOWN,
    indices: [
        ...range(off.r + 0, off.r + 9),
        ...range(off.f + 0, off.f + 9),
        ...range(off.l + 0, off.l + 9),
        ...range(off.b + 0, off.b + 9),
    ],
};
rotate_data[rubik.rotation.Z] = {
    name: 'Z',
    face: rubik.face.FRONT,
    ccw_face: rubik.face.BACK,
    indices: [
        ...range(off.l + 0, off.l + 9),
        ...[off.u + 2, off.u + 5, off.u + 8,
            off.u + 1, off.u + 4, off.u + 7,
            off.u + 0, off.u + 3, off.u + 6],
        ...range(off.r + 8, off.r - 1),
        ...[off.d + 6, off.d + 3, off.d + 0,
            off.d + 7, off.d + 4, off.d + 1,
            off.d + 8, off.d + 5, off.d + 2],
    ],
};

// Private functions

// Calculate the index data for a rotation
const calculate_rotation_data = (rotation) => {
    const cube_data = [...Array(9 * 6).keys()];

    // Double the rotation value to rotate twice (e.g. 2*rotation.F)
    const twice = rotation % 2 === 0;
    if (twice) {
        rotation = Math.abs(rotation / 2);
    }

    // Negate the rotation to rotate counter-clockwise (e.g. -rotation.F)
    const ccw = (rotation < 0);
    const abs_rotation = Math.abs(rotation);
    const data = rotate_data[abs_rotation];
    if (data.face !== undefined) {
        rotate_face(cube_data, data.face, ccw, twice);
    }
    if (data.ccw_face !== undefined) {
        rotate_face(cube_data, data.ccw_face, !ccw, twice);
    }
    const cube_index_data = data.indices.map((i) => cube_data[i]);

    const len = data.indices.length;
    const stride = len / 4;
    const offset = stride * (ccw ? 3 : twice ? 2 : 1);
    for (let i = 0; i < len; i++) {
        cube_data[data.indices[(i + offset) % len]] = cube_index_data[i];
    }
    return cube_data;
};

// Rotate a face clockwise or counter-clockwise
const rotate_face = (cube, face, ccw, twice) => {
    const offset = face * 9;
    let new_face;
    if (twice) {
        new_face = [
            cube[offset + 8],
            cube[offset + 7],
            cube[offset + 6],
            cube[offset + 5],
            cube[offset + 4],
            cube[offset + 3],
            cube[offset + 2],
            cube[offset + 1],
            cube[offset + 0],
        ];
    } else {
        new_face = [
            cube[offset + 6],
            cube[offset + 3],
            cube[offset + 0],
            cube[offset + 7],
            cube[offset + 4],
            cube[offset + 1],
            cube[offset + 8],
            cube[offset + 5],
            cube[offset + 2],
        ];
    }
    if (ccw) {
        new_face.reverse();
    }
    for (let i = 0; i < 9; i++) {
        cube[offset + i] = new_face[i];
    }
};

const cached_rotation_data = {};
for (const mult of [1, -1, 2, -2]) {
    for (const rot in rubik.rotation) {
        const value = mult * rubik.rotation[rot];
        cached_rotation_data[value] = calculate_rotation_data(value);
    }
};

return rubik;
})();
