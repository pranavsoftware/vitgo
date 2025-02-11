import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, getDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
const auth = getAuth(app);

// Load username and fetch active booking
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('username').innerText = user.displayName || user.email;
        await fetchCurrentBooking(user.uid);
    } else {
        window.location.href = '/VITian/index.html';
    }
});

// Function to fetch the latest booking for a user
async function fetchCurrentBooking(userId) {
    try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        let latestBooking = null;

        querySnapshot.forEach((doc) => {
            const bookingData = doc.data();
            if (bookingData.userId === userId) {
                if (!latestBooking || new Date(bookingData.timestamp.seconds * 1000) > new Date(latestBooking.timestamp.seconds * 1000)) {
                    latestBooking = { ...bookingData, id: doc.id };
                }
            }
        });

        if (latestBooking) {
            displayCurrentBooking(latestBooking);
        } else {
            document.getElementById('current-booking').innerHTML = "<p>No current bookings found.</p>";
        }
    } catch (error) {
        console.error("Error fetching current booking:", error);
        document.getElementById('current-booking').innerHTML = "<p>Error fetching booking data.</p>";
    }
}



// Function to display current booking
function displayCurrentBooking(data) {
    const currentBookingDiv = document.getElementById('current-booking');
    currentBookingDiv.innerHTML = `
        <h4>Current Booking (ID: ${data.id})</h4>
        <p>Car: ${data.car}</p>
        <p>From: ${data.from}</p>
        <p>To: ${data.to}</p>
        <p>Date: ${data.date}</p>
        <p>Time: ${data.time}</p>
        <p>Payment Mode: ${data.paymentMode}</p>
        <p>Message: ${data.message || "No message provided"}</p>
    `;
}


// Function to generate a unique Booking ID
async function generateUniqueBookingId() {
    const prefix = "EasyCab";
    let isUnique = false;
    let bookingId;

    while (!isUnique) {
        const randomNum = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
        bookingId = `${prefix}${randomNum}`;

        // Check if the Booking ID already exists in Firestore
        const querySnapshot = await getDocs(collection(db, "bookings"));
        isUnique = true; // Assume it's unique

        querySnapshot.forEach((doc) => {
            if (doc.id === bookingId) {
                isUnique = false; // Booking ID is not unique
            }
        });
    }

    return bookingId;
}


// Booking form submission
document.getElementById('booking-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const car = document.getElementById('car').value;
    const noOfStudents = parseInt(document.getElementById('noOfStudents').value, 10);
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const paymentMode = document.getElementById('paymentMode').value;
    const message = document.getElementById('message').value;

    const maxStudents = getMaxStudents(car);
    if (noOfStudents > maxStudents) {
        alert(`You can select a maximum of ${maxStudents} students for a ${car}.`);
        return;
    }

    const currentDate = new Date();
    const selectedDate = new Date(date);
    const selectedTime = new Date(`${date}T${time}`);

    if (selectedDate < currentDate || (selectedDate.toDateString() === currentDate.toDateString() && selectedTime < currentDate)) {
        alert("You cannot book a taxi for the past date and time.");
        return;
    }

    try {
        const bookingId = `EasyCab${Math.floor(1000 + Math.random() * 9000)}`;
        await setDoc(doc(db, "bookings", bookingId), {
            car,
            noOfStudents,
            from,
            to,
            date,
            time,
            paymentMode,
            message,
            userId: auth.currentUser.uid,
            timestamp: new Date()
        });

        alert("Booking successful! Booking ID: " + bookingId);
        displayCurrentBooking({ car, from, to, date, time, paymentMode, message, id: bookingId });
    } catch (error) {
        console.error("Error adding document:", error);
        alert("There was an error while booking. Please try again.");
    }
});

// Function to get maximum students based on car type
function getMaxStudents(car) {
    switch (car) {
        case 'Tata Zest':
        case 'Dzire':
            return 4; // 4-seater
        case 'Innova':
            return 7; // 7-seater
        default:
            return 0; // No limit or invalid car
    }
}

// View Driver Details logic
document.getElementById('viewDriverDetailsBtn').addEventListener('click', async () => {
    const bookingId = document.getElementById('bookingIdInput').value.trim();
    if (!bookingId) {
        alert("Please enter a valid Booking ID.");
        return;
    }

    const docRef = doc(db, "bookings", bookingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const bookingData = docSnap.data();
        displayDriverDetails(bookingData);
    } else {
        alert("No booking found with this ID.");
    }
});

