import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Allowed email IDs
const allowedEmails = [
    "padmapriya.r@vit.ac.in",
    "raybanpranav.mahesh2023@vitstudent.ac.in",
    "arye.chauhan2023@vitstudent.ac.in",
    "akshay.mattoo2023@vitstudent.ac.in",
    "sahildinesh.zambre2023@vitstudent.ac.in",
    "atharva.mahesh2022@vitstudent.ac.in"
];

// Check if the current user is authorized
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userEmail = user.email;
        if (!allowedEmails.includes(userEmail)) {
            // If the email is not in the allowed list, log the user out
            alert("You are not authorized to access this page.");
            signOut(auth).then(() => {
                // Redirect the user to login or another page after logging out
                window.location.href = 'https://vitadmin.easycab.site/'; // Modify this URL as needed
            }).catch((error) => {
                console.error("Error signing out: ", error);
            });
        }
    } else {
        // No user is signed in, handle accordingly
        window.location.href = 'https://vitadmin.easycab.site/'; // Redirect to login if no user is authenticated
    }
});

// Show spinner while loading data
document.getElementById("spinner").style.display = "flex";

// Fetch user location data
async function fetchUserLocations() {
    const locationsRef = collection(db, "child_locations");
    const querySnapshot = await getDocs(locationsRef);
    const locationTableBody = document.getElementById("location-table-body"); // Define locationTableBody here

    querySnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        const userId = docSnapshot.id;
        const timestamp = data.timestamp;
        const latitude = data.location.lat;
        const longitude = data.location.lon;

        // Fetch user's name from Firebase
        const userDocRef = doc(db, "users", userId);
        getDoc(userDocRef).then(userDoc => {
            if (userDoc.exists()) {
                const userName = userDoc.data().name || 'Unknown';
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${userName}</td>
                    <td>${latitude}, ${longitude}</td>
                    <td>${timestamp}</td>
                    <td><button onclick="getLocationDetails(${latitude}, ${longitude})">Get Location</button></td>
                `;
                locationTableBody.appendChild(row);
            }
        }).catch(error => {
            console.error("Error fetching user data: ", error);
        });
    });

    // Hide the spinner once data is loaded
    document.getElementById("spinner").style.display = "none";
}

// Make getLocationDetails globally accessible
window.getLocationDetails = async function(lat, lon) {
    const apiKey = '5121470f5b734f968aa3b2894d664a74'; // OpenCage API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted;
            console.log("Address found:", address);

            // Display the address in the popup
            document.getElementById("location-address").textContent = address;
            document.getElementById("location-popup").style.display = "flex";

            // Initialize the map if it's not already initialized
            const map = L.map('map').setView([lat, lon], 13);

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add a marker for the location
            const marker = L.marker([lat, lon]).addTo(map);

            // Set the popup for the marker to show the address
            marker.bindPopup(address).openPopup();
        } else {
            console.log('Location not found.');
            alert("Location not found!");
        }
    } catch (error) {
        console.error('Error fetching location details:', error);
    }
};

// Make closePopup globally accessible
window.closePopup = function() {
    document.getElementById("location-popup").style.display = "none";
};

// Fetch user locations on page load
window.onload = fetchUserLocations;
