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

// initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

let core = {};
let elective = {};
let userClasses = {};
let classesTaken = {};
let nextSemesterClass = {};


// Fetch core classes from Firebase
database.ref('/classes/core').once('value').then(function(coreSnapshot) {
    core = coreSnapshot.val();
    console.log(core);
});
// Fetch elective classes from Firebase
database.ref('/classes/elective').once('value').then(function(electiveSnapshot) {
    elective = electiveSnapshot.val();
    console.log(elective);
});
//Fetch classes taken by the current user from Firebase
database.ref('/users/UID1/classesTaken').once('value').then(function(userClassesSnapshot) {
    userClasses = userClassesSnapshot.val();
    userClasses = Object.keys(userClasses);
    console.log(userClasses);
    nextSemester(userClasses);
});

function nextSemester(classesT){
    // Fetch core classes from Firebase
    database.ref('/classes/core').once('value').then(function(coreSnapshot) {
        core = coreSnapshot.val();
        for(const key in core){
            if(classesT.includes(core[key]['prerequisites']) || classesT.includes(core[key]['corequisites'])){
                console.log(core[key]['name']);
                console.log(core[key]['prerequisites'], core[key]['corequisites']);
                
            }
        }
    }); 
}
