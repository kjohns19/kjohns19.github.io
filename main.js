import { cube } from './modules/cube.js';

let c = cube.create();
console.log(cube.to_string(c));

cube.rotate(c, cube.rotation.F);
console.log(cube.to_string(c));
