// Public constants

export const face = {
    UP: 0,
    LEFT: 1,
    FRONT: 2,
    RIGHT: 3,
    BACK: 4,
    DOWN: 5,
};
export const color = {
    WHITE: 0,
    ORANGE: 1,
    GREEN: 2,
    RED: 3,
    BLUE: 4,
    YELLOW: 5,
};
export const rotation = {
    F: 1,
    B: 3,
    R: 5,
    L: 7,
    D: 9,
    U: 11,
    M: 13,
    E: 15,
    S: 17,
    X: 19,
    Y: 21,
    Z: 23,
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
    u: face.UP * 9,
    l: face.LEFT * 9,
    f: face.FRONT * 9,
    r: face.RIGHT * 9,
    b: face.BACK * 9,
    d: face.DOWN * 9,
};

const rotate_data = [];
rotate_data[rotation.F] = {
    name: 'F',
    face: face.FRONT,
    indices: [
        off.u + 6, off.u + 7, off.u + 8, off.r + 0, off.r + 3, off.r + 6,
        off.d + 2, off.d + 1, off.d + 0, off.l + 8, off.l + 5, off.l + 2,
    ],
};
rotate_data[rotation.B] = {
    name: 'B',
    face: face.BACK,
    indices: [
        off.u + 2, off.u + 1, off.u + 0, off.l + 0, off.l + 3, off.l + 6,
        off.d + 8, off.d + 7, off.d + 6, off.r + 8, off.r + 5, off.r + 2,
    ],
};
rotate_data[rotation.R] = {
    name: 'R',
    face: face.RIGHT,
    indices: [
        off.u + 8, off.u + 5, off.u + 2, off.b + 0, off.b + 3, off.b + 6,
        off.d + 8, off.d + 5, off.d + 2, off.f + 8, off.f + 5, off.f + 2,
    ],
};
rotate_data[rotation.L] = {
    name: 'L',
    face: face.LEFT,
    indices: [
        off.u + 0, off.u + 3, off.u + 6, off.f + 0, off.f + 3, off.f + 6,
        off.d + 0, off.d + 3, off.d + 6, off.b + 8, off.b + 5, off.b + 2,
    ],
};
rotate_data[rotation.D] = {
    name: 'D',
    face: face.DOWN,
    indices: [
        off.f + 6, off.f + 7, off.f + 8, off.r + 6, off.r + 7, off.r + 8,
        off.b + 6, off.b + 7, off.b + 8, off.l + 6, off.l + 7, off.l + 8,
    ],
};
rotate_data[rotation.U] = {
    name: 'U',
    face: face.UP,
    indices: [
        off.b + 2, off.b + 1, off.b + 0, off.r + 2, off.r + 1, off.r + 0,
        off.f + 2, off.f + 1, off.f + 0, off.l + 2, off.l + 1, off.l + 0,
    ],
};
rotate_data[rotation.M] = {
    name: 'M',
    indices: [
        off.u + 1, off.u + 4, off.u + 7, off.f + 1, off.f + 4, off.f + 7,
        off.d + 1, off.d + 4, off.d + 7, off.b + 7, off.b + 4, off.b + 1,
    ],
};
rotate_data[rotation.E] = {
    name: 'E',
    indices: [
        off.f + 3, off.f + 4, off.f + 5, off.r + 3, off.r + 4, off.r + 5,
        off.b + 3, off.b + 4, off.b + 5, off.l + 3, off.l + 4, off.l + 5,
    ],
};
rotate_data[rotation.S] = {
    name: 'S',
    indices: [
        off.u + 3, off.u + 4, off.u + 5, off.r + 1, off.r + 4, off.r + 7,
        off.d + 5, off.d + 4, off.d + 3, off.l + 7, off.l + 4, off.l + 1,
    ],
};
rotate_data[rotation.X] = {
    name: 'X',
    face: face.RIGHT,
    ccw_face: face.LEFT,
    indices: [
        ...range(off.u + 0, off.u + 9),
        ...range(off.f + 0, off.f + 9),
        ...range(off.d + 0, off.d + 9),
        ...range(off.b + 8, off.b - 1),
    ],
};
rotate_data[rotation.Y] = {
    name: 'Y',
    face: face.UP,
    ccw_face: face.DOWN,
    indices: [
        ...range(off.l + 0, off.l + 9),
        ...range(off.f + 0, off.f + 9),
        ...range(off.r + 0, off.r + 9),
        ...range(off.b + 0, off.b + 9),
    ],
};
rotate_data[rotation.Z] = {
    name: 'Z',
    face: face.FRONT,
    ccw_face: face.BACK,
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

// Public functions

// Create a cube
export const create = () => {
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
    return [
        ...Array(9).fill(color.WHITE),
        ...Array(9).fill(color.ORANGE),
        ...Array(9).fill(color.GREEN),
        ...Array(9).fill(color.RED),
        ...Array(9).fill(color.BLUE),
        ...Array(9).fill(color.YELLOW),
    ];
};

// Copy a cube
export const copy = (cube) => {
    return [...cube];
};

// Convert a cube to a string
export const to_string = (cube) => {
    //       U U U
    //       U U U
    //       U U U
    // L L L F F F R R R B B B
    // L L L F F F R R R B B B
    // L L L F F F R R R B B B
    //       D D D
    //       D D D
    //       D D D
    return (
        '      ' + cube[off.u + 0] + ' ' + cube[off.u + 1] + ' ' + cube[off.u + 2] + '\n' +
        '      ' + cube[off.u + 3] + ' ' + cube[off.u + 4] + ' ' + cube[off.u + 5] + '\n' +
        '      ' + cube[off.u + 6] + ' ' + cube[off.u + 7] + ' ' + cube[off.u + 8] + '\n' +

        cube[off.l + 0] + ' ' + cube[off.l + 1] + ' ' + cube[off.l + 2] + ' ' +
        cube[off.f + 0] + ' ' + cube[off.f + 1] + ' ' + cube[off.f + 2] + ' ' +
        cube[off.r + 0] + ' ' + cube[off.r + 1] + ' ' + cube[off.r + 2] + ' ' +
        cube[off.b + 0] + ' ' + cube[off.b + 1] + ' ' + cube[off.b + 2] + '\n' +

        cube[off.l + 3] + ' ' + cube[off.l + 4] + ' ' + cube[off.l + 5] + ' ' +
        cube[off.f + 3] + ' ' + cube[off.f + 4] + ' ' + cube[off.f + 5] + ' ' +
        cube[off.r + 3] + ' ' + cube[off.r + 4] + ' ' + cube[off.r + 5] + ' ' +
        cube[off.b + 3] + ' ' + cube[off.b + 4] + ' ' + cube[off.b + 5] + '\n' +

        cube[off.l + 6] + ' ' + cube[off.l + 7] + ' ' + cube[off.l + 8] + ' ' +
        cube[off.f + 6] + ' ' + cube[off.f + 7] + ' ' + cube[off.f + 8] + ' ' +
        cube[off.r + 6] + ' ' + cube[off.r + 7] + ' ' + cube[off.r + 8] + ' ' +
        cube[off.b + 6] + ' ' + cube[off.b + 7] + ' ' + cube[off.b + 8] + '\n' +

        '      ' + cube[off.d + 0] + ' ' + cube[off.d + 1] + ' ' + cube[off.d + 2] + '\n' +
        '      ' + cube[off.d + 3] + ' ' + cube[off.d + 4] + ' ' + cube[off.d + 5] + '\n' +
        '      ' + cube[off.d + 6] + ' ' + cube[off.d + 7] + ' ' + cube[off.d + 8] + '\n'
    );
};

// Get the face value at a position
export const get_at = (cube, face, row, col) => {
    return cube[face * 3 * 3 + row * 3 + col];
};
// Set the face value at a position
export const set_at = (cube, face, row, col, value) => {
    cube[face * 3 * 3 + row * 3 + col] = value;
}

// Apply a rotation to the cube
export const rotate = (cube, rotation) => {
    if (rotation === 0) {
        return;
    }

    // Double the rotation value to rotate twice (e.g. 2*rotation.F)
    if (rotation % 2 === 0) {
        rotate(cube, rotation / 2);
        rotate(cube, rotation / 2);
        return
    }
    // Negate the rotation to rotate counter-clockwise (e.g. -rotation.F)
    const ccw = (rotation < 0);
    const abs_rotation = Math.abs(rotation);
    const data = rotate_data[abs_rotation];
    if (data === undefined) {
        return;
    }
    if (data.face !== undefined) {
        rotate_face(cube, data.face, ccw);
    }
    if (data.ccw_face !== undefined) {
        rotate_face(cube, data.ccw_face, !ccw);
    }
    const cube_data = data.indices.map(i => cube[i]);

    const len = data.indices.length;
    const stride = len / 4;
    const offset = ccw ? stride * 3 : stride;
    for (let i = 0; i < len; i++) {
        cube[data.indices[(i + offset) % len]] = cube_data[i];
    }
};

export const parse_rotations = (rotations_str) => {
    const valid = Object.keys(rotation).join('');
    const regex = new RegExp(`[${valid}](?:'|2)?`, 'g');
    return rotations_str.match(regex).map((rotation_str) => {
        if (rotation_str.length == 0 || rotation_str.length > 2) {
            return null;
        }
        let rot = rotation[rotation_str[0]];
        if (rot === undefined) {
            return null;
        }
        if (rotation_str.length == 2) {
            if (rotation_str[1] == '\'') {
                rot *= -1;
            } else if (rotation_str[1] == '2') {
                rot *= 2;
            } else {
                return null;
            }
        }
        return rot;
    }).filter((rotation) => rotation !== null);
};
export const rotations_to_string = (rotations) => {
    return rotations.map((rot) => {
        let real_rotation = rot;
        let suffix = '';
        if (real_rotation === 0) {
            return '?';
        }
        if (real_rotation < 0) {
            real_rotation *= -1;
            suffix = '\'';
        }
        else if (real_rotation % 2 === 0) {
            real_rotation /= 2;
            suffix = '2';
        }
        const data = rotate_data[real_rotation];
        if (data === undefined) {
            return '?';
        }
        return data.name + suffix;
    }).join(' ');
};

// Private functions

// Rotate a face clockwise or counter-clockwise
const rotate_face = (cube, face, ccw) => {
    const offset = face * 9;
    let new_face = [
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
    if (ccw) {
        new_face.reverse();
    }
    for (let i = 0; i < 9; i++) {
        cube[offset + i] = new_face[i];
    }
};
