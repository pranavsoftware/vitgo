import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
const firestore = getFirestore(app);
const auth = getAuth(app);

// Get authenticated user
let username = '';

onAuthStateChanged(auth, (user) => {
    if (user) {
        username = user.displayName || user.email.split('@')[0];
    } else {
        window.location.href = '/VITian/index.html';
    }
});

// Helper function to validate date and time
function isValidDateTime(date, time) {
    const currentDateTime = new Date();
    const selectedDateTime = new Date(`${date}T${time}`);
    return selectedDateTime >= currentDateTime;
}

// Handle form submission
document.getElementById('postPlanForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const university = document.getElementById('university').value;
    const fromState = document.getElementById('fromState').value;
    const fromCity = document.getElementById('fromCity').value;
    const fromPlace = document.getElementById('fromPlace').value;
    const toState = document.getElementById('toState').value;
    const toCity = document.getElementById('toCity').value;
    const toPlace = document.getElementById('toPlace').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const gender = document.getElementById('gender').value;
    const luggage = document.getElementById('luggage').value;
    const carType = document.getElementById('carType').value;
    const message = document.getElementById('message').value;

    // Validate if the date and time are for the present or future
    if (!isValidDateTime(date, time)) {
        alert('Please select a valid date and time (present or future).');
        return;
    }

    const user = auth.currentUser;  // Use 'auth' to get the current user
    if (user) {
        try {
            // Fetch user's name from Firestore
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const name = userData.name; // Get user's name from Firestore

                const postId = Date.now().toString();  // Create a unique post ID using timestamp
                const postDocRef = doc(firestore, 'posts', postId);

                await setDoc(postDocRef, {
                    username: name,  // Save the user's name
                    university,
                    fromState,
                    fromCity,
                    fromPlace,
                    toState,
                    toCity,
                    toPlace,
                    dateTime: `${date} ${time}`,
                    gender,
                    luggage,
                    carType,  // Save car type
                    message
                });

                showPopup();
                setTimeout(() => {
                    window.location.href = '../dashboard/index.html';
                }, 2000);
            } else {
                console.error('No user data found in Firestore.');
                alert('User data not found. Please log in again.');
                window.location.href = '/VITian/index.html';
            }
        } catch (error) {
            console.error("Error posting plan:", error);
        }
    } else {
        alert("User is not authenticated. Redirecting to login page.");
        window.location.href = '/VITian/index.html';
    }
});

// Show popup
function showPopup() {
    const popup = document.getElementById('popup');
    popup.classList.add('show');
    document.getElementById('closePopup').addEventListener('click', () => {
        popup.classList.remove('show');
    });
}

// Toggle menu visibility
function toggleMenu() {
    const menuList = document.querySelector('.nav-menu');
    menuList.classList.toggle('show');
}

document.querySelector('.menu-toggle').addEventListener('click', toggleMenu);

