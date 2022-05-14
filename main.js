import * as rubik from './modules/rubik.js';

const main = () => {
    const cube = rubik.create();
    console.log(rubik.to_string(cube));
    const grid = create_grid(cube);
    create_rotation_buttons(grid);
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
        table.className = 'cube';
        for (let i = 0; i < 3; i++) {
            const row = table.insertRow();
            for (let j = 0; j < 3; j++) {
                const cell = row.insertCell();
                cell.className = 'cube cubeCell';
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
    table.className = 'cube';
    for (let i = 0; i < 3; i++) {
        const row = table.insertRow();
        for (let j = 0; j < 4; j++) {
            const cell = row.insertCell();
            cell.className = 'cube';
            if (i === 1 || j === 1) {
                const face_table = create_face_table();
                cell.appendChild(face_table);
            }
        }
    }
    document.body.appendChild(table);

    update_grid(grid);
    return grid;
};

const create_rotation_buttons = (grid) => {
    const table = document.createElement('table');
    table.className = 'buttons';
    const rotations = ['R', 'L', 'F', 'B', 'U', 'D', 'M', 'E', 'S'];
    for (let i = 0; i < 3; i++) {
        const row = table.insertRow();
        rotations.forEach((rotation) => {
            const cell = row.insertCell();
            const button = document.createElement('button');
            button.className = 'rotation';
            button.innerHTML = rotation;
            if (i === 1) {
                button.innerHTML += '\'';
            } else if (i === 2) {
                button.innerHTML += '2';
            }
            button.addEventListener('click', () => {
                const times = (i === 2) ? 2 : 1;
                const mult = (i === 1) ? -1 : 1;
                for (let j = 0; j < times; j++) {
                    rubik.rotate(grid.cube, mult * rubik.rotation[rotation]);
                }
                update_grid(grid);
            });
            cell.appendChild(button);
        })
    }
    document.body.appendChild(table);
};

main();
