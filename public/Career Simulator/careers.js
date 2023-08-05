
// configure Firebase
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var userSkills;
var userClasses  = [];
var userID;

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is logged in
    // You can now access the currently logged-in user's information  
    userID = user.uid;
     
    // Map to the currently logged-in user here
    console.log("User is logged in:", userID, userSkills, userClasses);
    
    // Fetch user skills from Firebase
    database.ref('users/' + userID + '/skills').once('value')
      .then(function(snapshot) {
        userSkills = snapshot.val();

        // Check if userSkills is not null or undefined before calling the function
        if (userSkills) {
          displayUserSkillCount(userSkills);
        }
      })
      .catch(function(error) {
        console.error("Error fetching user skills:", error);
      });
    
    // Fetch user classes from Firebase
    database.ref('users/' + userID + '/classesTaken').once('value')
      .then(function(snapshot) {
        userClasses = snapshot.val() ? Object.keys(snapshot.val()) : [];
      })
      .catch(function(error) {
        console.error("Error fetching user classes:", error);
      });
  } else {
    // User is logged out
    // Handle the case when no user is logged in
    console.log("User is logged out.");
  }
});

// Fetch careers from Firebase
database.ref('/careers').once('value', function (snapshot) {
  var careers = snapshot.val();
  populateCareerSelect(careers);
  console.log("Careers: ", careers);
});


  /*async function getUserTakenClasses() {
    try {
      var userClassesSnapshot = await database.ref('/users/UID1/classesTaken').once('value');
      var userClasses = userClassesSnapshot.val();
      return userClasses ? Object.keys(userClasses) : [];
    } catch (error) {
      console.error("Error fetching user classes:", error);
      return [];
    }
  }*/
  

// Function to display the number of skills a user possesses
function displayUserSkillCount(userSkills) {
  var skillCountElement = document.getElementById("userSkillCount");
  var numSkills = Object.keys(userSkills).length;

  skillCountElement.textContent = numSkills + " Skills Acquired";
}
// Event listener for the "Generate Skills" button
document.getElementById('generateSkillsButton').addEventListener('click', function (event) {
  event.preventDefault(); // Prevent form submission from refreshing the page
  generateSkills();
});

function populateCareerSelect(careers) {
  var careerSelect = document.getElementById('careerSelect');

  for (var career in careers) {
    var option = document.createElement('option');
    option.value = career;
    option.textContent = career;
    careerSelect.appendChild(option);
  }

  updateWelcomeMessage();
}

function updateWelcomeMessage() {
  var careerSelect = document.getElementById('careerSelect');
  var selectedCareer = careerSelect.value;
  var welcomeMessage = document.getElementById('welcomeMessage');
  welcomeMessage.textContent = 'Selected Career: ' + selectedCareer;
}

async function generateSkills() {
  var careerSelect = document.getElementById('careerSelect');
  var intendedCareer = careerSelect.value;

  try {
    var requiredSkillsSnapshot = await database.ref('/careers/' + intendedCareer + '/requiredSkills').once('value');
    var requiredSkills = requiredSkillsSnapshot.val();

    if (requiredSkills && userSkills) {
      var qualifies = userQualifies(requiredSkills, userSkills);

      if (qualifies) {
        clearChart(); // Clear the chart if they qualify
        updateQualificationStatus(true);
        createDoubleBarGraph(requiredSkills, userSkills);
      } else {
    

        var requiredClasses = await findClassesTeachingSkills(requiredSkills);
        var missingClasses = [];

        for (var i = 0; i < requiredClasses.length; i++) {
          var className = requiredClasses[i];
          var isClassTaken = await checkClassAlreadyTaken(className);

          if (!isClassTaken) {
            missingClasses.push(className);
          }
        }

        console.log('Required Classes:', requiredClasses);
        console.log('Missing Classes:', missingClasses);

        updateQualificationStatus(false);
        displayMissingClasses(missingClasses);
        createDoubleBarGraph(requiredSkills, userSkills);
      }
    } else {
      clearChart();
      console.log("Required skills or user skills not found.");
    }
  } catch (error) {
    clearChart();
    console.error("Error fetching data:", error);
  }
}

