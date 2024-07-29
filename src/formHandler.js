import {openDB} from "./popup.js"

addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-port-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevents the default form submission
        submit();
    });
})

async function submit() {
    let db = await openDB()
    const transaction = db.transaction(["pg1"], "readwrite")
    const objectStore = transaction.objectStore("pg1")

    const url = document.getElementById('url').value;
    const portNum = document.getElementById('portNumber').value;
    const portName = document.getElementById('portName').value;
    const desc = document.getElementById('portDescription').value;
    let id = Date.now().toString(16)

    let payload = {
        "id": id,
        "url": url + ":" + portNum,
        "port": portNum,
        "alias": portName,
        "description": desc,
        "bookmarked": false
    }
    
    const req = objectStore.add(payload)

    req.onsuccess = () => {
        console.log("Port added.")
        window.location.href = "popup.html"
    }
    req.onerror = (event) => {
        console.error(`Error inserting data: ${event.target.error}`)
    }
    console.log(payload)
}
