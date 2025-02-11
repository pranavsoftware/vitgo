import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
const auth = getAuth(app);

// Restrict access based on email domain
onAuthStateChanged(auth, (user) => {
    if (user) {
        const emailDomain = user.email.split('@')[1];
        if (emailDomain !== "emp-easycab.site") {
            alert("Unauthorized access. Redirecting to login page...");
            signOut(auth).then(() => {
                window.location.href = "../Driver & Taxi Login/EMP_Login.html";  // Update the path as needed
            });
        }
    } else {
        // Redirect to login page if not logged in
        window.location.href = "../Driver & Taxi Login/EMP_Login.html";  // Update the path as needed
    }
});

// Function to generate a unique email ID
async function generateUniqueEmail(name) {
    let email = `${name.toLowerCase().replace(/\s+/g, '')}@emp-easycab.site`;
    const q = query(collection(db, "TAXIemployee"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        let count = 1;
        while (!querySnapshot.empty) {
            email = `${name.toLowerCase().replace(/\s+/g, '')}${count}@emp-easycab.site`;
            const newQuery = query(collection(db, "TAXIemployee"), where("email", "==", email));
            const newSnapshot = await getDocs(newQuery);
            if (newSnapshot.empty) break;
            count++;
        }
    }
    return email;
}

// Set the Email ID when name is entered
document.getElementById('name').addEventListener('input', async () => {
    const name = document.getElementById('name').value;
    if (name) {
        const email = await generateUniqueEmail(name);
        document.getElementById('email').value = email;
    } else {
        document.getElementById('email').value = '';
    }
});

// Employee Registration Form
document.getElementById('employeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const age = document.getElementById('age').value;
    const address = document.getElementById('address').value;
    const licenceNumber = document.getElementById('licenceNumber').value;
    const profilePic = document.getElementById('profilePic').files[0];
    const popupMessage = document.getElementById('popupMessage');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
            const storageRef = ref(storage, `drivers/${user.uid}/profilePics/${profilePic.name}`);
            await uploadBytes(storageRef, profilePic);

            const profilePicURL = await getDownloadURL(storageRef);

            await setDoc(doc(db, 'TAXIemployee', user.uid), {
                name,
                email,
                age,
                address,
                licenceNumber,
                profilePic: profilePicURL
            });

            popupMessage.textContent = "Registration completed!";
            popupMessage.className = "popup-message success";
            popupMessage.style.display = "block";

            setTimeout(() => {
                popupMessage.style.display = "none";
            }, 3000);

            document.getElementById('employeeForm').reset();
        }
    } catch (error) {
        console.error("Error registering employee: ", error);
        popupMessage.textContent = "Error: " + error.message;
        popupMessage.className = "popup-message error";
        popupMessage.style.display = "block";

        setTimeout(() => {
            popupMessage.style.display = "none";
        }, 3000);
    }
});
