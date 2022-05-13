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
    X: 10,
    Y: 11,
    Z: 12,
};

// Private constants

const off = {
    u: module.face.UP * 9,
    l: module.face.LEFT * 9,
    f: module.face.FRONT * 9,
    r: module.face.RIGHT * 9,
    b: module.face.BACK * 9,
    d: module.face.DOWN * 9,
}

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
    // F => indices  0- 8
    // B => indices  9-17
    // R => indices 18-26
    // L => indices 27-35
    // D => indices 36-44
    // U => indices 45-53
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
    const rotation_funcs = [
        rotate_f,
        rotate_b,
        rotate_r,
        rotate_l,
        rotate_d,
        rotate_u,
        rotate_m,
        rotate_e,
        rotate_s,
        rotate_x,
        rotate_y,
        rotate_z,
    ]
    rotation_funcs[abs_rotation - 1](cube, ccw);
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

// Rotate the front of a cube
const rotate_f = function(cube, ccw) {
    rotate_face(cube, module.face.FRONT, ccw)
    let save = [
        cube[off.u + 6],
        cube[off.u + 7],
        cube[off.u + 8]
    ];
    if (ccw) {
        cube[off.u + 6] = cube[off.r + 0];
        cube[off.u + 7] = cube[off.r + 3];
        cube[off.u + 8] = cube[off.r + 6];
        cube[off.r + 0] = cube[off.d + 2];
        cube[off.r + 3] = cube[off.d + 1];
        cube[off.r + 6] = cube[off.d + 0];
        cube[off.d + 2] = cube[off.l + 8];
        cube[off.d + 1] = cube[off.l + 5];
        cube[off.d + 0] = cube[off.l + 2];
        cube[off.l + 8] = save[0];
        cube[off.l + 5] = save[1];
        cube[off.l + 3] = save[2];
    } else {
        cube[off.u + 6] = cube[off.l + 8];
        cube[off.u + 7] = cube[off.l + 5];
        cube[off.u + 8] = cube[off.l + 2];
        cube[off.l + 8] = cube[off.d + 2];
        cube[off.l + 5] = cube[off.d + 1];
        cube[off.l + 2] = cube[off.d + 0];
        cube[off.d + 2] = cube[off.r + 0];
        cube[off.d + 1] = cube[off.r + 3];
        cube[off.d + 0] = cube[off.r + 6];
        cube[off.r + 0] = save[0];
        cube[off.r + 3] = save[1];
        cube[off.r + 6] = save[2];
    }
};
const rotate_b = function(cube, ccw) {
    rotate_face(cube, module.face.BACK, ccw)
};
const rotate_r = function(cube, ccw) {
    rotate_face(cube, module.face.RIGHT, ccw)
    let save = [
        cube[off.u + 8],
        cube[off.u + 5],
        cube[off.u + 2],
    ];
    if (ccw) {
        cube[off.u + 8] = cube[off.b + 0];
        cube[off.u + 5] = cube[off.b + 3];
        cube[off.u + 2] = cube[off.b + 6];

        cube[off.b + 0] = cube[off.d + 8];
        cube[off.b + 3] = cube[off.d + 5];
        cube[off.b + 6] = cube[off.d + 2];

        cube[off.d + 8] = cube[off.f + 8];
        cube[off.d + 5] = cube[off.f + 5];
        cube[off.d + 2] = cube[off.f + 2];

        cube[off.f + 8] = save[0];
        cube[off.f + 5] = save[1];
        cube[off.f + 2] = save[2];
    } else {
        cube[off.u + 8] = cube[off.f + 8];
        cube[off.u + 5] = cube[off.f + 5];
        cube[off.u + 2] = cube[off.f + 2];

        cube[off.f + 8] = cube[off.d + 8];
        cube[off.f + 5] = cube[off.d + 5];
        cube[off.f + 2] = cube[off.d + 2];

        cube[off.d + 8] = cube[off.b + 0];
        cube[off.d + 5] = cube[off.b + 3];
        cube[off.d + 2] = cube[off.b + 6];

        cube[off.b + 0] = save[0];
        cube[off.b + 3] = save[1];
        cube[off.b + 6] = save[2];
    }
};
const rotate_l = function(cube, ccw) {
    rotate_face(cube, module.face.LEFT, ccw)
};
const rotate_d = function(cube, ccw) {
    rotate_face(cube, module.face.DOWN, ccw)
};
const rotate_u = function(cube, ccw) {
    rotate_face(cube, module.face.UP, ccw)
};
const rotate_m = function(cube, ccw) {
    // TODO
};
const rotate_e = function(cube, ccw) {
    // TODO
};
const rotate_s = function(cube, ccw) {
    // TODO
};
const rotate_x = function(cube, ccw) {
    // TODO
};
const rotate_y = function(cube, ccw) {
    // TODO
};
const rotate_z = function(cube, ccw) {
    // TODO
};

return module;
}();