// create a double bar graph comparing required skills with user skills
function createDoubleBarGraph(requiredSkills, userSkills) {
  var canvas = document.getElementById('skillsChart');
  var ctx = canvas.getContext('2d');

  var skillNames = Object.keys(requiredSkills);
  var requiredSkillLevels = Object.values(requiredSkills);
  var userSkillNames = Object.keys(userSkills);
  var userSkillLevels = Object.values(userSkills);

  test = userSkills;
  
  console.log("User Skills: ", test);

  console.log("Required Skills: ", requiredSkills);

  //remove any key in test that is not in requiredSkills
  for (var skill in test) {
    if (test.hasOwnProperty(skill)) {
      if (!requiredSkills.hasOwnProperty(skill)) {
        delete test[skill];
      }
    }
  }

  if (window.myChart) {
    // Destroy the previous chart if it exists
    window.myChart.destroy();
  }

  // Create a new bar chart using Chart.js library
  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: skillNames,
      datasets: [
        {
          label: 'Required Skill Level',
          data: requiredSkillLevels,
          backgroundColor: 'rgba(5, 74, 145, 0.2)',
          borderColor: 'rgba(5, 74, 145, 1)',
          borderWidth: 1
        },
        {
          label: 'User Skill Level',
          data: test ,
          backgroundColor: 'rgba(194, 1, 20, 0.2)',
          borderColor: 'rgba(194, 1, 20, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });
}

// Clear the skill chart
function clearChart() {
  if (window.myChart) {
    // Destroy chart if it exists
    window.myChart.destroy();
  }
}

function userQualifies(requiredSkills, userSkills) {
  var qualifiedSkills = 0;

  for (var skill in requiredSkills) {
    if (requiredSkills.hasOwnProperty(skill) && userSkills.hasOwnProperty(skill)) {
      var requiredSkillLevel = requiredSkills[skill];
      var userSkillLevel = userSkills[skill];

      if (userSkillLevel >= requiredSkillLevel) {
        qualifiedSkills++;
      }
    }
  }

  var requiredSkillCount = Object.keys(requiredSkills).length;
  return qualifiedSkills >= requiredSkillCount;
}

async function generateSkillsQualificationStatus(requiredSkills, userSkills) {
  var requiredClasses = await findClassesTeachingSkills(requiredSkills, userSkills);
  var missingClasses = [];

  for (var i = 0; i < requiredClasses.length; i++) {
    var className = requiredClasses[i];
    var isClassTaken = await checkClassAlreadyTaken(className);

    if (!isClassTaken) {

      missingClasses.push(className);
    }
  }

  console.log('Required Classes:', requiredClasses);
  console.log('Missing Classes:', missingClasses);

  return missingClasses.length === 0;
}


// Function to check if the class teaches at least one required skill
function hasRequiredSkill(skillsTaught, requiredSkills) {
  for (var skill in requiredSkills) {
    if (requiredSkills.hasOwnProperty(skill) && skillsTaught.hasOwnProperty(skill)) {
      console.log("Skill:", skill);
      return true; // Class teaches at least one required skill
    }
  }

  return false; // Class doesn't teach any of the required skills
}

async function findClassesTeachingSkills(requiredSkills) {
  var requiredClasses = new Set();

  console.log('Required Skills:', requiredSkills);

  for (var skill in requiredSkills) {
    if (requiredSkills.hasOwnProperty(skill)) {
      var requiredSkillLevel = requiredSkills[skill];
      var classTypes = ['core', 'elective'];

      for (var i = 0; i < classTypes.length; i++) {
        var classType = classTypes[i];
        var classPath = '/classes/' + classType;

        var classesSnapshot = await database.ref(classPath).once('value');
        var classes = classesSnapshot.val();

        console.log('Classes:', classes);

        for (var className in classes) {
          if (classes.hasOwnProperty(className)) {
            var classInfo = classes[className];
            var skillsTaught = classInfo.skillsTaught || {};

            var hasRequired = hasRequiredSkill(skillsTaught, requiredSkills);

            // Check if the class teaches at least one required skill
            if (hasRequired) {
              requiredClasses.add(className);
              console.log("Class Name: ", className);
            }
          }
        }
      }
    }
  }

  // Get the classes the user has already taken
  var userTakenClasses = new Set(userClasses);

  // Filter out classes that the user has already taken
  userTakenClasses.forEach(function (className) {
    if (requiredClasses.has(className)) {
      requiredClasses.delete(className);
    }
  });

  var requiredClassesArray = Array.from(requiredClasses);
  console.log('Required Classes:', requiredClassesArray);

  return requiredClassesArray;
}



// Check if a class is already taken by the user
async function checkClassAlreadyTaken(className) {
  try {
    return userClasses.includes(className);
  } catch (error) {
    console.error("Error checking class:", error);
    return false;
  }
}

// Update the qualification status message
function updateQualificationStatus(qualifies) {
  var qualificationStatus = document.getElementById('qualificationStatus');
  var qualificationClasses = document.getElementById('qualificationClasses');

  if (qualifies) {
    qualificationStatus.textContent = 'You currently qualify for this career!';
    displayQualificationMessage("Congratulations! You meet all the required skills for this career.");
  } else {
    qualificationStatus.textContent = 'You do not currently qualify for this career.';
    qualificationClasses.textContent = 'You are missing the following classes to qualify:';
  }
}

// Display a message in the qualification classes box when the user qualifies
function displayQualificationMessage(message) {
  var qualificationClasses = document.getElementById('qualificationClasses');
  qualificationClasses.textContent = ''; // Clear previous contents

  var headingElement = document.createElement('div');
  headingElement.textContent = message;
  headingElement.id = 'qualificationCongrats';
  qualificationClasses.appendChild(headingElement);
}



function displayMissingClasses(missingClasses) {
  var qualificationClasses = document.getElementById('qualificationClasses');
  qualificationClasses.textContent = ''; // Clear previous contents

  var headingElement = document.createElement('div');
  headingElement.textContent = 'Classes you can take to qualify:';
  headingElement.id = 'qualificationClassesHeading';
  qualificationClasses.appendChild(headingElement);

  var classesRef = database.ref('/classes');

  missingClasses.forEach(async function (className) {
    try {
      var classesSnapshot = await classesRef.once('value');
      var classes = classesSnapshot.val();
      var classTypes = ['core', 'elective'];

      for (var i = 0; i < classTypes.length; i++) {
        var classType = classTypes[i];
        var classTypeClasses = classes[classType];

        if (classTypeClasses && classTypeClasses.hasOwnProperty(className)) {
          var classInfo = classTypeClasses[className];
          var classNameFromDatabase = classInfo.name;
          var skillsTaught = classInfo.skillsTaught || {};
          var skillList = Object.entries(skillsTaught)
            .map(([skill, level]) => `${skill}: ${level}`)
            .join(', ');

          var classElement = document.createElement('div');
          classElement.classList.add('className');
          classElement.textContent = `${className} (${classNameFromDatabase})`;

          var skillsElement = document.createElement('div');
          skillsElement.classList.add('skills');
          skillsElement.textContent = `Skills Taught: ${skillList}`;

          qualificationClasses.appendChild(classElement);
          qualificationClasses.appendChild(skillsElement);

          var lineBreak = document.createElement('br');
          qualificationClasses.appendChild(lineBreak);
        }
      }
    } catch (error) {
      console.error("Error fetching classes data:", error);
    }
  });
}
