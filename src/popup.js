let favoritesVisible = false
let editContainer = document.getElementById("edit-container")
let creditsContainer = document.getElementById("credits-container")
let saveBtn = document.getElementById("save-btn")
const settingsBtn = document.getElementById("settings-btn")
const uploadBtn = document.getElementById("upload-btn")
const showFavsBtn = document.getElementById("show-favs-btn")
const closeEditsBtn = document.getElementById("close-edits-btn")
const openCreditsBtn = document.getElementById("open-credits-btn")
const closeCreditsBtn = document.getElementById("close-credits-btn")
const deletePortBtn = document.getElementById("deletePortBtn")

addEventListener('DOMContentLoaded', () => {
    retrievePorts()

    if (openCreditsBtn) {
        openCreditsBtn.addEventListener("click", () => {
            creditsContainer.style.display = "block";
        })
    }
    if (closeCreditsBtn) {
        closeCreditsBtn.addEventListener("click", () => {
            creditsContainer.style.display = "none";
        })
    }
    if (closeEditsBtn) {
        closeEditsBtn.addEventListener("click", () => {
            editContainer.style.display = "none";
        })
    }
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
        showFavsBtn.addEventListener("click", () => {
            if (favoritesVisible) {
                favoritesVisible = false
                window.location.reload()
            } else {
                favoritesVisible = true
                showFavorites()
            }
        });
    }
});


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
    let portContainer = document.getElementById("port-container")
    if (portContainer) {
        while (portContainer.firstChild) {
            portContainer.removeChild(portContainer.firstChild) 
        }
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

        let portDesc = document.createElement("p")
        portDesc.innerHTML = port.description

        nameContainer.appendChild(portName)
        nameContainer.appendChild(portNumber)
        nameContainer.appendChild(portDesc)

        let btnContainer = document.createElement("div")
        btnContainer.className = "flex items-center justify-between gap-4 border-t-2 border-black"
        if (port.bookmarked) {
            btnContainer.appendChild(createBtn("./assets/icons/star-selected.png", "Bookmark", port))
        } else {
            btnContainer.appendChild(createBtn("./assets/icons/star.png", "Bookmark", port))
        }
        btnContainer.appendChild(createBtn("./assets/icons/play.png", "Go", port))
        btnContainer.appendChild(createBtn("./assets/icons/edit.png", "Edit", port))

        container.appendChild(nameContainer)
        container.appendChild(btnContainer)

        if (portContainer) {
            portContainer.appendChild(container)
        }
    } 
}

function createBtn (path, alt, port) {
    const button = document.createElement('button');
    button.className = 'p-4';
    button.id = alt + "-" + port.id
    
    if (alt === "Bookmark") {
        button.addEventListener("click", async () => {
            let db = await openDB()
            let transaction = db.transaction(["pg1"], "readwrite").objectStore("pg1")

            if (port.bookmarked) {
                let req = transaction.get(port.id)
                req.onsuccess = (event) => {
                    let payload = event.target.result
                    payload.bookmarked = false

                    let update = transaction.put(payload)
                    update.onsuccess = (event) => {
                        document.getElementById(alt + "-" + port.id).src = "./assets/icons/star.png"
                        window.location.reload()
                        console.log(event.target.result)
                    }
                }
            } else {
                let req = transaction.get(port.id)

                req.onsuccess = (event) => {
                    let payload = event.target.result
                    payload.bookmarked = true

                    let update = transaction.put(payload)
                    update.onsuccess = (event) => {
                        document.getElementById(alt + "-" + port.id).src = "./assets/icons/star-selected.png"
                        window.location.reload()
                    }
                }

                req.onerror = (event) => {
                    console.error(event.target.result)
                }
            }
        })
    }

    if (alt === "Go") {
        button.addEventListener("click", () => {
            window.open(port.url, "_blank").focus() 
        })
    }
    
    if (alt === "Edit") {
        button.addEventListener("click", () => {
            let editorContainer = document.getElementById("edit-container")
            editorContainer.style.display = "block";
            document.getElementById('edit-url').value = port.address
            document.getElementById('edit-portNumber').value = port.port
            document.getElementById('edit-portName').value = port.alias
            document.getElementById('edit-portDescription').value = port.description

            const form = document.getElementById('edit-port-form');
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                updatePort(port.id);
            });
            deletePortBtn.addEventListener("click", () => {
                removePort(port.id)
            })
        })
    }

    const img = document.createElement('img');
    img.src = path;
    img.alt = alt;
    img.height = 24;
    img.width = 24;

    button.appendChild(img);
    return button;
}

async function updatePort(id) {
        let editUrl = document.getElementById('edit-url').value
        let editPortNum = document.getElementById('edit-portNumber').value
        let editPortName = document.getElementById('edit-portName').value
        let editDesc = document.getElementById('edit-portDescription').value

        let db = await openDB()
        let transaction = db.transaction(["pg1"], "readwrite").objectStore("pg1")

        let req = transaction.get(id)
        req.onsuccess = (event) => {
            
            let payload = event.target.result

            payload.address = editUrl
            payload.url = editUrl + ":" + editPortNum
            payload.port = editPortNum
            payload.alias = editPortName
            payload.description = editDesc

            let update = transaction.put(payload)
            update.onsuccess = (event) => {
                window.location.reload()
            }

            update.onerror = (event) => {
                console.error(event.target.result);
            }
        }
}

async function removePort(id) {
    let db = await openDB()
    let transaction = db.transaction(["pg1"], "readwrite").objectStore("pg1")

    let req = transaction.delete(id)
    req.onsuccess = () => {
        window.location.reload()
    }
}

async function showFavorites() {
    let db = await openDB()
    let transaction = db.transaction(["pg1"], "readonly").objectStore("pg1")

    let req = transaction.getAll()

    let bookmarks = []
    req.onsuccess = (event) => {
        for (let port of event.target.result) {
            if (port.bookmarked === true) {
                bookmarks.push(port)
            }
        }
        let favsBtn = document.getElementById("show-favs-btn")
        favsBtn.innerHTML = `<img src="./assets/icons/star.png" alt="Star icon" height="24" width="24">Show All`
        populate(bookmarks)
    }
    
    req.onerror = (event) => {
        console.error(event.target.result)
    }
}

function uploadBackup() {
    console.log("upload backup")
}

async function save() {
    let db = await openDB()
    const transaction = db.transaction(["pg1"], "readonly");
    const objectStore = transaction.objectStore("pg1");

    let req = objectStore.getAll()

    req.onsuccess = (event) => {
        let data = JSON.stringify(event.target.result)
        let date = Date.now().toString(16)
        saveBtn.download = date + "-PortGoDB.json"
        const blob = new Blob([data], { type: "application/json" });
        saveBtn.href = URL.createObjectURL(blob)
    }
}

export default {openDB}
