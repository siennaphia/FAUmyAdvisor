//javascript rules that apply to all pages 

var firebaseConfig = {
    apiKey: "AIzaSyB8MQgtQq2_AbIZEHMJrh3VkJDuvTTy5ss",
    authDomain: "myadvisor-f1061.firebaseapp.com",
    databaseURL: "https://myadvisor-f1061-default-rtdb.firebaseio.com",
    projectId: "myadvisor-f1061",
    storageBucket: "myadvisor-f1061.appspot.com",
    messagingSenderId: "560337324833",
    appId: "1:560337324833:web:f98e380915a03ff55a0c60",
    measurementId: "G-N2V217YPX0"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// logout function in the nav bar 
function logoutUser() {
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
      window.location.href = "index.html"; // Redirect to the login page after logout
    }).catch((error) => {
      // An error happened.
    console.log(error);
    });
}

// Add click event listener to the "Log Out" button
document.getElementById("logoutButton").addEventListener("click", logoutUser);
