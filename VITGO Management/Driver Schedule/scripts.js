import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase Configuration
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

// Fetch drivers and schedule
async function loadDriverSchedule() {
    const scheduleBody = document.getElementById('schedule-body');
    
    try {
        const driversSnapshot = await getDocs(collection(db, 'drivers'));
        driversSnapshot.forEach(async (driverDoc) => {
            const driver = driverDoc.data();
            const driverId = driverDoc.id;
            const scheduleDoc = await getDoc(doc(db, 'driver_schedule', driverId));
            const schedule = scheduleDoc.exists() ? scheduleDoc.data() : {};

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${driver.name}</td>
                <td>${schedule.pickupLocation || 'Not Available'}</td>
                <td>${schedule.dropLocation || 'Not Available'}</td>
                <td>${schedule.rideStatus || 'Not Set'}</td>
                <td>${schedule.paymentStatus || 'Pending'}</td>
            `;
            scheduleBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading driver schedule:", error);
    }
}

// Call the function to load the driver schedule when the page is loaded
window.onload = loadDriverSchedule;
