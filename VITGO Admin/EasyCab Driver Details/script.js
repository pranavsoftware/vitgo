// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Your Firebase configuration
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

// Function to fetch and display drivers in a table
async function fetchDrivers() {
    const driverList = document.getElementById("driverList");
    const totalDriversElement = document.getElementById("totalDrivers");
    driverList.innerHTML = '';  // Clear previous data

    // Show spinner while fetching data
    document.getElementById("spinner").classList.add('active');

    try {
        const querySnapshot = await getDocs(collection(db, 'drivers'));
        let totalDrivers = 0; // Counter to track total drivers

        querySnapshot.forEach(docSnapshot => {
            const driver = docSnapshot.data();
            const driverRow = document.createElement('tr');
            driverRow.innerHTML = `
                <td><img src="${driver.picUrl}" alt="Profile Picture" style="width: 50px; height: 50px; border-radius: 50%;"></td>
                <td>${driver.name}</td>
                <td>${driver.email}</td>
                <td>${driver.phone}</td>
                <td>${driver.license}</td>
                <td>${driver.taxiNumber}</td>
                <td>
                    <button class="update-btn" data-driver-id="${docSnapshot.id}">Update</button>
                    <button class="history-btn" data-driver-id="${docSnapshot.id}">Update History</button>
                </td>
            `;
            driverList.appendChild(driverRow);
            totalDrivers++; // Increment the driver count
        });

        // Update the total drivers count
        totalDriversElement.textContent = `Total Drivers: ${totalDrivers}`;

        // Add event listeners to the update buttons
        document.querySelectorAll('.update-btn').forEach(button => {
            button.addEventListener('click', function () {
                const driverId = button.getAttribute('data-driver-id');
                updateDriver(driverId);
            });
        });

        // Add event listeners to the history buttons
        document.querySelectorAll('.history-btn').forEach(button => {
            button.addEventListener('click', function () {
                const driverId = button.getAttribute('data-driver-id');
                showUpdateHistory(driverId);
            });
        });

    } catch (error) {
        console.error("Error fetching drivers: ", error);
    } finally {
        // Hide spinner once data is fetched
        document.getElementById("spinner").classList.remove('active');
    }
}

// Function to open the modal and pre-fill the form
async function updateDriver(driverId) {
    const user = auth.currentUser;
    if (user) {
        const docRef = doc(db, 'drivers', driverId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const driver = docSnap.data();

            // Pre-fill the form with the current driver details
            document.getElementById('name').value = driver.name;
            document.getElementById('email').value = driver.email;
            document.getElementById('phone').value = driver.phone;
            document.getElementById('license').value = driver.license;
            document.getElementById('taxiNumber').value = driver.taxiNumber;
            document.getElementById('address').value = driver.address;

            // Show the modal
            document.getElementById('updateModal').style.display = 'block';

            // Handle form submission
            document.getElementById('updateForm').onsubmit = async (event) => {
                event.preventDefault();

                // Update driver data
                await updateDoc(docRef, {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    license: document.getElementById('license').value,
                    taxiNumber: document.getElementById('taxiNumber').value,
                    address: document.getElementById('address').value,
                    updatedAt: Timestamp.now()
                });

                // Close the modal and reload the driver data
                document.getElementById('updateModal').style.display = 'none';
                fetchDrivers();
            };
        }
    }
}

// Function to show update history
async function showUpdateHistory(driverId) {
    const historyModal = document.getElementById('historyModal');
    const historyPopup = document.getElementById('historyPopup');

    // Fetch history for the driver
    const docRef = doc(db, 'drivers', driverId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const driver = docSnap.data();
        historyPopup.innerHTML = ` 
            <h3>Update History for ${driver.name}</h3>
            <ul>
                <li>Updated At: ${driver.updatedAt ? driver.updatedAt.toDate().toLocaleString() : 'N/A'}</li>
            </ul>
        `;
        historyModal.style.display = 'block';
    }
}

// Close the history modal
document.getElementById('closeHistoryModal').onclick = function () {
    document.getElementById('historyModal').style.display = 'none';
};

// Close the update modal
document.getElementById('closeModal').onclick = function () {
    document.getElementById('updateModal').style.display = 'none';
};

// Allowed email IDs
const allowedEmails = [
    "padmapriya.r@vit.ac.in",
    "raybanpranav.mahesh2023@vitstudent.ac.in",
    "arye.chauhan2023@vitstudent.ac.in",
    "akshay.mattoo2023@vitstudent.ac.in",
    "sahildinesh.zambre2023@vitstudent.ac.in",
    "atharva.mahesh2022@vitstudent.ac.in"
];

// Firebase Authentication listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Check if the user's email is in the allowed emails list
        if (!allowedEmails.includes(user.email)) {
            alert("You do not have access to this page.");
            window.location = 'https://vitadmin.easycab.site/'; // Redirect to login or unauthorized page
            return;
        }

        // Proceed with the rest of the code for authorized users
        fetchDrivers();  // Only call fetchDrivers() here
    } else {
        window.location = 'https://vitadmin.easycab.site/'; // Redirect to login if not authenticated
    }
});
