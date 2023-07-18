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


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Fetch User 1 from Firebase (This should be done in the app.js file)
    // database.ref('/users/user1').once('value', function(snapshot) {
    //   currentUser = snapshot.val();
    // });
  
    // Function to generate the skills table based on currentUser data
    function generateSkillsTable() {
      const skillTable = document.getElementById('skills');
  
      for (const skillName in currentUser.skills) {
        const skillLevel = currentUser.skills[skillName];
        const classesTaken = getClassesForSkill(skillName);
  
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
  
    // Function to get the classes taken by the user for a specific skill
    function getClassesForSkill(skillName) {
      const classesTaken = [];
      for (const classType in classes) {
        for (const classId in classes[classType]) {
          const classData = classes[classType][classId];
          if (classData.skillsTaught.hasOwnProperty(skillName)) {
            classesTaken.push(classData.name);
          }
        }
      }
      return classesTaken;
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
  
    // Call the function to generate the skills table
    generateSkillsTable();
  });
  