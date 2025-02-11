// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const driverDetailsElement = document.getElementById('driver-details');

// Fetch driver data from Firestore
const fetchDriverDetails = async () => {
    const driverRef = collection(db, "drivers");
    onSnapshot(driverRef, (snapshot) => {
        driverDetailsElement.innerHTML = ""; // Clear the table before inserting new data

        snapshot.forEach((doc) => {
            const driver = doc.data();

            // Create a new row for each driver
            const row = document.createElement("tr");

            // Add cells with driver data
            row.innerHTML = `
            <td><img src="${driver.picUrl}" alt="${driver.name}'s Profile Picture" width="50"></td>
                <td>${driver.name}</td>
                <td>${driver.phone}</td>
                <td>${driver.email}</td>
                <td>${driver.license}</td>
                <td>${driver.taxiNumber}</td>
                <td>${driver.address}</td>
            `;

            // Append the row to the table body
            driverDetailsElement.appendChild(row);
        });
    });
};

// Call the function to fetch and display data
fetchDriverDetails();

// Check if the user is authorized
const checkAuthorization = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Verify email domain
            const emailDomain = user.email.split("@")[1];
            if (emailDomain !== "emp-easycab.site") {
                console.error("Unauthorized access attempt.");
                window.location.href = "../Login Page/index.html";
            } else {
                fetchBookings(); // Fetch bookings only if authorized
            }
        } else {
            // Redirect to login if no user is authenticated
            window.location.href = "../Login Page/index.html";
        }
    });
};

// Initialize authorization check
checkAuthorization();
