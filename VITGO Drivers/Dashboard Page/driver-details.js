import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

// Get the driver ID from the URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const driverId = urlParams.get('uid'); // Ensure this matches the parameter used in the QR code

console.log("Driver ID (UID): ", driverId); // Log to check if the ID is correctly passed

// Fetch driver details from Firestore
if (driverId) {
    const docRef = doc(db, "drivers", driverId);
    getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
            const driverData = docSnap.data();

            // Populate the driver details on the page
            document.getElementById('driverName').textContent = driverData.name;
            document.getElementById('driverEmail').textContent = driverData.email;
            document.getElementById('driverPhone').textContent = driverData.phone;
            document.getElementById('driverLicense').textContent = driverData.license;
            document.getElementById('taxiNumber').textContent = driverData.taxiNumber;
            document.getElementById('driverAddress').textContent = driverData.address;
            document.getElementById('driverPic').src = driverData.picUrl;
        } else {
            console.log("No such driver found!");
            // Optionally show an error message to the user
        }
    }).catch((error) => {
        console.error("Error fetching driver data: ", error);
        // Optionally show an error message to the user
    });
} else {
    console.log("No driver ID provided in the URL.");
}
