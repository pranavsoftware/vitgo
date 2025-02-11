// Service Worker for caching all assets
const CACHE_NAME = "easycab-cache-v1";
const urlsToCache = [
  // About Us section
  "../About Us/About Us.html",
  "../About Us/About Us.css",
  "../About Us/About Us.js",
  "../About Us/About Us_hidden.css",

  // Assets
  "../assets/Advantages.jpeg",
  "../assets/Akshay.jpg",
  "../assets/Ankit.png",
  "../assets/apple-touch-icon-ipad-76x76.png",
  "../assets/apple-touch-icon-ipad-retina-152x152.png",
  "../assets/apple-touch-icon-iphone-60x60.png",
  "../assets/apple-touch-icon-iphone-retina-120x120.png",
  "../assets/Arye.jpg",
  "../assets/Atharva.jpg",
  "../assets/backgroundimage.jpeg",
  "../assets/bitmoji.png",
  "../assets/Blue Modern Investment Mobile App Promotion VITianbook Ad.png",
  "../assets/contact us.jpeg",
  "../assets/default Avatar .jpg",
  "../assets/Divyansh.png",
  "../assets/Driver Login.png",
  "../assets/Easycab - Parent.jpg",
  "../assets/easycab-driver.jpg",
  "../assets/Google logo.png",
  "../assets/howtouse.jpeg",
  "../assets/instagram.jpeg",
  "../assets/Linkedin.png",
  "../assets/loginimage.png",
  "../assets/logo (1).png",
  "../assets/logo.jpeg",
  "../assets/Nishta.png",
  "../assets/Padma Priya mam.jpeg",
  "../assets/Parent Login..jpeg",
  "../assets/Parent Login.png",
  "../assets/Parent web-logo.jpg",
  "../assets/Pranav.jpg",
  "../assets/preloader.mp4",
  "../assets/Sahil.jpg",
  "../assets/smile.jpeg",
  "../assets/Student login.jpeg",
  "../assets/tab logo.ico",
  "../assets/Tanisha.png",
  "../assets/Taxi Driver.jpeg",
  "../assets/Taxi Login.png",
  "../assets/taxi Management.jpeg",
  "../assets/Team.jpg",
  "../assets/tickmark.jpeg",
  "../assets/VIT Admin Login.png",
  "../assets/VIT Logo.jpeg",
  "../assets/VITian.jpeg",
  "../assets/Vyom Sen.png",
  "../assets/web app 192 logo.jpg",
  "../assets/what is easycab.jpeg",

  // VITGO Admin section
  "../VITGO Admin/dashboard.css",
  "../VITGO Admin/dashboard.html",
  "../VITGO Admin/dashboard.js",
  "../VITGO Admin/dashboard_hidden.css",
  "../VITGO Admin/feedback.css",
  "../VITGO Admin/feedback.html",
  "../VITGO Admin/feedback.js",
  "../VITGO Admin/feedback_hidden.css",
  "../VITGO Admin/login.css",
  "../VITGO Admin/login.html",
  "../VITGO Admin/login.js",
  "../VITGO Admin/login_hidden.css",
  "../VITGO Admin/Planlist.css",
  "../VITGO Admin/Planlist.html",
  "../VITGO Admin/Planlist.js",
  "../VITGO Admin/Planlist_hidden.css",
  "../VITGO Admin/Registeration.js",
  "../VITGO Admin/Registerations.css",
  "../VITGO Admin/Registerations.html",
  "../VITGO Admin/Registerations_hidden.css",
  "../VITGO Admin/VITian App.js",
  "../VITGO Admin/VITian notice.html",
  "../VITGO Admin/VITians styles.css",
  "../VITGO Admin/VITian_hidden.css",

  // Dashboard section
  "../Dashboard/dashboard.css",
  "../Dashboard/dashboard.html",
  "../Dashboard/dashboard.js",
  "../Dashboard/dashboard_hidden.css",

  // Driver & Taxi Login section
  "../Driver & Taxi Login/Driver-Login.html",
  "../Driver & Taxi Login/EMP Styles.css",
  "../Driver & Taxi Login/EMP.js",
  "../Driver & Taxi Login/emp_hiddent.css",
  "../Driver & Taxi Login/EMP_Login.html",
  "../Driver & Taxi Login/index.js",
  "../Driver & Taxi Login/styles.css",

  // Driver Webapp section
  "../Driver Webapp/Driver.css",
  "../Driver Webapp/Driver.html",
  "../Driver Webapp/Driver.js",
  "../Driver Webapp/Driver_hidden.css",
  "../Driver Webapp/manifest.json",
  "../Driver Webapp/service-worker.js",

  // Drivers Dashboard section
  "../Drivers Dashboard/Driver-Login.html",
  "../Drivers Dashboard/driver.js",
  "../Drivers Dashboard/styles.css",

  // VITian recognition section
  "../VITian/app.js",
  "../VITian/VITian.css",
  "../VITian/firebase.js",
  "../VITian/index.html",
  "../VITian/styles_hidden.css",

  // Feedback section
  "../FeedBack/feedback.css",
  "../FeedBack/feedback.html",
  "../FeedBack/feedback.js",
  "../FeedBack/feedback_hidden.css",

  // Index section
  "../index/index.css",
  "../index/index.html",
  "../index/index.js",
  "../index/index_hidden.css",
  "../index/manifest.json",
  "../index/service-worker.js",

  // Login section
  "../login/login.css",
  "../login/login.html",
  "../login/login.js",
  "../login/redirect.js",

  // Main Login section
  "../Main Login/index.html",
  "../Main Login/index.js",
  "../Main Login/styles.css",
  "../Main Login/styles_hidden.css",

  // Maintenance section
  "../Maintance/undermaintance.html",

  // VITGO Parents section
  "../VITGO Parents/bookHistory.css",
  "../VITGO Parents/bookHistory.html",
  "../VITGO Parents/bookHistory.js",
  "../VITGO Parents/booking.css",
  "../VITGO Parents/booking.html",
  "../VITGO Parents/booking.js",
  "../VITGO Parents/bookingHistory_hidden.css",
  "../VITGO Parents/booking_hidden.css",
  "../VITGO Parents/contact us.css",
  "../VITGO Parents/contact us.html",
  "../VITGO Parents/contact_hidden.css",
  "../VITGO Parents/dashboard.css",
  "../VITGO Parents/dashboard.html",
  "../VITGO Parents/dashboard.js",
  "../VITGO Parents/dashboard_hidden.css",
  "../VITGO Parents/login.css",
  "../VITGO Parents/login.html",
  "../VITGO Parents/login.js",
  "../VITGO Parents/login_hidden.css",
  "../VITGO Parents/manifest.json",
  "../VITGO Parents/service-worker.js",
  "../VITGO Parents/ward details.css",
  "../VITGO Parents/ward details.html",
  "../VITGO Parents/ward details.js",
  "../VITGO Parents/ward details_hidden.css",

  // Payment section
  "../Payment/payment.css",
  "../Payment/payment.html",
  "../Payment/payment.js",

  // Post section
  "../Post/post plan.css",
  "../Post/post plan.html",
  "../Post/post plan.js",
  "../Post/Post_hidden.css",

  // Profile section
  "../Profile/user profiel.html",
  "../Profile/user profile.css",
  "../Profile/user profile.js",
  "../Profile/user_hidden.css",

  // Start Soon section
  "../Start soon/index.html",
  "../Start soon/script.js",
  "../Start soon/start_hidden.css",
  "../Start soon/styles.css",

  // Student Booking section
  "../Student Booking/Studentbooking.css",
  "../Student Booking/studentbooking.html",
  "../Student Booking/Studentbooking.js",
  "../Student Booking/Student_hidden.css",

  // Taxi section
  "../taxi/taxi.css",
  "../taxi/taxi.js",
  "../taxi/Taxilogin.html",

  // VITGO Management section
  "../VITGO Management/+ADD Driver.html",
  "../VITGO Management/+ADDEmployee.css",
  "../VITGO Management/+ADDEmployee.html",
  "../VITGO Management/+ADDEmployee.js",
  "../VITGO Management/ADD Driver.css",
  "../VITGO Management/ADD Driver.js",
  "../VITGO Management/ADD Driver_hidden.css",
  "../VITGO Management/add emp hidden.css",
  "../VITGO Management/driverdetails.css",
  "../VITGO Management/driverDetails.html",
  "../VITGO Management/driverdetails.js",
  "../VITGO Management/driver_hidden.css",
  "../VITGO Management/employeedetails.css",
  "../VITGO Management/employeedetails.html",
  "../VITGO Management/employeedetails.js",
  "../VITGO Management/employeedetails_hidden.css",
  "../VITGO Management/index hidden.css",
  "../VITGO Management/index.html",
  "../VITGO Management/index.js",
  "../VITGO Management/Mayataxi.css",
  "../VITGO Management/Mayataxi.html",
  "../VITGO Management/Mayataxi.js",
  "../VITGO Management/Mayataxi_hidden.css",
  "../VITGO Management/styles.css",

  // Terms and Condition section
  "../Terms&Condition/Terms and condition.html",

  // Webchat section
  "../webchat/app.js",
  "../webchat/index.html",
  "../webchat/styles.css",
  "../webchat/styles_hidden.css"
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching files...');
      // Cache each asset and log any errors
      return Promise.all(urlsToCache.map(asset => {
        return cache.add(asset).then(() => {
          console.log(`Successfully cached: ${asset}`);
        }).catch((error) => {
          console.error(`Failed to cache ${asset}:`, error);
        });
      }));
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log(`Serving cached response for: ${event.request.url}`);
        return response; // Return cached response if found
      } else {
        console.log(`Fetching from network: ${event.request.url}`);
        return fetch(event.request); // Fetch from network if not cached
      }
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: 'icon.png', // Your icon here
    badge: 'badge.png', // Optional
  };
  event.waitUntil(
    self.registration.showNotification('EasyCab Notification', options)
  );
});
