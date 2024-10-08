const main = (() => {
const main = {};

main.main = () => {
    setup_theme();
    const cube = rubik.create();
    const selector = create_selector();
    const grid = create_grid(cube, selector);
    setup_input_area(grid);
    setup_solve_area(grid);
};

const arrows = ["↑", "→", "↓", "←"];

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

const create_selector = () => {
    const selector = {
        color: null,
        orientation: null,
    };

    const create_buttons = (area_name, count) => {
        console.log("Add " + count + " buttons for " + area_name);
        const area = document.getElementById(area_name);
        const table = document.createElement('table');
        const row = table.insertRow();
        const buttons = Array.from({length: count}, () => {
            const cell = row.insertCell();
            cell.className = 'cube cubeCell';
            const button = document.createElement('button');
            button.className = 'cubeButton';
            cell.appendChild(button);
            console.log("Add button");
            return button;
        });
        area.appendChild(table);
        return buttons;
    };

    const color_buttons = create_buttons('color_select_area', rubik.color_names.length);
    color_buttons.forEach((button, idx) => {
        button.title = rubik.color_names[idx] + '\nClick on a cube tile to change its color';
        button.className += ' color' + idx;
    });

    const orientation_buttons = create_buttons('orientation_select_area', 4);
    orientation_buttons.forEach((button, idx) => {
        button.textContent = arrows[idx];
    });

    const deselect_all = () => {
        const deselect = (button) => {
            button.className = button.className.replace(' selected', '');
        };
        color_buttons.forEach(deselect);
        orientation_buttons.forEach(deselect);
        selector.color = null;
        selector.orientation = null;
    };

    const select_color = (idx) => {
        deselect_all();
        color_buttons[idx].className += ' selected';
        selector.color = idx;
    };
    const select_orientation = (idx) => {
        deselect_all();
        orientation_buttons[idx].className += ' selected';
        selector.orientation = idx;
    };

    color_buttons.forEach((button, idx) => {
        button.addEventListener('click', () => {
            select_color(idx);
        });
    });
    orientation_buttons.forEach((button, idx) => {
        button.addEventListener('click', () => {
            select_orientation(idx);
        });
    });

    return selector;
};

const update_grid = (grid) => {
    rubik.for_each(grid.cube, (value, i) => {
        grid.buttons[i].className = 'cubeButton color' + value;
    });
    rubik.get_center_orientations(grid.cube).forEach((value, i) => {
        grid.center_buttons[i].textContent = arrows[value];
    });
};

const create_grid = (cube, selector) => {
    const grid = {
        buttons: [],
        center_buttons: [],
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
                if (i === 1 && j === 1) {
                    grid.center_buttons.push(button);
                }
                cell.appendChild(button);
                button.addEventListener('click', () => {
                    if (selector.color !== null) {
                        rubik.set_at_index(cube, index, selector.color);
                    }
                    update_grid(grid);
                });
                if (i === 1 && j === 1) {
                    button.addEventListener('click', () => {
                        if (selector.orientation !== null) {
                            const face = Math.floor(index / 9);
                            rubik.set_center_orientation(cube, face, selector.orientation);
                        }
                        update_grid(grid);
                    });
                }
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
    for (const rotation_row of create_rotations_grid(true, true)) {
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
};

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
    const center_orientation_input = document.getElementById('center_orientation');
    const solutions_list = document.getElementById('solutions_list');


    const solve_button = document.getElementById('solve_button');
    const stop_button = document.getElementById('stop_button');
    const timer_label = document.getElementById('timer_label');
    const percent_label = document.getElementById('percent_label');
    const estimate_label = document.getElementById('estimate_label');
    const error_label = document.getElementById('error_label');

    const solutions = [];
    const solutions_li = [];

    const time_data = {
        interval: null,
        start: null
    };

    const seconds_to_string = (time_seconds) => {
        const hours = Math.floor(time_seconds / 60 / 60);
        const minutes = Math.floor((time_seconds / 60) % 60);
        const seconds = Math.floor(time_seconds) % 60;
        return [hours, minutes, seconds].map((v) => v < 10 ? '0' + v : v).join(':');
    };

    const on_start = () => {
        solutions_list.innerHTML = '';
        solutions.length = 0;
        solutions_li.length = 0;

        solve_button.disabled = true;
        stop_button.disabled = false;
        timer_label.innerText = '00:00:00';
        percent_label.innerText = '';
        estimate_label.innerText = 'Estimated: ';
        error_label.innerText = '';
        time_data.start = Date.now();
        time_data.interval = setInterval(() => {
            const delta = (Date.now() - time_data.start) / 1000;
            timer_label.innerText = seconds_to_string(delta);
        }, 100);
    };
    const on_finish = () => {
        solve_button.disabled = false;
        stop_button.disabled = true;
        clearInterval(time_data.interval);
        percent_label.innerText = '';
        estimate_label.innerText = '';
        if (solutions.length === 0) {
            const list_item = document.createElement('li');
            list_item.innerText = 'No solutions!'
            solutions_list.appendChild(list_item);
        }
    };
    const on_progress = (count, total) => {
        const percent = count / total * 100;
        const floored = Math.floor(percent);
        percent_label.innerText = floored + '%';

        const delta = (Date.now() - time_data.start) / 1000;
        const estimate = Math.round(100 / percent * delta - delta);
        estimate_label.innerText = 'Estimated: ' + seconds_to_string(estimate);
    };
    const on_solution = (solution) => {
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
        let i;
        for (i = solutions.length; i != 0; i--) {
            const elem = solutions[i - 1];
            if (elem.length <= solution.length) {
                break;
            }
        }
        solutions.splice(i, 0, solution);
        if (solutions_li.length === 0) {
            solutions_list.appendChild(list_item);
        } else {
            solutions_list.insertBefore(list_item, solutions_li[i]);
        }
        solutions_li.splice(i, 0, list_item);
    };

    let worker;
    const recreate_worker = () => {
        worker = new Worker('worker.js');

        worker.addEventListener('error', (message) => {
            error_label.innerHTML = '<strong>AN ERROR OCCURRED</strong>';
            on_finish();
        });
        worker.addEventListener('message', (message) => {
            if (message.data.progress) {
                const progress = message.data.progress;
                on_progress(progress.count, progress.total);
            } else if (message.data.solution) {
                on_solution(message.data.solution);
            } else if (message.data.done) {
                on_finish();
            }
        });
    };
    recreate_worker();

    solve_button.addEventListener('click', () => {
        const allowed_rotations = Object.entries(allowed_rotations_set)
            .filter((a) => a[1])
            .map((a) => parseInt(a[0]));
        const max_moves = max_moves_input.valueAsNumber;
        const check_center_orientation = center_orientation_input.checked;
        worker.postMessage({
            cube: grid.cube,
            allowed_rotations: allowed_rotations,
            max_moves: max_moves,
            check_center_orientation: check_center_orientation,
        });
        on_start();
    });
    stop_button.addEventListener('click', () => {
        worker.terminate();
        recreate_worker();
        on_finish();
    });
};

const create_rotations_grid = (mes, xyz) => {
    const rotations = ['R', 'L', 'F', 'B', 'U', 'D'];
    if (mes) {
        rotations.push('M');
        rotations.push('E');
        rotations.push('S');
    }
    if (xyz) {
        rotations.push('X');
        rotations.push('Y');
        rotations.push('Z');
    }
    const mults = [1, -1, 2];
    return mults.map((mult) => rotations.map((rotation) => rubik.rotation[rotation] * mult));
};

return main;
})();

main.main();
