// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    databaseURL: "https://easycab-71fcf-default-rtdb.firebaseio.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to get driver name from drivers collection
async function getDriverName(uid) {
    const docRef = doc(db, "drivers", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().name;
    } else {
        console.log("No such document!");
        return "Unknown";
    }
}

// Function to get all driver locations
async function loadDriverLocations() {
    const snapshot = await getDocs(collection(db, "driver location"));
    const driverTableBody = document.getElementById("driverTableBody");

    snapshot.forEach(async (doc) => {
        const data = doc.data();
        const driverName = await getDriverName(data.uid);  // Wait for the driver name
        const lat = data.latitude;
        const lon = data.longitude;

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = driverName;
        row.appendChild(nameCell);

        const latCell = document.createElement("td");
        latCell.textContent = lat;
        row.appendChild(latCell);

        const lonCell = document.createElement("td");
        lonCell.textContent = lon;
        row.appendChild(lonCell);

        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "View Details";
        button.onclick = () => openPopup(driverName, lat, lon);
        actionCell.appendChild(button);
        row.appendChild(actionCell);

        driverTableBody.appendChild(row);
    });
}

// Function to open the popup
function openPopup(name, lat, lon) {
    const popupDetails = document.getElementById("popupDetails");
    popupDetails.innerHTML = `<p>Name: ${name}</p><p>Latitude: ${lat}</p><p>Longitude: ${lon}</p><p>Location: <span id="location"></span></p>`;

    const apiKey = '5121470f5b734f968aa3b2894d664a74'; // OpenCage API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results[0]) {
                document.getElementById("location").textContent = data.results[0].formatted;
            }
        })
        .catch(error => {
            console.error('Error fetching location:', error);
        });

    document.getElementById("popupModal").style.display = "block";
}

// Exposing closePopup function to the global scope so it can be accessed in HTML
window.closePopup = function() {
    const popupModal = document.getElementById("popupModal");
    if (popupModal) {
        popupModal.style.display = "none";
    }
}

// Load the driver locations when the page loads
window.onload = loadDriverLocations;
