# FAUmyAdvisor

## Academic Record Management and Career Matching

This project aims to create a web application that assists users in managing their academic records, exploring available courses, providing supplemental information about classes, and matching their acquired skills with suitable careers. The application allows users to log in, add completed courses, search for classes, view available courses based on completed classes, access additional information about specific classes, and obtain career recommendations based on their skill proficiencies.

## Features

- **Account Login**: Users can log in to the application using their username/email and password. If the login is successful, the main page is displayed. If the login fails, an error message is shown.

- **Managing Academic Records**: Users can add completed courses to their account. They can select the term in which the courses were taken and choose from a list of courses offered during that semester. Selected courses are added to the user's academic record.

- **Searching for Classes**: Users can search for classes by entering a search string. The system queries for a list of available classes in the user's major and displays the matching classes based on the search string.

- **Viewing Available Courses**: Users can explore future semesters and view available courses. They can select a semester from a dropdown menu, and the system retrieves a list of courses available in the chosen semester. The system also checks prerequisite requirements and displays courses that meet those requirements.

- **Viewing Supplemental Information**: Users can select a class and view additional information. The system retrieves course descriptions and professor ratings from external sources, allowing users to see the course description and professor ratings.

- **Matching Acquired Skills with Careers**: The system analyzes the courses taken by the user and determines the acquired skills. Based on the acquired skills, the system suggests suitable careers. The system also provides information on how the user's skill proficiencies match up to their ideal career.

- **Editing Semester Stored in Database**: Users can edit the contents of a semester stored in the database.

## System Architecture

The project utilizes a Firebase database  for storing course information, user data, and career requirements. The database structure is as follows:

```
{
  "careers": {
    // Career information and required skills
  },
  "classes": {
    "core": {
      // Core class information
    },
    "elective": {
      // Elective class information
    }
  },
  "currentUser": {
    // Current user's data (auth, classes taken, skills)
  },
  "users": {
    // User information and data
  }
}
```

Please refer to the project code and documentation for detailed implementation and usage instructions.

## Contributors

- Sienna Gaita-Monjaraz
- Maximo Mejia
- Owen Levine
- Cassidy Wilson