// Function to display driver details
function displayDriverDetails(data) {
    const driverInfoDiv = document.getElementById('driver-info');

    // Format the estimated pick time
    const estimatedPickTime = data.estimatedPickTime ? formatTime(data.estimatedPickTime) : "N/A";

    // Use optional chaining and provide defaults for each field
    driverInfoDiv.innerHTML = `
        <h4>Driver Details</h4>
        <p>Driver Name: ${data.driverName || "N/A"}</p>
        <p>Phone: ${data.driverPhone || "N/A"}</p>
        <p>Cab Name: ${data.cabName || "N/A"}</p>
        <p>Taxi Number: ${data.taxiNumber || "N/A"}</p>
        <p>Estimated Pick Time: ${estimatedPickTime}</p>
        <p>Amount: ${data.amount !== undefined ? data.amount : "N/A"}</p>
        <p>Message: ${data.driverMessage || "No message provided"}</p>
        <p>Payment Mode: ${data.paymentMode || "N/A"}</p>
    `;
}


// Format time to 12-hour AM/PM format
function formatTime(timeString) {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${String(formattedHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

// QR Code scanning logic
const html5QrCode = new Html5Qrcode("reader");

// Check camera permissions and start scanning
async function checkCameraPermissions() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the video track
        startScanning(); // Start scanning after permission is granted
    } catch (err) {
        console.error("Camera permissions denied:", err);
        alert("Please allow camera access to scan QR codes.");
        if (err.name === "NotAllowedError") {
            alert("To change your camera settings, go to your browser settings and allow camera access for this site.");
        }
    }
}

// Start scanning for QR codes
document.getElementById('startScanBtn').addEventListener('click', startScanning);

async function startScanning() {
    try {
        await html5QrCode.start(
            { facingMode: "environment" }, // Use the environment camera (back camera)
            { fps: 10, qrbox: 250 }, // Configure frame rate and size of the scanning box
            qrCodeSuccessCallback // Callback for successful scans
        );
        document.getElementById('startScanBtn').style.display = 'none';
        document.getElementById('stopScanBtn').style.display = 'block';
    } catch (err) {
        console.error("Error starting QR code scanning.", err);
    }
}

// Handle successful QR code scan
function qrCodeSuccessCallback(decodedText, decodedResult) {
    // Check if the scanned QR code is an image URL
    if (decodedText.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        const driverProfilePic = document.getElementById('driver-profile-pic');
        driverProfilePic.src = decodedText;
        driverProfilePic.alt = "Scanned Driver Profile Picture";
        driverProfilePic.style.display = "block";

        document.getElementById('driver-name').textContent = "Driver Name";
        document.getElementById('driver-email').textContent = "Driver Email";

        document.getElementById('driver-info').style.display = "block";
    } else {
        document.getElementById('scan-result').innerHTML = `Scanned QR Code: ${decodedText}`;
        document.getElementById('driver-info').style.display = "none";
    }

    document.getElementById('scan-result').style.display = "block";
}

// Function to stop scanning
document.getElementById('stopScanBtn').addEventListener('click', stopScanning);
async function stopScanning() {
    try {
        await html5QrCode.stop();
        document.getElementById('stopScanBtn').style.display = 'none';
        document.getElementById('startScanBtn').style.display = 'block';
    } catch (err) {
        console.error("Error stopping QR code scanning.", err);
    }
}

// Log out function
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '/VITian/index.html';
    } catch (error) {
        console.error("Error signing out:", error);
    }
});

// Check for camera permissions on page load
checkCameraPermissions();

// Example: Updating driver details after scan
document.getElementById('startScanBtn').addEventListener('click', function () {
    // Simulate fetching driver details after QR scan
    const driverDetails = {
        name: "John Doe",
        email: "johndoe@example.com",
        profilePic: "https://example.com/path-to-profile-pic.jpg"
    };

    // Set driver details in the UI
    document.getElementById('driver-name').textContent = driverDetails.name;
    document.getElementById('driver-email').textContent = driverDetails.email;
    document.getElementById('driver-profile-pic').src = driverDetails.profilePic;

    // Display driver details section
    document.getElementById('driver-info').style.display = "block";
    document.getElementById('scan-result').style.display = "block";
});
