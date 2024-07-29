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
    // get all from db
    console.log("get all ports");
}

function populate() {
    console.log("add all ports");
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
