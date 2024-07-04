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

			// Create device object
            const devices = {};

			/*
            * Iterate over each <options> element in the XML
			* They contain the device names and their corresponding index 
			*/
            const options = xmlDoc.getElementsByTagName('options');
            for (let i = 0; i < options.length; i++) {
                const type = options[i].getAttribute('type');
                const instance = options[i].getAttribute('instance');
                const product = options[i].getAttribute('Product');

                // Ignore keyboard or mouse type - we might change this for a more sophisticated approach
                if (type === 'keyboard' || type === 'mouse') {
                    continue;
                }

                // Extract device name without GUID
                const deviceName = product.split('{')[0].trim();

                // Initialize device if not already present
                if (!devices[deviceName]) {
                    devices[deviceName] = {};
					devices[deviceName].actions = {};
					devices[deviceName].index = instance;
                }

                // Iterate over <action> elements under <actionmap>
                const actionmaps = xmlDoc.getElementsByTagName('actionmap');
                for (let j = 0; j < actionmaps.length; j++) {
                    const actionmap = actionmaps[j];
                    const actionmapName = actionmap.getAttribute('name');

                    const actions = actionmap.getElementsByTagName('action');
                    for (let k = 0; k < actions.length; k++) {
                        const action = actions[k];
                        const actionId = action.getAttribute('name');
						
                        // Check if action already exists for the device
                        if (devices[deviceName].actions[actionId]) {
                            continue; // Skip if action already has an input
                        }

                        const rebinds = action.getElementsByTagName('rebind');
                        let selectedInput = '';
						let inputNumber = '';
						let mode;
						let tapCount;

                        // Find the first input that isn't 'kb<number>_' prefix
                        for (let l = 0; l < rebinds.length; l++) {
							
							// read input and chack for activationMode and tapCount
                            let input = rebinds[l].getAttribute('input');
							mode = rebinds[l].getAttribute('activationMode');
							tapCount = rebinds[l].getAttribute('multiTap');

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
							devices[deviceName].actions[actionId] = {};
							devices[deviceName].actions[actionId].inputId = selectedInput;
							devices[deviceName].actions[actionId].inputName = capitalizeWords(selectedInput.replaceAll("_"," "));
							// Check if mode exists for the action and add the mode
							if (mode) {
								devices[deviceName].actions[actionId].mode = mode;
								devices[deviceName].actions[actionId].modeName = capitalizeWords(mode.replaceAll("_"," "));
							}
							if (tapCount) {
								devices[deviceName].actions[actionId].mode = 'multiTap'
								devices[deviceName].actions[actionId].tapCount = tapCount
								devices[deviceName].actions[actionId].modeName = capitalizeWords('multiTap').concat(" (",tapCount,")");
							}
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

        // Loop through each device and create a table for its keybinded actions
        for (const deviceName in devices) {
            if (devices.hasOwnProperty(deviceName)) {
				const actions = devices[deviceName].actions;
				
                // Check if device has any valid keybinds
                if (Object.keys(actions).length === 0) {
                    continue; // Skip devices with no valid actions
                }
				
				const title = deviceName.concat(" (",devices[deviceName].index,")")
                const table = createTable(title, actions);
                outputDiv.appendChild(table);
            }
        }
    }

    function createTable(title, actions) {
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
		const modHeader = document.createElement('th');

        keyHeader.textContent = 'Key';
        valueHeader.textContent = 'Value';
		modHeader.textContent = 'Modifier';

        headerRow.appendChild(keyHeader);
        headerRow.appendChild(valueHeader);
		headerRow.appendChild(modHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        for (const [action, input] of Object.entries(actions)) {
            const row = document.createElement('tr');
            const keyCell = document.createElement('td');
            const valueCell = document.createElement('td');
			const modCell = document.createElement('td');

            keyCell.textContent = translate(action);
            valueCell.textContent = input.inputName;
			modCell.textContent = input.modeName;

            row.appendChild(keyCell);
            row.appendChild(valueCell);
			row.appendChild(modCell);
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        container.appendChild(table);

        return container;
    }
	
	
	// Placeholder function that should translate the english id to the corresponding english/german/etc. word
	function translate(id) {
		id = id.replace("v_","").replaceAll("_"," ");
		return capitalizeWords(id);
	}
	
	// function to capitalize a whole sentence (fo
	function capitalizeWords(sentence) {
		words = sentence.split(" ")
		for (let i = 0; i < words.length; i++) {
			words[i] = capitalize(words[i])
		}
		return words.join(" ");
	}
	
	function capitalize(word) {
		return word[0].toUpperCase() + word.substr(1);
	}
	
});