// Update city and place dropdowns
const citiesByState = {
    'Andaman and Nicobar Islands': ['Port Blair'],
    'Andhra Pradesh': ['Guntur', 'Kakinada', 'Tirupati', 'Vijayawada', 'Visakhapatnam'],
    'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Ziro'],
    'Assam': ['Dibrugarh', 'Guwahati', 'Jorhat', 'Silchar', 'Tezpur'],
    'Bihar': ['Bhagalpur', 'Gaya', 'Muzaffarpur', 'Patna'],
    'Chandigarh': ['Chandigarh'],
    'Chhattisgarh': ['Bilaspur', 'Durg', 'Raipur'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
    'Delhi': ['Delhi'],
    'Goa': ['Margao', 'Panaji', 'Vasco da Gama'],
    'Gujarat': ['Ahmedabad', 'Gandhinagar', 'Rajkot', 'Surat', 'Vadodara'],
    'Haryana': ['Faridabad', 'Gurgaon', 'Hisar', 'Panipat', 'Rohtak'],
    'Himachal Pradesh': ['Dharamshala', 'Kullu', 'Manali', 'Shimla'],
    'Jammu and Kashmir': ['Jammu', 'Leh', 'Srinagar'],
    'Jharkhand': ['Bokaro', 'Dhanbad', 'Jamshedpur', 'Ranchi'],
    'Karnataka': ['Bengaluru', 'Hubli', 'Mangalore', 'Mysore'],
    'Kerala': ['Alappuzha', 'Kochi', 'Kozhikode', 'Thiruvananthapuram'],
    'Ladakh': ['Kargil', 'Leh'],
    'Lakshadweep': ['Kavaratti'],
    'Madhya Pradesh': ['Bhopal', 'Gwalior', 'Indore', 'Jabalpur', 'Ujjain'],
    'Maharashtra': ['Aurangabad', 'Mumbai', 'Nagpur', 'Nashik', 'Pune'],
    'Manipur': ['Imphal'],
    'Meghalaya': ['Shillong'],
    'Mizoram': ['Aizawl'],
    'Nagaland': ['Dimapur', 'Kohima'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela'],
    'Puducherry': ['Karaikal', 'Mahe', 'Pondicherry', 'Yanam'],
    'Punjab': ['Amritsar', 'Jalandhar', 'Ludhiana', 'Patiala'],
    'Rajasthan': ['Ajmer', 'Jaipur', 'Jodhpur', 'Kota', 'Udaipur'],
    'Sikkim': ['Gangtok'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Vellore'],
    'Telangana': ['Hyderabad', 'Karimnagar', 'Nizamabad', 'Warangal'],
    'Tripura': ['Agartala'],
    'Uttar Pradesh': ['Agra', 'Allahabad', 'Kanpur', 'Lucknow', 'Varanasi'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital', 'Rishikesh'],
    'West Bengal': ['Asansol', 'Durgapur', 'Kolkata', 'Siliguri']
};

const placesByCity = {
    'Agra': ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh'],
    'Ahmedabad': ['Sabarmati Ashram', 'Akshardham Temple', 'Kankaria Lake', 'Sidi Saiyyed Mosque'],
    'Ajmer': ['Ajmer Sharif Dargah', 'Ana Sagar Lake', 'Adhai Din Ka Jhonpra', 'Taragarh Fort'],
    'Allahabad (Prayagraj)': ['Triveni Sangam', 'Anand Bhavan', 'Allahabad Fort', 'Khusro Bagh'],
    'Amritsar': ['Golden Temple', 'Jallianwala Bagh', 'Wagah Border', 'Partition Museum'],
    'Bangalore': ['Bangalore Palace', 'Lalbagh Botanical Garden', 'Cubbon Park', 'ISKCON Temple'],
    'Bhopal': ['Bhojtal Lake', 'Sanchi Stupa', 'Van Vihar National Park', 'Taj-ul-Masjid'],
    'Bhubaneswar': ['Lingaraj Temple', 'Udayagiri and Khandagiri Caves', 'Raja Rani Temple', 'Nandankanan Zoo', 'Dhauli Hill'],
    'Chandigarh': ['Rock Garden', 'Sukhna Lake', 'Rose Garden', 'Pinjore Gardens'],
    'Chennai': ['Marina Beach', 'Kapaleeshwarar Temple', 'Fort St. George', 'Santhome Basilica'],
    'Coimbatore': ['Marudhamalai Temple', 'Dhyanalinga Temple', 'VOC Park and Zoo', 'Perur Pateeswarar Temple'],
    'Delhi': ['Red Fort', 'India Gate', 'Qutub Minar', 'Lotus Temple', 'Humayun\'s Tomb'],
    'Gaya': ['Mahabodhi Temple', 'Bodhi Tree', 'Vishnupad Temple', 'Dungeshwari Cave Temples'],
    'Goa': ['Baga Beach', 'Basilica of Bom Jesus', 'Dudhsagar Waterfalls', 'Aguada Fort'],
    'Guwahati': ['Kamakhya Temple', 'Umananda Temple', 'Assam State Zoo', 'Pobitora Wildlife Sanctuary'],
    'Hyderabad': ['Charminar', 'Golconda Fort', 'Ramoji Film City', 'Hussain Sagar Lake'],
    'Jaipur': ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar'],
    'Jodhpur': ['Mehrangarh Fort', 'Umaid Bhawan Palace', 'Jaswant Thada', 'Mandore Garden'],
    'Kolkata': ['Victoria Memorial', 'Howrah Bridge', 'Dakshineswar Kali Temple', 'Indian Museum'],
    'Lucknow': ['Bara Imambara', 'Rumi Darwaza', 'Ambedkar Memorial Park', 'Chota Imambara'],
    'Mumbai': ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Siddhivinayak Temple', 'Chhatrapati Shivaji Maharaj Terminus'],
    'Mysore': ['Mysore Palace', 'Brindavan Gardens', 'Chamundi Hill', 'St. Philomena\'s Church'],
    'Pune': ['Shaniwar Wada', 'Aga Khan Palace', 'Sinhagad Fort', 'Pataleshwar Cave Temple'],
    'Udaipur': ['City Palace', 'Lake Pichola', 'Jag Mandir', 'Fateh Sagar Lake'],
    'Varanasi': ['Kashi Vishwanath Temple', 'Dashashwamedh Ghat', 'Manikarnika Ghat', 'Banaras Hindu University'],
    'Vijayawada': ['Kanaka Durga Temple', 'Undavalli Caves', 'Prakasam Barrage', 'Bhavani Island'],
    'Vellore': ['VIT Campus', 'Vellore Town Railway Station', 'Katpadi Junction Railway Station', 'Vellore Fort', 'Jalakandeswarar Temple', 'Sripuram Golden Temple', 'Amirthi Zoological Park'],
    'Visakhapatnam': ['Ramakrishna Beach', 'Kailasagiri', 'INS Kursura Submarine Museum', 'Araku Valley']
};

function updateCities(stateSelectId, citySelectId) {
    const state = document.getElementById(stateSelectId).value;
    const citySelect = document.getElementById(citySelectId);
    citySelect.innerHTML = '<option value="">Select City</option>';

    if (state && citiesByState[state]) {
        citiesByState[state].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

function updatePlaces(citySelectId, placeSelectId) {
    const city = document.getElementById(citySelectId).value;
    const placeSelect = document.getElementById(placeSelectId);
    placeSelect.innerHTML = '<option value="">Select Place</option>';

    if (city && placesByCity[city]) {
        placesByCity[city].forEach(place => {
            const option = document.createElement('option');
            option.value = place;
            option.textContent = place;
            placeSelect.appendChild(option);
        });
    }
}

document.getElementById('fromState').addEventListener('change', () => {
    updateCities('fromState', 'fromCity');
});
document.getElementById('fromCity').addEventListener('change', () => {
    updatePlaces('fromCity', 'fromPlace');
});

document.getElementById('toState').addEventListener('change', () => {
    updateCities('toState', 'toCity');
});
document.getElementById('toCity').addEventListener('change', () => {
    updatePlaces('toCity', 'toPlace');
});
