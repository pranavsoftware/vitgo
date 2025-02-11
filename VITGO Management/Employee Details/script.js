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

const employeeDetailsElement = document.getElementById('employee-details');

// Fetch employee data from Firestore
const fetchEmployeeDetails = async () => {
    const employeeRef = collection(db, "TAXIemployee");
    onSnapshot(employeeRef, (snapshot) => {
        employeeDetailsElement.innerHTML = ""; // Clear the table before inserting new data

        snapshot.forEach((doc) => {
            const employee = doc.data();

            // Create a new row for each employee
            const row = document.createElement("tr");

            // Add cells with employee data
            row.innerHTML = `
            <td><img src="${employee.profilePic}" alt="${employee.name}'s Profile Picture" width="50"></td>
                <td>${employee.name}</td>
                <td>${employee.age}</td>
                <td>${employee.email}</td>
                <td>${employee.licenceNumber}</td>
                <td>${employee.address}</td>
            `;

            // Append the row to the table body
            employeeDetailsElement.appendChild(row);
        });
    });
};

// Call the function to fetch and display data
fetchEmployeeDetails();

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
