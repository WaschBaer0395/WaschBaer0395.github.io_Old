document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/xml") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
            const keybinds = xmlToDict(xmlDoc);
            const productNames = getProductNames(xmlDoc);
            displayKeybinds(keybinds, productNames);
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a valid XML file.');
    }
});

function xmlToDict(xml) {
    const keybinds = {};
    const actionMaps = xml.getElementsByTagName('actionmap');
    for (let i = 0; i < actionMaps.length; i++) {
        const actions = actionMaps[i].getElementsByTagName('action');
        for (let j = 0; j < actions.length; j++) {
            const actionName = actions[j].getAttribute('name');
            const rebinds = actions[j].getElementsByTagName('rebind');
            for (let k = 0; k < rebinds.length; k++) {
                const input = rebinds[k].getAttribute('input');
                const match = input.match(/^js\d+_(\S+)/);
                if (match) {
                    const deviceKey = match[0].split('_')[0]; // e.g., 'js1'
                    if (!keybinds[deviceKey]) {
                        keybinds[deviceKey] = {};
                    }
                    keybinds[deviceKey][actionName] = input;
                }
            }
        }
    }
    return keybinds;
}

function getProductNames(xml) {
    const products = {};
    const options = xml.getElementsByTagName('options');
    for (let i = 0; i < options.length; i++) {
        const type = options[i].getAttribute('type');
        const instance = options[i].getAttribute('instance');
        const product = options[i].getAttribute('Product');
        if (type === 'joystick') {
            products[`js${instance}`] = product.replace(/\s*{[^}]+}\s*$/, '').trim();
        }
    }
    return products;
}

function displayKeybinds(keybinds, productNames) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    let tableIndex = 1;
    for (const [jsKey, keybind] of Object.entries(keybinds)) {
        const title = productNames[jsKey] || `Joystick ${jsKey.slice(2)}`;
        output.appendChild(createTable(`table-${tableIndex}`, title, keybind));
        tableIndex++;
    }
}

function createTable(id, title, keybinds) {
    const container = document.createElement('div');
    container.className = 'table-container';
    container.id = id; // Assign the unique ID

    const tableTitle = document.createElement('h2');
    tableTitle.textContent = title;
    container.appendChild(tableTitle);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    const keyHeader = document.createElement('th');
    const valueHeader = document.createElement('th');

    keyHeader.textContent = 'Key';
    valueHeader.textContent = 'Value';

    headerRow.appendChild(keyHeader);
    headerRow.appendChild(valueHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    for (const [action, input] of Object.entries(keybinds)) {
        const row = document.createElement('tr');
        const keyCell = document.createElement('td');
        const valueCell = document.createElement('td');

        keyCell.textContent = action;
        valueCell.textContent = input;

        row.appendChild(keyCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    container.appendChild(table);

    return container;
}
