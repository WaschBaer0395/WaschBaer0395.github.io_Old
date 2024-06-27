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
    const bindings = xml.getElementsByTagName('binding');
    for (let i = 0; i < bindings.length; i++) {
        const action = bindings[i].getAttribute('action');
        const key = bindings[i].getAttribute('key');
        keybinds[action] = key;
    }
    return keybinds;
}

function displayKeybinds(keybinds) {
    const output = document.getElementById('output');
    output.innerHTML = '';
    for (const [action, key] of Object.entries(keybinds)) {
        const p = document.createElement('p');
        p.textContent = `${action}: ${key}`;
        output.appendChild(p);
    }
}
