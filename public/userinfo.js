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

function save(){
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    const firstName = document.getElementById('firstNameInput').value;
    const lastName = document.getElementById('lastNameInput').value;
    const careerSelect = document.getElementById('careerSelect');
    const intendedCareer = careerSelect.value;
    console.log(firstName, lastName, careerSelect, intendedCareer)

    // Update the user data in Firebase under the user's UID
    database.ref('/users/' + currentUser.uid).update({
      firstName: firstName,
      lastName: lastName,
      intendedCareer: intendedCareer,
      classesTaken: getCheckedClasses(),
    })
      .then(() => {
        // Show a success message when the data is saved
        const messageElement = document.getElementById('saveMessage');
        messageElement.innerHTML = 'Classes saved successfully!';
        messageElement.style.color = 'green';
        setTimeout(() => {
          messageElement.innerText = '';
        }, 3000); // Clear the message after 3 seconds
      })
      .catch((error) => {
        // Show an error message if the data couldn't be saved
        const messageElement = document.getElementById('saveMessage');
        messageElement.innerHTML = 'Error saving classes. Please try again.';
        messageElement.style.color = 'red';
        console.error('Error saving classes:', error);
        setTimeout(() => {
          messageElement.innerText = '';
        }, 5000); // Clear the message after 5 seconds
      });
  }
}

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

        const currentUser = firebase.auth().currentUser; // Fetch the current user

        if (currentUser) {
          const classesTaken = currentUser.classesTaken || [];

          if (isChecked) {
            // Add the class to currentUser.classesTaken if it's not already present
            if (!classesTaken.includes(classId)) {
              classesTaken.push(classId);
            }
          } else {
            // Remove the class from currentUser.classesTaken
            const index = classesTaken.indexOf(classId);
            if (index !== -1) {
              classesTaken.splice(index, 1);
            }
          }

          // Update the classesTaken value in the database
          database.ref('/users/' + currentUser.uid).update({ classesTaken: classesTaken });
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
  // Add click event listener to the "Log Out" button
  document.getElementById("logoutButton").addEventListener("click", logoutUser);

  // Fetch the current user from Firebase
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // Fetch user data from Firebase under the user's UID
      database.ref('/users/' + user.uid).once('value')
        .then((snapshot) => {
          const userData = snapshot.val();

          if (userData) {
            // Populate the input fields and select the correct option in the career select
            document.getElementById('firstNameInput').value = userData.firstName;
            document.getElementById('lastNameInput').value = userData.lastName;
            document.getElementById('careerSelect').value = userData.intendedCareer;

            // Check the checkboxes for the classes taken by the user
            const classesTaken = userData.classesTaken || [];
            for (const classId of classesTaken) {
              const checkbox = document.getElementById(classId);
              if (checkbox) {
                checkbox.checked = true;
                
              }
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  });
});

// Log out the user
function logoutUser() {
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    window.location.href = "index.html"; // Redirect to the login page after logout
  }).catch((error) => {
    // An error happened.
    console.log(error);
  });
}

// Helper function to retrieve the checked classes
function getCheckedClasses() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const checkedClasses = [];

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      checkedClasses.push(checkbox.id);
    }
  });

  return checkedClasses;
}
