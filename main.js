import * as rubik from './modules/rubik.js';
import * as solver from './modules/solver.js';

const main = () => {
    const cube = rubik.create();
    console.log(rubik.to_string(cube));
    const color_select = create_color_selector();
    const grid = create_grid(cube, color_select);
    setup_input_area(grid);
    setup_solve_area(grid);
}

const create_color_selector = () => {
    const color_select = {
        color: rubik.color.DONT_CARE
    };

    const color_select_area = document.getElementById('color_select_area');
    const table = document.createElement('table');
    const row = table.insertRow();
    const buttons = rubik.color_names.map((name, value) => {
        const cell = row.insertCell();
        cell.className = 'cube cubeCell';
        const button = document.createElement('button');
        button.title = name;
        cell.appendChild(button);
        return button;
    });

    const select = (select_idx) => {
        buttons.forEach((button, idx) => {
            button.className = 'cubeButton color' + idx;
            if (idx === select_idx) {
                button.className += ' selected';
            }
        });
        color_select.color = select_idx;
    };
    buttons.forEach((button, idx) => {
        button.addEventListener('click', () => {
            select(idx);
        });
    });
    select(0);

    color_select_area.appendChild(table);

    return color_select;
};

const update_grid = (grid) => {
    grid.cube.forEach((value, i) => {
        grid.buttons[i].className = 'cubeButton color' + value;
    });
};

const create_grid = (cube, color_select) => {
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
                    cube[index] = color_select.color;
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
    document.getElementById('cube_area').appendChild(table);

    update_grid(grid);
    return grid;
};

const setup_input_area = (grid) => {
    document.getElementById('reset_button').addEventListener('click', () => {
        rubik.reset(grid.cube);
        update_grid(grid);
    });
    document.getElementById('clear_button').addEventListener('click', () => {
        rubik.clear(grid.cube);
        update_grid(grid);
    });
}

const setup_solve_area = (grid) => {
    const table = document.createElement('table');

    const allowed_rotations_set = {};

    const rotations = ['R', 'L', 'F', 'B', 'U', 'D'];
    const mults = [1, -1, 2];
    mults.forEach((mult, i) => {
        const row = table.insertRow();
        rotations.forEach((rotation) => {
            const value = rubik.rotation[rotation] * mult;
            const cell = row.insertCell();
            const div = document.createElement('div');
            const button = document.createElement('input');
            button.type = 'checkbox';
            button.addEventListener('click', () => {
                allowed_rotations_set[value] = button.checked;
            });
            div.appendChild(button);

            const label = document.createElement('label');
            label.innerHTML = rotation;
            if (i === 1) {
                label.innerHTML += '\'';
            } else if (i === 2) {
                label.innerHTML += '2';
            }
            div.appendChild(label);

            cell.appendChild(div);
        })
    });

    document.getElementById('allowed_rotations_area').appendChild(table);

    document.getElementById('solve_button').addEventListener('click', () => {
        console.log('Entries: ' + Object.entries(allowed_rotations_set));
        const allowed_rotations = Object.entries(allowed_rotations_set)
            .filter((a) => a[1])
            .map((a) => parseInt(a[0]));
        console.log('Allowed: ' + allowed_rotations);
        const solution = solver.solve(grid.cube, allowed_rotations);
        if (solution) {
            alert('Solved! ' + rubik.rotations_to_string(solution));
        } else {
            alert('Not solved!');
        }
    });
};

// Currently unused
const setup_rotation_input_area = (grid) => {
    const input = document.getElementById('rotate_input');
    const apply = () => {
        rubik.reset(grid.cube);
        const rotations = rubik.parse_rotations(input.value);
        const rotations_str = rubik.rotations_to_string(rotations);
        for (const rotation of rotations) {
            rubik.rotate(grid.cube, rotation);
        };
        update_grid(grid);
    };
    input.addEventListener('input', apply);

    document.getElementById('rotate_normalize_button').addEventListener('click', () => {
        const rotations = rubik.parse_rotations(input.value);
        const rotations_str = rubik.rotations_to_string(rotations);
        input.value = rotations_str;
    });

    const table = document.createElement('table');
    table.className = 'buttons';
    const rotations = ['R', 'L', 'F', 'B', 'U', 'D', 'M', 'E', 'S', 'X', 'Y', 'Z'];
    const mults = [1, -1, 2];
    mults.forEach((mult, i) => {
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
                if (input.value) {
                    input.value += ' ';
                }
                input.value += button.innerHTML;
                apply();
            });
            cell.appendChild(button);
        })
    });
    document.getElementById('input_area').appendChild(table);
};

main();
