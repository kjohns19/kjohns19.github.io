export const cube = function() {
const module = {};

// Public constants

module.face = {
    UP: 0,
    LEFT: 1,
    FRONT: 2,
    RIGHT: 3,
    BACK: 4,
    DOWN: 5,
};
module.color = {
    GREEN: 0,
    BLUE: 1,
    RED: 2,
    ORANGE: 3,
    YELLOW: 4,
    WHITE: 5,
};
module.rotation = {
    F: 1,
    B: 2,
    R: 3,
    L: 4,
    D: 5,
    U: 6,
    M: 7,
    E: 8,
    S: 9,
    // TODO
    // X: 10,
    // Y: 11,
    // Z: 12,
};

// Private constants

const off = {
    u: module.face.UP * 9,
    l: module.face.LEFT * 9,
    f: module.face.FRONT * 9,
    r: module.face.RIGHT * 9,
    b: module.face.BACK * 9,
    d: module.face.DOWN * 9,
};

const rotate_data = [];
rotate_data[module.rotation.F] = {
    face: module.face.FRONT,
    indices: [
        off.u + 6, off.u + 7, off.u + 8, off.r + 0, off.r + 3, off.r + 6,
        off.d + 2, off.d + 1, off.d + 0, off.l + 8, off.l + 5, off.l + 2,
    ],
};
rotate_data[module.rotation.B] = {
    face: module.face.BACK,
    indices: [
        off.u + 2, off.u + 1, off.u + 0, off.l + 0, off.l + 3, off.l + 6,
        off.d + 8, off.d + 7, off.d + 6, off.r + 8, off.r + 5, off.r + 2,
    ],
};
rotate_data[module.rotation.R] = {
    face: module.face.RIGHT,
    indices: [
        off.u + 8, off.u + 5, off.u + 2, off.b + 0, off.b + 3, off.b + 6,
        off.d + 8, off.d + 5, off.d + 2, off.f + 8, off.f + 5, off.f + 2,
    ],
};
rotate_data[module.rotation.L] = {
    face: module.face.LEFT,
    indices: [
        off.u + 0, off.u + 3, off.u + 6, off.f + 0, off.f + 3, off.f + 6,
        off.d + 0, off.d + 3, off.d + 6, off.b + 8, off.b + 5, off.b + 2,
    ],
};
rotate_data[module.rotation.D] = {
    face: module.face.DOWN,
    indices: [
        off.f + 6, off.f + 7, off.f + 8, off.r + 6, off.r + 7, off.r + 8,
        off.b + 6, off.b + 7, off.b + 8, off.l + 6, off.l + 7, off.l + 8,
    ],
};
rotate_data[module.rotation.U] = {
    face: module.face.UP,
    indices: [
        off.b + 2, off.b + 1, off.b + 0, off.r + 2, off.r + 1, off.r + 0,
        off.f + 2, off.f + 1, off.f + 0, off.l + 2, off.l + 1, off.l + 0,
    ],
};
rotate_data[module.rotation.M] = {
    face: null,
    indices: [
        off.u + 1, off.u + 4, off.u + 7, off.f + 1, off.f + 4, off.f + 7,
        off.d + 1, off.d + 4, off.d + 7, off.b + 7, off.b + 4, off.b + 1,
    ],
};
rotate_data[module.rotation.E] = {
    face: null,
    indices: [
        off.f + 3, off.f + 4, off.f + 5, off.r + 3, off.r + 4, off.r + 5,
        off.b + 3, off.b + 4, off.b + 5, off.l + 3, off.l + 4, off.l + 5,
    ],
};
rotate_data[module.rotation.S] = {
    face: null,
    indices: [
        off.u + 3, off.u + 4, off.u + 5, off.r + 1, off.r + 4, off.r + 7,
        off.d + 5, off.d + 4, off.d + 3, off.l + 7, off.l + 4, off.l + 1,
    ],
};

// Public functions

// Create a cube
module.create = function() {
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
        ...Array(9).fill(module.color.GREEN),
        ...Array(9).fill(module.color.BLUE),
        ...Array(9).fill(module.color.RED),
        ...Array(9).fill(module.color.ORANGE),
        ...Array(9).fill(module.color.YELLOW),
        ...Array(9).fill(module.color.WHITE),
    ];
};

// Copy a cube
module.copy = function(cube) {
    return [...cube];
};

// Convert a cube to a string
module.to_string = function(cube) {
    let f = module.face.FRONT * 9;
    let b = module.face.BACK * 9;
    let r = module.face.RIGHT * 9;
    let l = module.face.LEFT * 9;
    let d = module.face.DOWN * 9;
    let u = module.face.UP * 9;
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
module.get_at = function(cube, face, row, col) {
    return cube[face * 3 * 3 + row * 3 + col];
};
// Set the face value at a position
module.set_at = function(cube, face, row, col, value) {
    cube[face * 3 * 3 + row * 3 + col] = value;
}

// Apply a rotation to the cube
module.rotate = function(cube, rotation) {
    const ccw = (rotation < 0);
    const abs_rotation = Math.abs(rotation);
    const data = rotate_data[abs_rotation];
    if (data.face !== null) {
        rotate_face(cube, data.face, ccw);
    }
    const cube_data = data.indices.map(i => cube[i]);

    const offset = ccw ? 9 : 3;
    for (let i = 0; i < 12; i++) {
        cube[data.indices[(i + offset) % 12]] = cube_data[i];
    }
};

// Private functions

// Rotate a face clockwise or counter-clockwise
const rotate_face = function(cube, face, ccw) {
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

return module;
}();
