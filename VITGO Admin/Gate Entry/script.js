// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// List of allowed email addresses
const allowedEmails = [
    "padmapriya.r@vit.ac.in",
    "raybanpranav.mahesh2023@vitstudent.ac.in",
    "arye.chauhan2023@vitstudent.ac.in",
    "akshay.mattoo2023@vitstudent.ac.in",
    "sahildinesh.zambre2023@vitstudent.ac.in",
    "atharva.mahesh2022@vitstudent.ac.in"
];

// Check if the user's email is in the allowed list
const checkUserEmail = (user) => {
    if (!allowedEmails.includes(user.email)) {
        // Redirect to login page if email is not allowed
        window.location.href = "https://vitadmin.easycab.site/"; // Replace with the actual login page URL
    }
};

// Firebase Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Check if the email is allowed
        checkUserEmail(user);
    } else {
        // Redirect to login page if not logged in
        window.location.href = "https://vitadmin.easycab.site/";
    }
});

// References to HTML elements
const dateSearch = document.getElementById('dateSearch');
const driverLogsTable = document.getElementById('driverLogs').getElementsByTagName('tbody')[0];

// Helper function to convert date and time into a sortable string
const convertToSortableDateTime = (date, time) => {
    const [day, month, year] = date.split('/').map(num => parseInt(num, 10));
    const [hours, minutes, seconds] = time.split(':').map(num => parseInt(num, 10));

    return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
};

// Fetch and display data in real-time
const fetchDriverLogs = () => {
    const cabinRef = collection(db, 'Cabin');
    const driversRef = collection(db, 'drivers');

    try {
        // Set up a listener to detect real-time updates in the 'Cabin' collection
        onSnapshot(cabinRef, (cabinSnapshot) => {
            // To collect driver data in real-time
            const driversData = {};
            onSnapshot(driversRef, (driversSnapshot) => {
                driversSnapshot.forEach(doc => {
                    driversData[doc.id] = doc.data();
                });

                // Array to store all logs
                let allLogs = [];

                // Iterate through each Cabin document to get the logs
                cabinSnapshot.docs.forEach(cabinDoc => {
                    const logsRef = collection(db, `Cabin/${cabinDoc.id}/logs`);
                    onSnapshot(logsRef, (logsSnapshot) => {
                        logsSnapshot.forEach(logDoc => {
                            const log = logDoc.data();
                            log.driver = driversData[log.uid] || {}; // Attach driver data
                            allLogs.push(log); // Add log to the array
                        });

                        // Sort logs by current date-time first, then past
                        allLogs.sort((a, b) => {
                            const aDateTime = convertToSortableDateTime(a.date, a.time);
                            const bDateTime = convertToSortableDateTime(b.date, b.time);
                            return bDateTime - aDateTime; // Sort descending, current date-time first
                        });

                        // Store logs in global variable for search
                        window.driverLogs = allLogs;

                        // Display logs in the table
                        displayLogs(allLogs);
                    });
                });
            });
        });
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

// Function to display logs in the table
const displayLogs = (logs) => {
    // Clear the table
    driverLogsTable.innerHTML = '';

    // Display logs in the table
    logs.forEach(log => {
        const row = document.createElement('tr');
        
        // Display data in table row
        row.innerHTML = `
            <td>${log.driver.name || 'Unknown'}</td>
            <td>${log.driver.taxiNumber || 'N/A'}</td>
            <td>${log.date}</td>
            <td>${log.time}</td>
            <td>${log.status}</td>
        `;
        driverLogsTable.appendChild(row);
    });
};

// Apply date search
const applyDateSearch = () => {
    const date = dateSearch.value;

    // If there's no date selected, show all logs
    if (!date) {
        displayLogs(window.driverLogs);
        return;
    }

    // Filter logs based on selected date
    const filteredLogs = window.driverLogs.filter(log => {
        // Convert log.date (Firebase date) to 'yyyy-mm-dd' format
        const logDate = log.date.split('/').reverse().join('-'); // If the date is in dd/mm/yyyy format

        return logDate === date;
    });

    // Display filtered logs
    displayLogs(filteredLogs);
};

// Event Listener for Date Search
dateSearch.addEventListener('change', applyDateSearch);

// Initial data load
fetchDriverLogs();
