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

// initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// fetch careers from Firebase
database.ref('/careers').once('value', function (snapshot) {
  var careers = snapshot.val();
  populateCareerSelect(careers);
});

// fetch current user's name from Firebase and update the welcome message
database.ref('/users/UID1').once('value', function (snapshot) {
  var currentUser = snapshot.val();
  var firstName = currentUser.firstName;
  var lastName = currentUser.lastName;
  //var welcomeMessage = document.getElementById('welcomeMessage');
  //welcomeMessage.textContent = 'Welcome to MyAdvisor, ' + firstName + ' ' + lastName + '!';
});

// event listener for the "Generate Skills" button
document.getElementById('generateSkillsButton').addEventListener('click', function (event) {
  event.preventDefault(); // prevent form submission from refreshing the page
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

  // Call updateWelcomeMessage to initialize the welcome message with the first selected career
  updateWelcomeMessage();
}

function updateWelcomeMessage() {
  var careerSelect = document.getElementById('careerSelect');
  var selectedCareer = careerSelect.value;
  var welcomeMessage = document.getElementById('welcomeMessage');
  welcomeMessage.textContent = 'Selected Career: ' + selectedCareer;
}

// fetch required skills and user skills from Firebase and generate the skills chart
function generateSkills() {
  var careerSelect = document.getElementById('careerSelect');
  var intendedCareer = careerSelect.value;

  // fetch the career's required skills from Firebase
  database.ref('/careers/' + intendedCareer + '/requiredSkills').once('value', function (snapshot) {
    var requiredSkills = snapshot.val();

    if (requiredSkills) {
      // fetch the skills of the specified user from Firebase
      database.ref('users/UID1/skills').once('value', function (userSnapshot) {
        var userSkills = userSnapshot.val();

        if (userSkills) {
          // clone the userSkills object to avoid modification
          var userSkillsClone = Object.assign({}, userSkills);

          // create a double bar graph comparing required skills with user skills
          createDoubleBarGraph(requiredSkills, userSkillsClone);

          // check qualification status
          checkQualification(requiredSkills, userSkills);
        } else {
          // clear the chart if user skills are not found
          clearChart();
          console.log("User skills not found.");
        }
      });
    } else {
      clearChart();
      console.log("Required skills for the selected career not found.");
    }
  });
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

// Check qualification status based on required skills and user skills
async function checkQualification(requiredSkills, userSkills) {
  var qualificationStatus = document.getElementById('qualificationStatus');
  var qualificationClasses = document.getElementById('qualificationClasses');

  var requiredClasses = await findClassesTeachingSkills(requiredSkills);
  var missingClasses = [];

  for (var i = 0; i < requiredClasses.length; i++) {
    var className = requiredClasses[i];
    var isClassTaken = await checkClassAlreadyTaken(className);
    
    if (!isClassTaken) {
      missingClasses.push(className);
    }
  }

  console.log('Missing Classes:', missingClasses);

  if (missingClasses.length === 0) {
    updateQualificationStatus(true); // User qualifies for the career
    updateQualificationClasses([]); // Clear the qualification classes display
  } else {
    updateQualificationStatus(false); // User does not qualify for the career
    updateQualificationClasses(missingClasses);
  }
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

// Find classes that teach the required skills
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

  var requiredClassesArray = Array.from(requiredClasses);
  console.log('Required Classes:', requiredClassesArray);

  return requiredClassesArray;
}

// Check if prerequisites are taken by the user
async function checkPrerequisitesTaken(prerequisites) {
  var takenClassesSnapshot = await database.ref('/user/UID1/classesTaken').once('value');
  var takenClasses = takenClassesSnapshot.val();

  for (var classType in prerequisites) {
    if (prerequisites.hasOwnProperty(classType)) {
      var className = prerequisites[classType];
      if (!takenClasses || !takenClasses[classType] || !takenClasses[classType][className]) {
        return false; // Prerequisite not taken by the user
      }
    }
  }

  return true; // All prerequisites taken by the user
}

// Check if a class is already taken by the user
async function checkClassAlreadyTaken(className) {
  return new Promise((resolve, reject) => {
    database
      .ref(`/user/UID1/classesTaken/${className}`)
      .once('value')
      .then((snapshot) => {
        resolve(snapshot.exists());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Update the qualification status message
function updateQualificationStatus(qualifies) {
  var qualificationStatus = document.getElementById('qualificationStatus');

  if (qualifies) {
    qualificationStatus.textContent = 'You currently qualify for this career!';
  } else {
    qualificationStatus.textContent = 'You do not currently qualify for this career.';
  }
}
function updateQualificationClasses(requiredClasses) {
  var qualificationClasses = document.getElementById('qualificationClasses');
  qualificationClasses.textContent = ''; // Clear previous contents

  if (requiredClasses.length > 0) {
    // Create a new div for the heading
    var headingElement = document.createElement('div');
    headingElement.textContent = 'Classes you can take to qualify:';
    headingElement.id = 'qualificationClassesHeading'; // Add the CSS ID to the heading
    qualificationClasses.appendChild(headingElement);

    var classesRef = database.ref('/classes');

    requiredClasses.forEach(function (className) {
      classesRef.once('value', function (snapshot) {
        var classTypes = ['core', 'elective'];
        for (var i = 0; i < classTypes.length; i++) {
          var classType = classTypes[i];
          var classTypeClasses = snapshot.child(classType).val();

          if (classTypeClasses && classTypeClasses.hasOwnProperty(className)) {
            var classInfo = classTypeClasses[className];
            var classNameFromDatabase = classInfo.name;
            var skillsTaught = classInfo.skillsTaught || {};
            var skillList = Object.entries(skillsTaught)
              .map(([skill, level]) => `${skill}: ${level}`)
              .join(', ');

           // ... your existing updateQualificationClasses function ...

          // Inside the function, modify the class and skills elements creation as follows:
          var classElement = document.createElement('div');
          classElement.classList.add('className'); // Add the className class
          classElement.textContent = `${className} (${classNameFromDatabase})`;

          var skillsElement = document.createElement('div');
          skillsElement.classList.add('skills'); // Add the skills class
          skillsElement.textContent = `Skills Taught: ${skillList}`;


            // Append both div elements to the qualificationClasses container
            qualificationClasses.appendChild(classElement);
            qualificationClasses.appendChild(skillsElement);

            // Add a line break between each class name and skills section
            var lineBreak = document.createElement('br');
            qualificationClasses.appendChild(lineBreak);
          }
        }
      });
    });
  }
}


