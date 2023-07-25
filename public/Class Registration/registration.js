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
let coreNext = {};
let electiveNext = {};
let classesTaken = {};
let nextSemesterClass = {};
let scheduleFall = {};
let scheduleSpring = {};

async function fetchUserDataAndPopulateChoices() {
    try {
        // Fetch core classes from Firebase
        const coreSnapshot = database.ref('/classes/core').once('value');
        // Fetch elective classes from Firebase
        const electiveSnapshot = database.ref('/classes/elective').once('value');
        // Fetch classes taken by the current user from Firebase
        const userClassesSnapshot = database.ref('/users/UID1/classesTaken').once('value');
    
        // Wait for all the async tasks to complete using Promise.all()
        const [coreSnapshotData, electiveSnapshotData, userClassesSnapshotData] = await Promise.all([
          coreSnapshot,
          electiveSnapshot,
          userClassesSnapshot,
        ]);
    
        core = coreSnapshotData.val();
        elective = electiveSnapshotData.val();
        userClasses = userClassesSnapshotData.val();
    
        const userClassKey = Object.keys(userClasses);
    
        for (let i = 0; i < userClassKey.length; i++) {
          await checkCoreClasses(userClassKey[i]);
          await checkElectiveClasses(userClassKey[i]);
        }
    
        // Call populateClassChoices inside this function
        populateClassChoices(coreNext, electiveNext);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
}
  
// Call the function to fetch data and populate choices
fetchUserDataAndPopulateChoices();
  

//Check if the user has taken the prerequisite/corequisite class for each core class
async function checkCoreClasses(classes){
    
    return new Promise((resolve) => {
        //Fetch core classes from Firebase
        database.ref('/classes/core').once('value').then(function(coreSnapshot) {
            const coreClasses = coreSnapshot.val();

            //Array of core class codes
            const coreKey = Object.keys(coreClasses);
        
            //Iterate through each core class
            for(let i = 0; i < coreKey.length; i++){

                //Check if the core class has prerequisites
                if(coreClasses[coreKey[i]]['prerequisites']){
                
                    //Array of prerequisite class codes
                    const prereqKey = Object.keys(coreClasses[coreKey[i]]['prerequisites']);

                    //Iterate through each prerequisite class
                    for(let j = 0; j < prereqKey.length; j++){
                        //Check if the user has taken the prerequisite class
                        if(prereqKey[j] == classes){
                            coreNext[coreKey[i]] = true;
                        }
                    }
                }

                if(coreClasses[coreKey[i]]['corequisites']){

                    //Array of corequisite class codes
                    const coreqKey = Object.keys(coreClasses[coreKey[i]]['corequisites']);
                
                    //Iterate through each corequisite class
                    for(let j = 0; j < coreqKey.length; j++){
                        //Check if the user has taken the prerequisite class
                        if(coreqKey[j] == classes){
                            coreNext[coreKey[i]] = true;
                        }
                    }

                }
            }
            resolve();
        });
    });
}

//Check if the user has taken the prerequisite/corequisite class for each elective class
async function checkElectiveClasses(classes){
    return new Promise((resolve) => {
        //Fetch elective classes from Firebase
        database.ref('/classes/elective').once('value').then(function(electiveSnapshot) {
            const electiveClasses = electiveSnapshot.val();

            //Array of core class codes
            const electiveKey = Object.keys(electiveClasses);
        
            //Iterate through each core class
            for(let i = 0; i < electiveKey.length; i++){

                //Check if the core class has prerequisites
                if(electiveClasses[electiveKey[i]]['prerequisites']){
                
                    //Array of prerequisite class codes
                    const prereqKey = Object.keys(electiveClasses[electiveKey[i]]['prerequisites']);

                    //Iterate through each prerequisite class
                    for(let j = 0; j < prereqKey.length; j++){
                        //Check if the user has taken the prerequisite class
                        if(prereqKey[j] == classes){
                            electiveNext[electiveKey[i]] = true;
                        }
                    }
                }

                if(electiveClasses[electiveKey[i]]['corequisites']){

                    //Array of corequisite class codes
                    const coreqKey = Object.keys(electiveClasses[electiveKey[i]]['corequisites']);
                
                    //Iterate through each corequisite class
                    for(let j = 0; j < coreqKey.length; j++){
                        //Check if the user has taken the prerequisite class
                        if(coreqKey[j] == classes){
                            electiveNext[electiveKey[i]] = true;
                        }
                    }

                }
            }
            resolve();
        });
    });
}
  
function populateClassChoices(classesCore, classesElective) {
    
    const nextCoreKey = Object.keys(classesCore);
    console.log(nextCoreKey);
    const nextElectiveKey = Object.keys(classesElective);
    console.log(nextElectiveKey);

    const classListElement = document.getElementById("classList");
    // Clear any previous content
    classListElement.innerHTML = "";
    
    // Get a reference to the <select> element
    const semesterDropdown = document.getElementById("semesterDropdown");
    const selectedSemester = semesterDropdown.value;
    console.log("Selected schedule:", selectedSemester);

    const reasonDropdown = document.getElementById("reasonDropdown");
    const selectedReason = reasonDropdown.value;
    console.log("Selected reason:", selectedReason);

    if(selectedSemester === "Fall"){
        nextSemesterClass = {};
        if(selectedReason === "core"){
            for(let i = 0; i < nextCoreKey.length; i++){
                if(core[nextCoreKey[i]]["semesterAvailable"] == selectedSemester){
                    nextSemesterClass[nextCoreKey[i]] = true;
                }
            }
        }
        else if(selectedReason === "elective"){
            for(let i = 0; i < nextElectiveKey.length; i++){
                if(elective[nextElectiveKey[i]]["semesterAvailable"] == selectedSemester){
                    nextSemesterClass[nextElectiveKey[i]] = true;
                }
            }
        }
    }

    if(selectedSemester === "Spring"){
        nextSemesterClass = {};
        if(selectedReason === "core"){
            for(let i = 0; i < nextCoreKey.length; i++){
                if(core[nextCoreKey[i]]["semesterAvailable"] == selectedSemester){
                    nextSemesterClass[nextCoreKey[i]] = true;
                }
            }
        }
        if(selectedReason === "elective"){
            for(let i = 0; i < nextElectiveKey.length; i++){
                if(elective[nextElectiveKey[i]]["semesterAvailable"] == selectedSemester){
                    nextSemesterClass[nextElectiveKey[i]] = true;
                }
            }
        }
    }

    console.log(nextSemesterClass);

    // If there are no class keys, display a message
    if (Object.keys(nextSemesterClass).length === 0) {
        const listItem = document.createElement("li");
        listItem.textContent = "No classes available";
        classListElement.appendChild(listItem);
    } 
    else {
        // Populate the list with the filtered class keys
        for (const classKey in nextSemesterClass) {
            if (nextSemesterClass.hasOwnProperty(classKey)) {
                const listItem = document.createElement("li");
                listItem.textContent = classKey;
                // Click event listener to each list item to display class information
                listItem.addEventListener("click", () => onClassClick(classKey));
                classListElement.appendChild(listItem);
            }
        }
    }
}

//Display class information when a class is clicked
function populateClassInfo(classKey){

    const classInfoContainer = document.getElementById("classInfoContainer");
    // Clear any previous content
    classInfoContainer.innerHTML = "";

    if (core.hasOwnProperty(classKey)) {
        const classInfo = core[classKey];

        // Create HTML elements to display class information
        const classInfoHeading = document.createElement("h4");
        classInfoHeading.textContent = classInfo["name"];

        const classInfoList = document.createElement("ul");
        const professorListItem = document.createElement("li");
        professorListItem.textContent = `Professor: ${classInfo["professor"]}`;

        classInfoList.appendChild(professorListItem);

        // Append the elements to the container
        classInfoContainer.appendChild(classInfoHeading);
        classInfoContainer.appendChild(classInfoList);
    } 
    else if(elective.hasOwnProperty(classKey)){
        const classInfo = elective[classKey];

        // Create HTML elements to display class information
        const classInfoHeading = document.createElement("h4");
        classInfoHeading.textContent = classInfo["name"];

        const classInfoList = document.createElement("ul");
        const professorListItem = document.createElement("li");
        professorListItem.textContent = classInfo["professor"];

        classInfoList.appendChild(professorListItem);

        // Append the elements to the container
        classInfoContainer.appendChild(classInfoHeading);
        classInfoContainer.appendChild(classInfoList);
    }
    const addButton = document.getElementById("addClass");
    addButton.addEventListener("click", () => onScheduleClick(classKey));
}

function semesterSchedule(classKey){
    const semesterDropdown = document.getElementById("semesterDropdown");
    const selectedSemester = semesterDropdown.value;

    if(selectedSemester === "Fall"){
        scheduleFall[classKey] = true;
        const scheduleListElement = document.getElementById("scheduleList");
        // Clear any previous content
        scheduleListElement.innerHTML = "";
        for(const classKey in scheduleFall){
            if(scheduleFall.hasOwnProperty(classKey)){
                const listItem = document.createElement("li");
                listItem.textContent = classKey;
                scheduleListElement.appendChild(listItem);
            }
        }
    }
    else if(selectedSemester === "Spring"){
        scheduleSpring[classKey] = true;
        const scheduleListElement = document.getElementById("scheduleList");
        // Clear any previous content
        scheduleListElement.innerHTML = "";
        for(const classKey in scheduleSpring){
            if(scheduleSpring.hasOwnProperty(classKey)){
                const listItem = document.createElement("li");
                listItem.textContent = classKey;
                scheduleListElement.appendChild(listItem);
            }
        }
    }

}

// Call this function when a class is clicked in the list
function onClassClick(classKey) {
    populateClassInfo(classKey);
}

// Call this function when the button to add to schedule is clicked
function onScheduleClick(classKey){
    semesterSchedule(classKey);
}
