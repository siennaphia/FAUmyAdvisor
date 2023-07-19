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
  var welcomeMessage = document.getElementById('welcomeMessage');
  welcomeMessage.textContent = 'Welcome to MyAdvisor, ' + firstName + ' ' + lastName + '!';
});

// event listener for the "Generate Skills" button
document.getElementById('generateSkillsButton').addEventListener('click', function (event) {
  event.preventDefault(); // prevent form submission from refreshing the page
  generateSkills();
});

// populate the career select dropdown with career options
function populateCareerSelect(careers) {
  var careerSelect = document.getElementById('careerSelect');

  for (var career in careers) {
    var option = document.createElement('option');
    option.value = career;
    option.textContent = career;
    careerSelect.appendChild(option);
  }
}

function generateSkills() {
  var careerSelect = document.getElementById('careerSelect');
  var intendedCareer = careerSelect.value;

  // Fetch the career's required skills from Firebase
  database.ref('/careers/' + intendedCareer + '/requiredSkills').once('value', function (snapshot) {
    var requiredSkills = snapshot.val();

    if (requiredSkills) {
      // Fetch the skills of the specified user from Firebase
      database.ref('/users/UID1/skills').once('value', function (userSnapshot) {
        var userSkills = userSnapshot.val();

        if (userSkills) {
          // Filter userSkills to include only skills relevant to the selected career
          var filteredUserSkills = filterSkillsByCareer(userSkills, requiredSkills);

          // Create a double bar graph comparing required skills with user skills
          createDoubleBarGraph(requiredSkills, filteredUserSkills);

          // Check qualification status
          checkQualification(requiredSkills, filteredUserSkills);

          console.log("User Skills: ", filteredUserSkills);
        } else {
          // Clear the chart if user skills are not found
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

// Filter user skills by career
function filterSkillsByCareer(userSkills, requiredSkills) {
  var filteredSkills = {};

  for (var skill in requiredSkills) {
    if (requiredSkills.hasOwnProperty(skill) && userSkills.hasOwnProperty(skill)) {
      filteredSkills[skill] = userSkills[skill];
    }
  }

  return filteredSkills;
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
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'User Skill Level',
          data: test ,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 5
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

async function checkQualification(requiredSkills, userSkills, intendedCareer) {
  var qualificationStatus = document.getElementById('qualificationStatus');
  var qualificationClasses = document.getElementById('qualificationClasses');

  var requiredClasses = await findClassesTeachingSkills(requiredSkills, intendedCareer);
  var takenClasses = await getTakenClasses();

  var missingClasses = requiredClasses.filter(className => !takenClasses.includes(className));
  console.log('Missing Classes:', missingClasses);

  if (missingClasses.length === 0) {
    updateQualificationStatus(true); // User qualifies for the career
    updateQualificationClasses([]); // Clear the qualification classes display
  } else {
    updateQualificationStatus(false); // User does not qualify for the career
    updateQualificationClasses(missingClasses);
  }
}


// Fetch classes taken by the user from Firebase
async function getTakenClasses() {
  var classesSnapshot = await database.ref('/users/UID1/classesTaken').once('value');
  var classesTaken = classesSnapshot.val();

  if (classesTaken) {
    // Combine core and elective classes into a single array
    var coreClasses = Object.keys(classesTaken.core || {});
    var electiveClasses = Object.keys(classesTaken.elective || {});
    return [...coreClasses, ...electiveClasses];
  } else {
    return []; // User has not taken any classes
  }
}

async function findClassesTeachingSkills(requiredSkills, intendedCareer) {
  var requiredClasses = new Set();

  console.log('Required Skills:', requiredSkills);

  for (var skill in requiredSkills) {
    if (requiredSkills.hasOwnProperty(skill)) {
      var requiredSkillLevel = requiredSkills[skill];
      var classType = skill.startsWith('core') ? 'core' : 'elective';
      var classPath = '/classes/' + classType;

      var classesSnapshot = await database.ref(classPath).once('value');
      var classes = classesSnapshot.val();

      console.log('Classes:', classes);

      for (var className in classes) {
        if (classes.hasOwnProperty(className)) {
          var classInfo = classes[className];
          var skillsTaught = classInfo.skillsTaught || {};

          var missingSkills = getMissingSkills(skillsTaught, requiredSkills);
          console.log('Missing Skills:', missingSkills);

          if (
            missingSkills.length < Object.keys(requiredSkills).length &&
            classInfo.career === intendedCareer &&
            !requiredClasses.has(className) // Exclude duplicate classes
          ) {
            requiredClasses.add(className);
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
  var takenClassesSnapshot = await database.ref('/users/UID1/classesTaken').once('value');
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
      .ref(`/users/UID1/classesTaken/${className}`)
      .once('value')
      .then((snapshot) => {
        resolve(snapshot.exists());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

console.log("Classes Taken: ", className);

// Get missing skills based on skills taught and user skills
function getMissingSkills(skillsTaught, userSkills) {
  var missingSkills = [];

  for (var skill in skillsTaught) {
    if (skillsTaught.hasOwnProperty(skill)) {
      var requiredSkillLevel = skillsTaught[skill];
      var userSkillLevel = userSkills[skill] || 0;

      if (userSkillLevel < requiredSkillLevel) {
        missingSkills.push(skill);
      }
    }
  }

  return missingSkills;
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

// Update the qualification classes display
function updateQualificationClasses(requiredClasses) {
  var qualificationClasses = document.getElementById('qualificationClasses');
  qualificationClasses.textContent = ''; // Clear previous content

  if (requiredClasses.length > 0) {
    qualificationClasses.textContent = 'Classes needed to qualify:';

    requiredClasses.forEach(function (className) {
      var classElement = document.createElement('div');
      classElement.textContent = className;
      qualificationClasses.appendChild(classElement);
    });
  }
}