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

let classes = {};
let currentUser = {
  firstName: "",
  lastName: "",
  classesTaken: [],
  acquiredSkills: {}
};

// Fetch classes from Firebase
database.ref('/classes').once('value', snapshot => {
  classes = snapshot.val();
  createCheckboxes();
});

// Fetch User 1 (for now) from Firebase
database.ref('/users/user1').once('value', snapshot => {
  currentUser = snapshot.val() || currentUser;
  createCheckboxes();
});

// Save currentUser to Firebase when 'Save' button is clicked
document.getElementById('saveButton').addEventListener('click', () => {
  // Update the user data in the Firebase
  database.ref('/users/user1').set(currentUser, error => {
    if (error) {
      console.log('Error while saving data:', error);
    } else {
      console.log('Data saved successfully!');
    }
  });
});

// Update currentUser object with the selected classes
function updateSelectedClasses() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  currentUser.classesTaken = Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
}

// Update currentUser object with the entered first and last name
function updateUserName() {
  currentUser.firstName = document.getElementById('firstNameInput').value;
  currentUser.lastName = document.getElementById('lastNameInput').value;
}

// Create checkboxes for classes
function createCheckboxes() {
  if (!classes || Object.keys(classes).length === 0 || !currentUser) {
    return;
  }

  const classesContainer = document.getElementById('classesContainer');
  classesContainer.innerHTML = '';

  const classesTable = document.createElement('table');
  classesTable.classList.add('classes-table');

  let rowCounter = 1;
  let cellCounter = 1;
  let currentRow = document.createElement('tr');
  currentRow.id = `row${rowCounter}`;
  classesTable.appendChild(currentRow);

  for (const classType in classes) {
    for (const classId in classes[classType]) {
      const classData = classes[classType][classId];

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = classId;
      checkbox.value = classId;
      checkbox.addEventListener('change', updateSelectedClasses);

      if (currentUser.classesTaken.includes(classId)) {
        checkbox.checked = true;
      }

      const label = document.createElement('label');
      label.htmlFor = classId;
      label.textContent = classData.name;

      const cell = document.createElement('td');
      cell.appendChild(checkbox);
      cell.appendChild(label);

      currentRow.appendChild(cell);
      cellCounter++;

      // Move to the next row if we have reached the maximum number of columns
      if (cellCounter > 5) {
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

// Initialize the user name inputs
function initializeUserNameInputs() {
  const firstNameInput = document.getElementById('firstNameInput');
  const lastNameInput = document.getElementById('lastNameInput');

  firstNameInput.value = currentUser.firstName || '';
  lastNameInput.value = currentUser.lastName || '';

  firstNameInput.addEventListener('input', updateUserName);
  lastNameInput.addEventListener('input', updateUserName);
}

// Call the initialization functions
createCheckboxes();
initializeUserNameInputs();
