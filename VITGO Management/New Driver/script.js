import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
const storage = getStorage(app);
const auth = getAuth();

// Redirect unauthorized users
onAuthStateChanged(auth, (user) => {
    if (!user || !user.email.endsWith("@emp-easycab.site")) {
        window.location.href = "../Driver & Taxi Login/EMP_Login.html"; // Redirect to login page if unauthorized
    }
});

// Show popup message
function showPopupMessage(message, success) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.style.backgroundColor = success ? 'green' : 'red';
    popup.style.color = 'white';
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 3000);
}

// Generate a unique email
async function generateUniqueEmail(baseEmail) {
    let uniqueEmail = baseEmail;
    let counter = 1;

    // Check if the generated email is already in Firestore
    const driversRef = collection(db, "drivers");
    let emailExists = true;
    while (emailExists) {
        const q = query(driversRef, where("email", "==", uniqueEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            emailExists = false; // Email is unique
        } else {
            uniqueEmail = baseEmail.replace('@drivereasycab.site', '') + counter + '@drivereasycab.site';
            counter++;
        }
    }
    return uniqueEmail;
}

// Handle name input and email generation
document.getElementById('name').addEventListener('input', function () {
    const nameValue = this.value.trim();
    const emailField = document.getElementById('email');
    if (nameValue) {
        const baseEmail = nameValue.replace(/\s+/g, '').toLowerCase() + '@drivereasycab.site';
        emailField.value = baseEmail;
    } else {
        emailField.value = '';
    }
});

// Handle form submission
document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const license = document.getElementById('license').value;
    const address = document.getElementById('address').value;
    const taxiNumber = document.getElementById('taxiNumber').value;
    const picFile = document.getElementById('pic').files[0];

    try {
        email = await generateUniqueEmail(email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        let picUrl = '';
        if (picFile) {
            const picRef = ref(storage, `drivers/${user.uid}/${picFile.name}`);
            await uploadBytes(picRef, picFile);
            picUrl = await getDownloadURL(picRef);
        }

        await setDoc(doc(db, "drivers", user.uid), {
            name,
            email,
            phone,
            license,
            address,
            taxiNumber,
            picUrl,
            password
        });

        showPopupMessage("Driver added successfully!", true);
    } catch (error) {
        console.error("Error adding document: ", error);
        if (error.code === 'auth/email-already-in-use') {
            showPopupMessage("Error: This email is already in use.", false);
        } else {
            showPopupMessage("Driver not added! " + error.message, false);
        }
    }
});

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
