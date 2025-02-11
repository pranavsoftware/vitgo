import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    databaseURL: "https://easycab-71fcf-default-rtdb.firebaseio.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const bookingsTableBody = document.querySelector("#bookings-table tbody");
const searchBar = document.getElementById("searchBar");
const driverDetailsModal = document.getElementById("driverDetailsModal");
const closeModal = document.getElementById("closeModal");
const driverDetailsForm = document.getElementById("driverDetailsForm");
const notificationPopup = document.getElementById("notificationPopup");

let currentBookingId = null;
let previousBookings = new Set();

// Check if the user is authorized
const checkAuthorization = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const emailDomain = user.email.split("@")[1];
            if (emailDomain !== "emp-easycab.site") {
                console.error("Unauthorized access attempt.");
                window.location.href = "../Login Page/index.html";
            } else {
                fetchBookings();
            }
        } else {
            window.location.href = "../Login Page/index.html";
        }
    });
};

// Fetch bookings and handle notifications
const fetchBookings = () => {
    const bookingsRef = collection(db, "bookings");
    const bookingsQuery = query(bookingsRef, orderBy("date", "desc"));

    onSnapshot(bookingsQuery, (snapshot) => {
        const currentBookings = new Set();
        bookingsTableBody.innerHTML = "";

        snapshot.forEach((doc) => {
            const booking = { id: doc.id, ...doc.data() };
            currentBookings.add(booking.id);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <button class="mark-done" data-id="${booking.id}">
                        ${booking.status === "Done" ? "✔ Done" : "Mark as Done"}
                    </button>
                </td>
                <td>${booking.id}</td>
                <td>${booking.car}</td>
                <td>${booking.noOfStudents}</td>
                <td>${booking.from}</td>
                <td>${booking.to}</td>
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td>${booking.paymentMode}</td>
                <td>${booking.message}</td>
                <td>
                    ${booking.driverName ? ` 
                        <p><strong>Name:</strong> ${booking.driverName}<br>
                        <strong>Phone:</strong> ${booking.driverPhone}</p>` : "No Driver Assigned"}
                    <button class="view-driver" data-id="${booking.id}">View/Edit</button>
                </td>
            `;
            bookingsTableBody.appendChild(row);

            // Notification for new booking (existing logic)
            if (!previousBookings.has(booking.id)) {
                showNotificationPopup(booking.id);
                playNotificationSound();
            }
        });

        addEventListeners();
        previousBookings = currentBookings;
    });
};


// Function to show notification
const showNotificationPopup = (bookingId) => {
    if (notificationPopup) {
        notificationPopup.textContent = `New Booking Received: ${bookingId}`;
        notificationPopup.style.display = "block";
        setTimeout(() => {
            notificationPopup.style.display = "none";
        }, 5000); // Automatically hides after 5 seconds
    } else {
        console.error("Notification popup element not found!");
    }
};

// Add an event listener to handle the click event to play audio
document.addEventListener('click', function () {
    playNotificationSound();
}, { once: true }); // Ensure this event fires only once per page load

// Function to play notification sound
const playNotificationSound = () => {
    const audio = new Audio("../assets/notification.mp3");
    audio.play().catch((error) => {
        console.error("Error playing the audio: ", error);
    });
};


// Show driver details in modal
const showDriverDetails = (bookingId) => {
    currentBookingId = bookingId;
    const bookingRef = doc(db, "bookings", bookingId);

    getDoc(bookingRef)
        .then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const booking = docSnapshot.data();
                document.getElementById("driver").value = booking.driverName || "";
                document.getElementById("cabName").value = booking.cabName || "";
                document.getElementById("taxiNumber").value = booking.taxiNumber || "";
                document.getElementById("phone").value = booking.driverPhone || "";
                document.getElementById("estimatedPickTime").value = booking.estimatedPickTime || "";
                document.getElementById("bookingMessage").textContent = booking.message || "";
                document.getElementById("driverMessage").value = booking.driverMessage || "";
                document.getElementById("amount").value = booking.amount || "";
                driverDetailsModal.style.display = "block";
            }
        })
        .catch((error) => console.error("Error fetching document: ", error));
};

// Mark booking as done
const markBookingAsDone = (bookingId) => {
    const bookingRef = doc(db, "bookings", bookingId);

    getDoc(bookingRef)
        .then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const booking = docSnapshot.data();

                if (!booking.driverName || !booking.driverPhone || !booking.cabName) {
                    alert("Driver details are missing. Cannot mark as done.");
                    return;
                }

                // Update Firestore to mark booking as done
                updateDoc(bookingRef, { status: "Done" })
                    .then(() => {
                        alert(`Booking ${bookingId} marked as done.`);
                        showGreenTick(bookingId); // Update UI immediately
                    })
                    .catch((error) => console.error("Error updating document: ", error));
            } else {
                console.error("Booking not found.");
            }
        })
        .catch((error) => console.error("Error fetching document: ", error));
};

// Show a green tick next to the booking ID
const showGreenTick = (bookingId) => {
    const rows = document.querySelectorAll("#bookings-table tbody tr");
    rows.forEach((row) => {
        const button = row.querySelector(`button[data-id="${bookingId}"]`);
        if (button) {
            button.innerHTML = "✔ Done"; // Change text to "✔ Done"
            button.style.backgroundColor = "green"; // Change background to green
            button.style.color = "white"; // Change text color to white
            button.disabled = true; // Disable button to prevent further clicks
        }
    });
};




// Close the modal
closeModal.onclick = () => {
    driverDetailsModal.style.display = "none";
};

// Handle form submission for driver details
driverDetailsForm.onsubmit = (e) => {
    e.preventDefault();
    const driverDetails = {
        driverName: document.getElementById("driver").value,
        cabName: document.getElementById("cabName").value,
        taxiNumber: document.getElementById("taxiNumber").value,
        driverPhone: document.getElementById("phone").value,
        estimatedPickTime: document.getElementById("estimatedPickTime").value,
        driverMessage: document.getElementById("driverMessage").value
    };

    updateDoc(doc(db, "bookings", currentBookingId), driverDetails)
        .then(() => {
            alert("Driver details updated successfully.");
            driverDetailsModal.style.display = "none";
            fetchBookings();
        })
        .catch((error) => console.error("Error updating driver details: ", error));
};

// Add event listeners to dynamically created elements
const addEventListeners = () => {
    const markDoneButtons = document.querySelectorAll(".mark-done");
    markDoneButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const bookingId = button.getAttribute("data-id");
            markBookingAsDone(bookingId);
        });
    });

    const viewDriverButtons = document.querySelectorAll(".view-driver");
    viewDriverButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const bookingId = button.getAttribute("data-id");
            showDriverDetails(bookingId);
        });
    });
};

// Search for booking by ID
searchBar.addEventListener("input", () => {
    const searchTerm = searchBar.value.toLowerCase();
    const rows = document.querySelectorAll("#bookings-table tbody tr");

    rows.forEach((row) => {
        const bookingId = row.cells[1].textContent.toLowerCase();
        if (bookingId.includes(searchTerm)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});

// Initialize authorization and fetch bookings
checkAuthorization();
