import * as cube from './modules/cube.js';

const main = () => {
    let c = cube.create();
    console.log(cube.to_string(c));

    let rotations = Object.keys(cube.rotation);

    for (const elem of rotations) {
        cube.rotate(c, cube.rotation[elem]);
        console.log(elem);
        console.log(cube.to_string(c));
    }

    rotations.reverse();

    for (const elem of rotations) {
        cube.rotate(c, -cube.rotation[elem]);
        console.log('-' + elem);
        console.log(cube.to_string(c));
    }
}

main()
