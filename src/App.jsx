import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import Contact from './pages/Contact.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import Contact from "./pages/Contact.jsx"
import WorkoutPlanPage from './pages/WorkoutPlanPage.jsx'
import MealPlanPage from './pages/MealPlanPage.jsx'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/plans/workout/:id" element={<WorkoutPlanPage />} />
          <Route path="/plans/diet/:id" element={<MealPlanPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/contact" element={<Contact />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
