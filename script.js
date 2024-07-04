document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileSelect, false);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const xmlString = event.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

            const devices = {};

            // Iterate over each <options> element in the XML
            const options = xmlDoc.getElementsByTagName('options');
            for (let i = 0; i < options.length; i++) {
                const type = options[i].getAttribute('type');
                const instance = options[i].getAttribute('instance');
                const product = options[i].getAttribute('Product');

                // Ignore keyboard type
                if (type === 'keyboard') {
                    continue;
                }

                // Extract device name without GUID
                const deviceName = product.split('{')[0].trim();

                // Initialize device if not already present
                if (!devices[deviceName]) {
                    devices[deviceName] = {};
                }

                // Iterate over <action> elements under <actionmap>
                const actionmaps = xmlDoc.getElementsByTagName('actionmap');
                for (let j = 0; j < actionmaps.length; j++) {
                    const actionmap = actionmaps[j];
                    const actionmapName = actionmap.getAttribute('name');

                    const actions = actionmap.getElementsByTagName('action');
                    for (let k = 0; k < actions.length; k++) {
                        const action = actions[k];
                        const actionName = action.getAttribute('name');

                        // Check if action already exists for the device
                        if (devices[deviceName][actionName]) {
                            continue; // Skip if action already has an input
                        }

                        const rebinds = action.getElementsByTagName('rebind');
                        let selectedInput = '';
						let inputNumber = '';

                        // Find the first input that isn't 'kb<number>_' prefix
                        for (let l = 0; l < rebinds.length; l++) {
                            let input = rebinds[l].getAttribute('input');

                            // Ignore if input starts with 'kb<number>_'
                            if (input.startsWith('kb')) {
                                continue;
                            }

                            // Remove 'js<number>_' prefix and get device number
                            if (input.startsWith('js')) {
								let index = input.indexOf('_');
								inputNumber = input.substring(index - 1,index);
                                input = input.substring(index + 1).trim();
                            }

                            selectedInput = input;
                            break;
                        }

                        // Skip action if no valid input found
                        if (!selectedInput) {
                            continue;
                        }

                        // Add action and selected input to the correct device's keybinds
						if (instance == inputNumber) {
							devices[deviceName][actionName] = selectedInput;
						}
                    }
                }
            }

            // Display tables for each device
            displayDeviceTables(devices);
        };

        reader.readAsText(file);
    }

    function displayDeviceTables(devices) {
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = ''; // Clear previous content

        // Loop through each device and create a table for its keybinds
        for (const deviceName in devices) {
            if (devices.hasOwnProperty(deviceName)) {
                const keybinds = devices[deviceName];

                // Check if device has any valid keybinds
                if (Object.keys(keybinds).length === 0) {
                    continue; // Skip devices with no valid keybinds
                }

                const table = createTable(deviceName, keybinds);
                outputDiv.appendChild(table);
            }
        }
    }

    function createTable(title, keybinds) {
        const container = document.createElement('div');
        container.className = 'table-container';

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
});
