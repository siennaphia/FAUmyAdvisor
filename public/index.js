
  // Function to register a new user
  function registerUser() {
    var email = document.getElementById("emailInput").value;
    var password = document.getElementById("passwordInput").value;
  
    if (email && password) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          var user = userCredential.user;
          // Store relevant user data in the database here (e.g., firstName, lastName, intendedCareer)
          var usersRef = database.ref('/users');
          usersRef.child(user.uid).set({
            email: email,
            // Add other user data as needed
          });
          alert("Registration successful!");
          window.location.href = "userinfo.html"; // Redirect to userinfo.html
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert("Registration failed: " + errorMessage);
        });
    } else {
      alert("Please enter a valid email and password.");
    }
  }
  
  // Function to check if the user is logged in
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, redirect to userinfo.html or any other authorized page
      window.location.href = "userinfo.html";
    }
  });
  
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("emailInput").value;
    var password = document.getElementById("passwordInput").value;
  
    if (email && password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          alert("Login successful!");
          window.location.href = "userinfo.html"; // Redirect to userinfo.html
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert("Login failed: " + errorMessage);
        });
    } else {
      alert("Please enter a valid email and password.");
    }
  });
  