document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/xml") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
            const keybinds = xmlToDict(xmlDoc);
            displayKeybinds(keybinds);
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
                keybinds[actionName] = input;
            }
        }
    }
    return keybinds;
}

function displayKeybinds(keybinds) {
    const output = document.getElementById('output');
    output.innerHTML = '';

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
    output.appendChild(table);
}
