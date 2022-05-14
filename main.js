import * as rubik from './modules/rubik.js';

const main = () => {
    let cube = rubik.create();
    console.log(rubik.to_string(cube));

    let rotations = Object.keys(rubik.rotation);

    for (const elem of rotations) {
        rubik.rotate(cube, rubik.rotation[elem]);
        console.log(elem);
        console.log(rubik.to_string(cube));
    }

    rotations.reverse();

    for (const elem of rotations) {
        rubik.rotate(cube, -rubik.rotation[elem]);
        console.log('-' + elem);
        console.log(rubik.to_string(cube));
    }
}

main()
