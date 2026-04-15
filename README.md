# Eu-App-Frontend

## Overview
This is the frontend of the EU Health & Fitness application.  
It provides the user interface for managing workouts, meals, and progress tracking.

---

## Tech Stack
- React (or your framework)
- Node.js
- npm

---

## Getting Started

### 1. Clone the repository

git clone https://github.com/malakhamshary13/Eu-App-Backend.git


---

### 2. Install dependencies

npm install


---

### 3. Environment Variables

Create a `.env` file in the root directory:


VITE_API_BASE_URL=http://localhost:8000


Adjust the URL based on your backend server.

---

### 4. Run the development server

npm run dev


The app should now be running at:

http://localhost:5173


---

## Project Structure

src/
├── components/
├── pages/
├── services/ # API calls
├── hooks/
└── utils/


---

## Branching Strategy
- `main` → production-ready code
  
- `dev` → integration branch
  
- `feature/*` → individual features

Example:

feature/EU-12-meal-scheduling-ui


---

## Scripts

npm run dev # Start development server

npm run build # Build for production

npm run preview # Preview production build


---

## Notes
- Make sure the backend server is running before testing features
- API endpoints are configured in the `.env` file
