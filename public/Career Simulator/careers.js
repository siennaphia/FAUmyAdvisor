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

var userSkills = [];
var userClasses = [];
var userID;


firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is logged in
    userID = user.uid;

    // Fetch user skills from Firebase
    database.ref('users/' + userID + '/skills').once('value')
      .then(function(snapshot) {
        userSkills = snapshot.val() ? Object.keys(snapshot.val()) : [];
        displayUserSkillCount(userSkills);
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
      console.log("User is logged in:", userID, userSkills, userClasses);
      
  } else {
    // User is logged out
    // Handle the case when no user is logged in
    console.log("User is logged out.");
    // Clear the skills chart and any other elements as necessary
    clearChart();
    var skillCountElement = document.getElementById("userSkillCount");
    skillCountElement.textContent = "User not logged in";
    userClasses = []; // Set userClasses to an empty array when the user is logged out
  }
});


async function getUserTakenClasses() {
  try {
    // Use the userID variable to fetch the user's classes
    var userClassesSnapshot = await database.ref('/users/' + userID + '/classesTaken').once('value');
    var userClasses = userClassesSnapshot.val();
    return userClasses ? Object.keys(userClasses) : [];
  } catch (error) {
    console.error("Error fetching user classes:", error);
    return [];
  }
}


// Fetch careers from Firebase
database.ref('/careers').once('value', function (snapshot) {
  var careers = snapshot.val();
  populateCareerSelect(careers);
});

// Function to display the number of skills a user possesses
function displayUserSkillCount(userSkills) {
  var skillCountElement = document.getElementById("userSkillCount");
  var numSkills = userSkills.length;

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
        var requiredClasses = await findClassesTeachingSkills(requiredSkills, userClasses);

        console.log('Required Classes:', requiredClasses);
        console.log('Missing Classes:', requiredClasses.length === 0 ? "None" : requiredClasses);

        updateQualificationStatus(false);
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


function createDoubleBarGraph(requiredSkills, userSkills) {
  var canvas = document.getElementById('skillsChart');
  var ctx = canvas.getContext('2d');

  var skillNames = Object.keys(requiredSkills);
  var requiredSkillLevels = Object.values(requiredSkills);
  var userSkillNames = Object.keys(userSkills);
  var userSkillLevels = Object.values(userSkills);

  var userSkillsFiltered = {};

  // Remove any key in userSkills that is not in requiredSkills
  for (var skill in userSkills) {
    if (userSkills.hasOwnProperty(skill) && requiredSkills.hasOwnProperty(skill)) {
      userSkillsFiltered[skill] = userSkills[skill];
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
          data: Object.values(userSkillsFiltered),
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


function clearChart() {
  var canvas = document.getElementById('skillsChart');
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateQualificationStatus(qualifies) {
  var qualificationStatus = document.getElementById('qualificationStatus');

  if (qualifies) {
    qualificationStatus.textContent = 'You qualify for this career!';
  } else {
    qualificationStatus.textContent = 'You do not qualify for this career.';
  }
}

function displayMissingClasses(missingClasses) {
  var missingClassesList = document.getElementById('missingClassesList');
  missingClassesList.innerHTML = '';

  for (var i = 0; i < missingClasses.length; i++) {
    var li = document.createElement('li');
    li.textContent = missingClasses[i];
    missingClassesList.appendChild(li);
  }
}

function userQualifies(requiredSkills, userSkills) {
  var qualifiedSkills = 0;

  for (var skill in requiredSkills) {
    if (requiredSkills.hasOwnProperty(skill) && userSkills.includes(skill)) {
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

async function findClassesTeachingSkills(requiredSkills, userClasses) {
  var requiredClasses = new Set();

  for (var skill in requiredSkills) {
    if (requiredSkills.hasOwnProperty(skill)) {
      var classesSnapshot = await database.ref('/skills/' + skill + '/classes').once('value');
      var classes = classesSnapshot.val();

      if (classes) {
        for (var className in classes) {
          if (classes.hasOwnProperty(className)) {
            requiredClasses.add(className);
          }
        }
      }
    }
  }

  // Get the classes the user has already taken
  var userTakenClasses = userClasses;

  // Filter out classes that the user has already taken
  userTakenClasses.forEach(function(className) {
    if (requiredClasses.has(className)) {
      requiredClasses.delete(className);
    }
  });

  return Array.from(requiredClasses);
}

async function checkClassAlreadyTaken(className) {
  var classSnapshot = await database.ref('users/' + userID + '/classesTaken/' + className).once('value');
  return classSnapshot.exists();
}
