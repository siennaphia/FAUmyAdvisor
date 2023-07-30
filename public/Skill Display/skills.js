
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Firebase
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

  let classes = {};
  database.ref('/classes').once('value', function(snapshot) {
    classes = snapshot.val();
  });

  // Function to generate the skills table based on currentUser data
  function generateSkillsTable(currentUser) {
    const skillTable = document.getElementById('skills');

    for (const skillName in currentUser.skills) {
      const skillLevel = currentUser.skills[skillName];
      const classesTaken = getClasses(skillName, userClasses, classes);

      const row = document.createElement('tr');
      const skillCell = document.createElement('td');
      const levelCell = document.createElement('td');
      const classesCell = document.createElement('td');

      skillCell.textContent = skillName;
      levelCell.textContent = getProficiencyLevel(skillLevel);
      classesCell.textContent = classesTaken.join(', ');

      row.appendChild(skillCell);
      row.appendChild(levelCell);
      row.appendChild(classesCell);

      skillTable.appendChild(row);
    }
  }
  function displayUserSkillCount(userSkills) {
    var skillCountElement = document.getElementById("userSkillCount");
    var numSkills = Object.keys(userSkills).length;
    console.log(numSkills);

    skillCountElement.textContent = "Number of Skills: " + numSkills;
  }
  function getClasses(skillName, userClasses, classes){
      classesWithSkill = []; //array to be filled with classes the passed skill is from
      const classNames = Object.keys(userClasses); //grabbing the ID's of the classes user has taken and putting them in the classNames array
      const coreClasses = classes.core; //seperating out the two types of classes to loop through quickly
      const electClasses= classes.elective;
      for(a in classNames){ //loop through as many times as there are class names
        if(coreClasses[classNames[a]] && coreClasses[classNames[a]].skillsTaught.hasOwnProperty(skillName)){ //check if that class exists in the core classes and if the skill is from that class
          //console.log("Found one!");
          classesWithSkill.push(coreClasses[classNames[a]].name); //if it does exist and is an source of the skill we are looking for then push it classesWithSkill
          }
        if(electClasses[classNames[a]] && electClasses[classNames[a]].skillsTaught.hasOwnProperty(skillName)){ //same check for elective classes
          //console.log("Found one!");
          classesWithSkill.push(electClasses[classNames[a]].name); //if it does exist and is an source of the skill we are looking for then push it classesWithSkill
          }
      }
      return classesWithSkill; // return classesWithSkill which will be an array of all the different classes found for that skill
    }

  // Function to determine proficiency level based on skill level
  function getProficiencyLevel(skillLevel) {
    if (skillLevel < 3) {
      return 'Low';
    } else if (skillLevel <= 5) {
      return 'Medium';
    } else {
      return 'High';
    }
  }

  // Fetch the current user data from Firebase using the UID
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var uid = user.uid;
      database.ref('/users/' + uid).once('value', function(snapshot) {
        var currentUser = snapshot.val();
        console.log(currentUser);
        generateSkillsTable(currentUser);
        displayUserSkillCount(currentUser.skills);
      });
    }
 });
 
 // Log out the userData
function logoutUser() {
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    console.log('User Logged Out!');
    window.location.href = "../index.html"; // Redirect to the login page after logout
  }).catch((error) => {
    // An error happened.
    console.log(error);
  });
}

});
