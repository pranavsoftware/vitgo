// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, getDoc, Timestamp, addDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
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

// Function to fetch and display employees
async function fetchEmployees() {
    const employeeList = document.getElementById("employeeList");
    employeeList.innerHTML = '';  // Clear previous data

    // Show spinner while fetching data
    document.getElementById("spinner").classList.add('active');

    try {
        const querySnapshot = await getDocs(collection(db, 'TAXIemployee'));
        querySnapshot.forEach(docSnapshot => {
            const employee = docSnapshot.data();
            const employeeCard = document.createElement('div');
            employeeCard.classList.add('employee-card');
            employeeCard.innerHTML = `
                <img src="${employee.profilePic}" alt="Profile Picture" style="width: 100px; height: 100px; border-radius: 50%;">
                <p>Name: ${employee.name}</p>
                <p>Email: ${employee.email}</p>
                <p>Phone: ${employee.phone}</p>
                <p>License Number: ${employee.licenseNumber}</p>
                <p>Address: ${employee.address}</p>
                <button class="update-btn" data-employee-id="${docSnapshot.id}">Update</button>
                <button class="history-btn" data-employee-id="${docSnapshot.id}">Update History</button>
            `;
            employeeList.appendChild(employeeCard);
        });

        // Add event listeners to the update buttons
        const updateButtons = document.querySelectorAll('.update-btn');
        updateButtons.forEach(button => {
            button.addEventListener('click', function () {
                const employeeId = button.getAttribute('data-employee-id');
                updateEmployee(employeeId);
            });
        });

        // Add event listeners to the history buttons
        const historyButtons = document.querySelectorAll('.history-btn');
        historyButtons.forEach(button => {
            button.addEventListener('click', function () {
                const employeeId = button.getAttribute('data-employee-id');
                showUpdateHistory(employeeId);
            });
        });

    } catch (error) {
        console.error("Error fetching employees: ", error);
    } finally {
        // Hide spinner once data is fetched
        document.getElementById("spinner").classList.remove('active');
    }
}

// Function to open the modal and pre-fill the form
async function updateEmployee(employeeId) {
    const user = auth.currentUser;
    if (user) {
        const docRef = doc(db, 'TAXIemployee', employeeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const employee = docSnap.data();

            // Pre-fill the form with the current employee details
            document.getElementById('name').value = employee.name;
            document.getElementById('email').value = employee.email;
            document.getElementById('phone').value = employee.phone;
            document.getElementById('license').value = employee.licenseNumber;
            document.getElementById('address').value = employee.address || '';

            // Open the modal
            document.getElementById('updateModal').style.display = 'block';

            // Handle form submission
            document.getElementById('updateForm').onsubmit = async function (e) {
                e.preventDefault();

                // Get updated data from the form
                const updatedEmployee = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    licenseNumber: document.getElementById('license').value,
                    address: document.getElementById('address').value,
                    updatedAt: Timestamp.now()
                };

                try {
                    // Update the employee document in Firestore
                    await updateDoc(docRef, updatedEmployee);

                    // Store update history in sub-collection
                    await addDoc(collection(db, 'TAXIemployee', employeeId, 'updateHistory'), {
                        updatedAt: Timestamp.now(),
                        updatedBy: user.email // Use the authenticated user's email
                    });

                    alert('Employee details updated successfully!');
                    document.getElementById('updateModal').style.display = 'none';
                    fetchEmployees(); // Refresh the employee list
                } catch (error) {
                    console.error("Error updating employee: ", error);
                    alert('Error updating employee details');
                }
            };
        }
    }
}

// Function to show the employee's update history
async function showUpdateHistory(employeeId) {
    const historyModal = document.getElementById('historyModal');
    const historyPopup = document.getElementById('historyPopup');

    // Fetch the update history from Firestore (assuming you have a collection for update history)
    const historyRef = collection(db, 'TAXIemployee', employeeId, 'updateHistory');
    const historySnapshot = await getDocs(historyRef);
    historyPopup.innerHTML = '';  // Clear previous history

    if (historySnapshot.empty) {
        historyPopup.innerHTML = `<p>No update history available.</p>`;
    } else {
        historySnapshot.forEach(doc => {
            const historyData = doc.data();
            const historyEntry = document.createElement('div');
            const updatedAt = historyData.updatedAt.toDate().toLocaleString(); // Format the timestamp
            historyEntry.innerHTML = `
                <p>Updated on: ${updatedAt}</p>
                <p>Updated by: ${historyData.updatedBy}</p>
            `;
            historyPopup.appendChild(historyEntry);
        });
    }

    historyModal.style.display = 'block';
}

// Event listener to close the modal
document.getElementById('closeModal').onclick = function () {
    document.getElementById('updateModal').style.display = 'none';
};

// Event listener to close the history modal
document.getElementById('closeHistoryModal').onclick = function () {
    document.getElementById('historyModal').style.display = 'none';
};

// Call fetchEmployees to populate the dashboard
fetchEmployees();

document.addEventListener("DOMContentLoaded", function () {
    updateTotalEmployeesCount(); // Call the function when the page loads
});

// Function to update the total number of employees
async function updateTotalEmployeesCount() {
    try {
        // Query the employees collection
        const querySnapshot = await getDocs(collection(db, 'TAXIemployee'));
        
        // Get the total number of employees
        const totalEmployees = querySnapshot.size; // The 'size' property gives the count of documents in the snapshot
        
        // Display the total number of employees in the HTML element
        const totalEmployeesElement = document.getElementById('totalEmployees');
        if (totalEmployeesElement) {
            totalEmployeesElement.textContent = `Total Employees: ${totalEmployees}`;
        }
    } catch (error) {
        console.error("Error fetching total employees count: ", error);
        alert("Could not fetch employee count.");
    }
}

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
        fetchDrivers();
    } else {
        window.location = 'https://vitadmin.easycab.site/'; // Redirect to login if not authenticated
    }
});