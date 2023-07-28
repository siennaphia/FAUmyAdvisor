
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

  async function getClasses(skillName, userClasses) {
    try {
      const coreSnapshot = await database.ref('/classes/core').once('value');
      const electiveSnapshot = await database.ref('/classes/elective').once('value');

      const coreClasses = coreSnapshot.val();
      const electiveClasses = electiveSnapshot.val();

      classesWithSkill = [];
      const classNames = Object.keys(userClasses);

      for (const className of classNames) {
        if (coreClasses[className] && coreClasses[className].skillsTaught.hasOwnProperty(skillName)) {
          classesWithSkill.push(coreClasses[className].name);
        }
        if (electiveClasses[className] && electiveClasses[className].skillsTaught.hasOwnProperty(skillName)) {
          classesWithSkill.push(electiveClasses[className].name);
        }
      }

      return classesWithSkill;
    } catch (error) {
      console.error("Error fetching classes:", error);
      return [];
    }
  }

  // Function to generate the skills table based on currentUser data
  async function generateSkillsTable(currentUser) {
    const skillTable = document.getElementById('skills');

    for (const skillName in currentUser.skills) {
      const skillLevel = currentUser.skills[skillName];
      const classesTaken = await getClasses(skillName, currentUser.classesTaken);

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
      console.log('User authenticated:', user);
      var uid = user.uid;
      database.ref('/users/' + uid).once('value', function(snapshot) {
        var currentUser = snapshot.val();
        console.log('Current user data:', currentUser);
        generateSkillsTable(currentUser);
        displayUserSkillCount(currentUser.skills);
      });
    } else {
      console.log('No user authenticated.');
    }
  });

  function displayUserSkillCount(userSkills) {
    var skillCountElement = document.getElementById("userSkillCount");
    var numSkills = Object.keys(userSkills).length;
    console.log(numSkills);

    skillCountElement.textContent = "Skills Acquired: " + numSkills;
  }
});