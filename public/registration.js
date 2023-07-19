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

//Displays the registration page

//Registration shows all the classes that the user can take
//  based on the classes they have taken
let core = {};
let elective = {};
let classesTaken = {};
let coreTaken = {};
let electiveTaken = {};
let nextSemesterClass = {};

// Fetch core classes from Firebase
database.ref('/classes/core').once('value', function(coreSnapshot) {
    core = coreSnapshot.val();
});
// Fetch elective classes from Firebase
database.ref('/classes/elective').once('value', function(electiveSnapshot) {
    elective = electiveSnapshot.val();
});
//Fetch classes taken by the current user from Firebase
database.ref('/users/UID1/classesTaken').once('value', function(classesTakenSnapshot) {
    classesTaken = classesTakenSnapshot.val();
});

function populateClasses(){
    
    var classChoiceContainer = document.getElementById("classChoiceContainer");
    var classChoice = document.getElementById("classChoice");
    var dropdownSemester = document.getElementById("semester");
    var dropdownReason = document.getElementById("reason");
    
    
    var selectedSemester = dropdownSemester.value;
    var selectedReason = dropdownReason.value;
    
    // Clear the classChoice list
    classChoice.innerHTML = "";
        // Filter and display classes offered in Fall semester
        if (selectedSemester == "Fall") {
            for (var classId in nextSemesterClass) {
                
                if (nextSemesterClass.hasOwnProperty(classId)) {        
                    var classObj = nextSemesterClass[classId];
                    console.log(classObj["classReason"]);
                    console.log("==========")
                    console.log(selectedReason);
                    
                    if (classObj["semesterAvailable"] === "Fall" && classObj["classReason"] === selectedReason) {
                        console.log("==========ASDADADASDASD=========")
                        var listItem = document.createElement("li");
                        listItem.textContent = classId + " - " + classObj.name;
                        listItem.addEventListener("click", function() {
                            classInfo(this.innerHTML);
                        });
                        classChoice.appendChild(listItem);
                    }
                }
            }
        }
        
        // Filter and display classes offered in Spring semester
        else if (selectedSemester == "Spring") {
            for (var classId in nextSemesterClass) {
                if (nextSemesterClass.hasOwnProperty(classId)) {        
                    var classObj = nextSemesterClass[classId];
                    console.log(classObj["classReason"]);
                    console.log("==========")
                    console.log(selectedReason);
                    
                    if (classObj["semesterAvailable"] === "Spring" && classObj["classReason"] === selectedReason) {
                        console.log("==========ASDADADASDASD=========")
                        var listItem = document.createElement("li");
                        listItem.textContent = classId + " - " + classObj.name;
                        listItem.addEventListener("click", function() {
                            classInfo(this.innerHTML);
                        });
                        classChoice.appendChild(listItem);
                    }
                }
            }
        }
}

//This function retrieves the classes taken by the user and
//  marks off the classes taken from the core and elective lists.
//  These are stored in object arrays for further processing.
function userClassesTaken() {
    for (const classes in core) {
        if (classes in classesTaken) {
            coreTaken[classes] = core[classes];
        } 
    }
    for (const classes in elective) {

        if (classes in classesTaken) {
            electiveTaken[classes] = elective[classes];
        }         
    }

}

function nextSemester() {
    
    for (const classes in core) {
        if (classesTaken[classes] == core[classes]["prerequisites"] || classesTaken[classes] == core[classes]["corequisites"]) {
            nextSemesterClass[classes] = core[classes];
        }
    }
    for (const classes in elective) {
        if (classesTaken[classes] == elective[classes]["prerequisites"] || classesTaken[classes] == elective[classes]["corequisites"]) {
            nextSemesterClass[classes] = elective[classes];
        }
    }
    
}

// Logic for class information
function classInfo(innerHTML) {
    // Use the `innerHTML` argument to access the inner HTML of the clicked element
    var splitString = innerHTML.split(" - ");
    var courseCode = splitString[0]
   
    var courseInfo = nextSemesterClass[courseCode];
 
    //populate the class info
    var classInfoHeader= document.getElementById("classInfoHeader");
    var classInfoHTML= document.getElementById("classInfo");
    classInfoHeader.innerHTML = courseCode;
    

    classInfoHTML.innerHTML = "<b>Course Name: </b>" + courseInfo["name"] + "<br>" +
                                "<b>Instructor: </b>" + courseInfo["professor"] + "<br>";
    
}


function classChecker() {
  nextSemester();
  populateClasses();
}

