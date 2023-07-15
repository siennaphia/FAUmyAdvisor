//Displays the registration page

//Registration shows all the classes that the user can take
//  based on the classes they have taken

// configure FireBase
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

  // initialize FireBase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

let core = {};
let elective = {};
let classesTaken = {};

// Fetch core classes from Firebase
database.ref('/classes/core').once('value', function(coreSnapshot) {
    core = coreSnapshot.val();
    populateCoreClasses();
    adjustContainerSize();
});

// Fetch elective classes from Firebase
database.ref('/classes/elective').once('value', function(electiveSnapshot) {
    elective = electiveSnapshot.val();
});

//Fetch classes taken by the current user from Firebase
database.ref('/currentUser/classesTaken').once('value', function(classesTakenSnapshot) {
    classesTaken = classesTakenSnapshot.val();
});


function populateCoreClasses(){

    var classChoiceContainer = document.getElementById("classChoiceContainer");
    var classChoice = document.getElementById("classChoice");

    for (var classId in core) {
        if (core.hasOwnProperty(classId)) {
            var classObj = core[classId];

            var listItem = document.createElement("li");
            listItem.textContent = classId + " - " + classObj.name;
            classChoice.appendChild(listItem);
        }
    }
}

function adjustContainerSize() {
    var listItemHeight = 30; // Adjust the height of each list item in pixels
    var numItems = classChoiceList.children.length;
    var containerHeight = numItems * listItemHeight;
    classChoiceContainer.style.height = containerHeight + "px";
  }

