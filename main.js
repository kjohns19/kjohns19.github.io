import * as rubik from './modules/rubik.js';

const main = () => {
    const cube = rubik.create();
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

    create_grid(cube);
}

const update_grid = (grid) => {
    grid.cube.forEach((value, i) => {
        grid.buttons[i].className = 'cubeButton color' + value;
    });
};

const create_grid = (cube) => {
    const grid = {
        buttons: [],
        cube: cube
    };

    const create_face_table = () => {
        const table = document.createElement('table');
        for (let i = 0; i < 3; i++) {
            const row = table.insertRow();
            for (let j = 0; j < 3; j++) {
                const cell = row.insertCell();
                cell.className = 'cubeCell';
                const button = document.createElement('button');
                button.className = 'cubeButton color0';
                const index = grid.buttons.length;
                grid.buttons.push(button);
                cell.appendChild(button);
                button.addEventListener('click', () => {
                    cube[index] = (cube[index] + 1) % 6;
                    update_grid(grid);
                });
            }
        }
        return table;
    };

    const table = document.createElement('table');
    for (let i = 0; i < 3; i++) {
        const row = table.insertRow();
        for (let j = 0; j < 4; j++) {
            const cell = row.insertCell();
            if (i == 1 || j == 1) {
                const face_table = create_face_table();
                cell.appendChild(face_table);
            }
        }
    }
    document.body.appendChild(table);

    update_grid(grid);
    return grid;
};

main()
