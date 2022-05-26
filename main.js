import * as rubik from './modules/rubik.js';
import * as solver from './modules/solver.js';

const main = () => {
    setup_theme();
    const cube = rubik.create();
    console.log(rubik.to_string(cube));
    const color_select = create_color_selector();
    const grid = create_grid(cube, color_select);
    setup_input_area(grid);
    setup_solve_area(grid);
}

const setup_theme = () => {
    const theme_button = document.getElementById('theme_button');

    const set_theme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            theme_button.innerText = 'Switch to light mode';
        } else {
            theme_button.innerText = 'Switch to dark mode';
        }
        localStorage.setItem('theme', theme);
    };
    set_theme(
        localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') ||
        'light'
    );

    theme_button.addEventListener('click', () => {
        const current_theme = document.documentElement.getAttribute('data-theme');
        const next_theme = current_theme === 'dark' ? 'light' : 'dark';
        set_theme(next_theme);
    });
};

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
        button.title = name + '\nClick on a cube tile to change its color';
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

    const rotations_input = document.getElementById('input_rotations_text');
    document.getElementById('apply_button').addEventListener('click', () => {
        const rotations = rubik.parse_rotations(rotations_input.value);
        rotations_input.value = rubik.rotations_to_string(rotations);
        for (const rotation of rotations) {
            rubik.rotate(grid.cube, rotation);
        }
        update_grid(grid);
    });

    const table = document.createElement('table');
    table.className = 'buttons';
    for (const rotation_row of create_rotations_grid(true)) {
        const row = table.insertRow();
        for (const rotation of rotation_row) {
            const cell = row.insertCell();
            const button = document.createElement('button');
            button.className = 'rotation';
            button.innerHTML = rubik.rotation_to_string(rotation);
            button.addEventListener('click', () => {
                rubik.rotate(grid.cube, rotation);
                update_grid(grid);
            });
            cell.appendChild(button);
        }
    }
    document.getElementById('input_rotations_area').appendChild(table);
}

const setup_solve_area = (grid) => {
    const table = document.createElement('table');

    const allowed_rotations_set = {};

    const allowed_rotations_data = [];

    const set_all = (value) => {
        for (const data of allowed_rotations_data) {
            data.button.checked = value;
            for (const rotation of data.rotations) {
                allowed_rotations_set[rotation] = value;
            }
        };
    }

    const rotations = ['R', 'L', 'F', 'B', 'U', 'D'];
    for (let i = 0; i < 2; i++) {
        const row = table.insertRow();
        for (const rotation_name of rotations) {
            const cell = row.insertCell();
            const rotation = rubik.rotation[rotation_name];
            const rotations = (i === 0) ? [rotation, -rotation] : [2 * rotation];

            const div = document.createElement('div');
            const button = document.createElement('input');
            button.type = 'checkbox';
            button.addEventListener('click', () => {
                for (const rotation of rotations) {
                    allowed_rotations_set[rotation] = button.checked;
                }
            });
            div.appendChild(button);
            allowed_rotations_data.push({
                button: button,
                rotations: rotations
            });

            const label = document.createElement('label');
            label.innerText = rotations.map(rubik.rotation_to_string).join('/');
            div.appendChild(label);

            cell.appendChild(div);
        }
    }
    document.getElementById('allowed_rotations_area').appendChild(table);

    set_all(true);

    document.getElementById('allow_all_button').addEventListener('click', () => set_all(true));
    document.getElementById('allow_none_button').addEventListener('click', () => set_all(false));

    const max_moves_input = document.getElementById('max_moves');
    const solutions_header = document.getElementById('solutions_header');
    const solutions_list = document.getElementById('solutions_list');


    const solve_button = document.getElementById('solve_button');
    const stop_button = document.getElementById('stop_button');
    const timer_label = document.getElementById('timer_label');

    const time_data = {
        interval: null,
        time: 0
    };

    const start_solve = () => {
        solutions_list.innerHTML = '';
        solutions_header.innerText = '';

        solve_button.disabled = true;
        stop_button.disabled = false;
        timer_label.innerText = '00:00';
        time_data.time = 0;
        time_data.interval = setInterval(() => {
            time_data.time += 1;
            const minutes = Math.floor(time_data.time / 60);
            const seconds = time_data.time % 60;
            timer_label.innerText = [minutes, seconds].map((a) => a < 10 ? '0' + a : a).join(':');
        }, 1000);
    };
    const stop_solve = () => {
        solve_button.disabled = false;
        stop_button.disabled = true;
        clearInterval(time_data.interval);
    };
    const on_solve = (solutions) => {
        for (const solution of solutions) {
            const list_item = document.createElement('li');
            if (solution.length === 0) {
                list_item.innerText = 'Already solved!';
            } else {
                const solution_string = rubik.rotations_to_string(solution);
                const encoded_solution = solution_string.replaceAll('\'', '-').replaceAll(' ', '_');
                const url = 'https://alg.cubing.net/?type=alg&alg=' + encoded_solution;
                const href = 'href="' + url + '" target="_blank" rel="noopener noreferrer"';
                list_item.innerHTML = '<a ' + href + '>' + solution_string + '</a>';
            }
            solutions_list.appendChild(list_item);
        };

        if (solutions.length > 0) {
            solutions_header.innerText = 'Solutions';
        } else {
            solutions_header.innerText = 'No solutions!';
        }
        stop_solve();
    };

    let worker;
    const recreate_worker = () => {
        worker = new Worker('worker.js', {type: 'module'});

        worker.addEventListener('error', (message) => {
            stop_solve();
        });
        worker.addEventListener('message', (message) => {
            on_solve(message.data.solutions);
        });
    };
    recreate_worker();

    solve_button.addEventListener('click', () => {
        const allowed_rotations = Object.entries(allowed_rotations_set)
            .filter((a) => a[1])
            .map((a) => parseInt(a[0]));
        const max_moves = max_moves_input.valueAsNumber;
        worker.postMessage({
            cube: grid.cube,
            allowed_rotations: allowed_rotations,
            max_moves: max_moves
        });
        start_solve();
    });
    stop_button.addEventListener('click', () => {
        worker.terminate();
        recreate_worker();
        stop_solve();
    });
};

const create_rotations_grid = (xyz) => {
    const rotations = ['R', 'L', 'F', 'B', 'U', 'D'];
    if (xyz) {
        rotations.push('X');
        rotations.push('Y');
        rotations.push('Z');
    }
    const mults = [1, -1, 2];
    return mults.map((mult) => rotations.map((rotation) => rubik.rotation[rotation] * mult));
};

main();
