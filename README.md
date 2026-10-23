
# Notespace

A professional notes application for organizing notes and documents in one workspace.

## Features

- Firebase authentication with email and password
- Google sign-in and password reset
- Notes creation and editing
- Folders, tags, search, and sorting
- Favorites, pinned notes, archive, and trash
- Grid and list views
- Document import and PDF viewing
- Automatic saving and reminders
- Responsive interface with light and dark styling

## Technology Stack

- React
- Vite
- JavaScript
- Firebase Authentication
- CSS
- Automated tests

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository and open the project directory:

```bash
git clone https://github.com/Lahari-062/notespace-.git
cd notespace-
npm install
```

Create a `.env.local` file using the environment variables required by the project. Refer to the Firebase configuration used by the application. Do not commit credentials or secret values.

### Run the application

```bash
npm run dev
```

### Run tests

```bash
npm test -- --run
```

## Testing

The project includes automated tests for workspace functionality, UI components, and OTP bridge error handling. Test results should be verified against the current code before release.

## Project Status

The application is undergoing frontend redesign and backend testing. Some authentication and deployment limitations may require further validation before production use.
