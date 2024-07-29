export async function openDB() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("portGoDB");

        request.onerror = (event) => {
            reject(`Error opening database: ${event.target.errorCode}`);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            const objectStore = db.createObjectStore("pg1", {keyPath: "id", autoIncrement: true},)
            objectStore.createIndex("id", "id", {unique: false})
        }
    });
};

async function retrievePorts() {
    let db = await openDB()
    const transaction = db.transaction(["pg1"], "readonly");
    const objectStore = transaction.objectStore("pg1");

    let req = objectStore.getAll()

    req.onsuccess = (event) => {
        populate(event.target.result)
    }

    req.onerror = (event) => {
        console.error(`Error listing data: ${event.target.error}`);
    }
}

function populate(ports) {
    const createBtn = (path, alt, id) => {
        const button = document.createElement('button');
        button.className = 'p-4';
        button.id = id

        const img = document.createElement('img');
        img.src = path;
        img.alt = alt;
        img.height = 24;
        img.width = 24;

        button.appendChild(img);
        return button;
    }

    for (let port of ports) {
        let container = document.createElement("div")
        container.className = "flex flex-col border-2 rounded-lg border-black"

        let nameContainer = document.createElement("div")
        nameContainer.className = "p-4"

        let portName = document.createElement("h2")
        portName.innerHTML = port.alias

        let portNumber = document.createElement("span")
        portNumber.innerHTML = port.port
        portNumber.className = "text-3xl text-center"

        nameContainer.appendChild(portName)
        nameContainer.appendChild(portNumber)

        let btnContainer = document.createElement("div")
        btnContainer.className = "flex items-center justify-between gap-4 border-t-2 border-black"
        btnContainer.appendChild(createBtn("./assets/icons/star.png", "Bookmark", "bookmark-" + port.id))
        btnContainer.appendChild(createBtn("./assets/icons/play.png", "Go", "go-" + port.id))
        btnContainer.appendChild(createBtn("./assets/icons/edit.png", "Edit", "edit-" + port.id))

        container.appendChild(nameContainer)
        container.appendChild(btnContainer)

        document.getElementById("port-container").appendChild(container)
    } 

}

function showSettings() {
    console.log("show settings")
}

function showFavorites() {
    console.log("show favs")
}

function uploadBackup() {
    console.log("upload backup")
}

function save() {
    console.log("save")
}

addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById("settings-btn");
    const saveBtn = document.getElementById("save-btn");
    const uploadBtn = document.getElementById("upload-btn");
    const showFavsBtn = document.getElementById("show-favs-btn");
    retrievePorts()

    if (settingsBtn) {
        settingsBtn.addEventListener("click", showSettings);
    }
    if (saveBtn) {
        saveBtn.addEventListener("click", save);
    }
    if (uploadBtn) {
        uploadBtn.addEventListener("click", uploadBackup);
    }
    if (showFavsBtn) {
        showFavsBtn.addEventListener("click", showFavorites);
    }
});

export default {openDB}
