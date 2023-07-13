//  web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

let careers = {};
let classes = {};
let currentUser = {};

// Fetch careers from Firebase
database.ref('/careers').once('value', function(snapshot) {
  careers = snapshot.val();
  populateCareerSelect();
});

// Fetch classes from Firebase
database.ref('/classes').once('value', function(snapshot) {
  classes = snapshot.val();
  createCheckboxes();
});

// Populate the career select dropdown with career options
function populateCareerSelect() {
  const careerSelect = document.getElementById('careerSelect');

  for (const career in careers) {
    const option = document.createElement('option');
    option.value = career;
    option.textContent = career;
    careerSelect.appendChild(option);
  }
}

// Save currentUser to Firebase when 'Save' button is clicked
document.getElementById('saveButton').addEventListener('click', function() {
  const firstName = document.getElementById('firstNameInput').value;
  const lastName = document.getElementById('lastNameInput').value;
  const careerSelect = document.getElementById('careerSelect');
  const intendedCareer = careerSelect.value;

  // Update the user data in Firebase
  database.ref('/users/user1').update({
    firstName: firstName,
    lastName: lastName,
    intendedCareer: intendedCareer
  });
});

// Create checkboxes for the classes and display them in a table
function createCheckboxes() {
  const classesContainer = document.getElementById('classesContainer');
  const classesTable = document.createElement('table');
  classesTable.classList.add('classes-table');

  let rowCounter = 1;
  let cellCounter = 1;
  let currentRow = document.createElement('tr');
  currentRow.id = `row${rowCounter}`;
  classesTable.appendChild(currentRow);

  const numColumns = 8; // Number of columns in the table

  for (const classType in classes) {
    for (const classId in classes[classType]) {
      const classData = classes[classType][classId];

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = classId;
      checkbox.value = classId;

      checkbox.addEventListener('change', function(e) {
        const classId = e.target.value;
        const isChecked = e.target.checked;

        if (isChecked) {
          // Add the class to currentUser.classesTaken if it's not already present
          if (!currentUser.classesTaken.includes(classId)) {
            currentUser.classesTaken.push(classId);
          }
        } else {
          // Remove the class from currentUser.classesTaken
          const index = currentUser.classesTaken.indexOf(classId);
          if (index !== -1) {
            currentUser.classesTaken.splice(index, 1);
          }
        }
      });

      const label = document.createElement('label');
      label.htmlFor = classId;
      label.textContent = classData.name;

      const cell = document.createElement('td');
      cell.appendChild(checkbox);
      cell.appendChild(label);

      currentRow.appendChild(cell);
      cellCounter++;

      // Move to the next row if we have reached the maximum number of columns
      if (cellCounter > numColumns) {
        rowCounter++;
        cellCounter = 1;
        currentRow = document.createElement('tr');
        currentRow.id = `row${rowCounter}`;
        classesTable.appendChild(currentRow);
      }
    }
  }

  // Remove empty rows
  while (rowCounter <= 5) {
    const emptyRow = document.getElementById(`row${rowCounter}`);
    if (emptyRow) {
      emptyRow.parentNode.removeChild(emptyRow);
    }
    rowCounter++;
  }

  classesContainer.appendChild(classesTable);
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Fetch User 1 from Firebase
  database.ref('/users/user1').once('value', function(snapshot) {
    currentUser = snapshot.val();

    // Check if currentUser data exists and has valid values
    if (currentUser && currentUser.firstName && currentUser.lastName && currentUser.intendedCareer) {
      // Populate the input fields and select the correct option in the career select
      document.getElementById('firstNameInput').value = currentUser.firstName;
      document.getElementById('lastNameInput').value = currentUser.lastName;
      document.getElementById('careerSelect').value = currentUser.intendedCareer;
    }
  });
});
