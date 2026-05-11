import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import Contact from './pages/Contact.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import WorkoutPlanPage from './pages/WorkoutPlanPage.jsx'
import MealPlanPage from './pages/MealPlanPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import PlansPage from './pages/PlansPage.jsx'
import MealsPage from './pages/MealsPage.jsx'
import RehabPlanPage from './pages/RehabPlanPage.jsx'
import CreatePlanPage from './pages/CreatePlanPage.jsx'
import WorkoutsPage from './pages/WorkoutsPage.jsx'
import AdminHub from './pages/AdminHub.jsx'
import { Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

function AdminRouteGuard({ children }) {
  const { isAdmin, loading } = useAuth()
  
  if (loading) return <div className="p-12 text-center font-medium text-text-disabled">Authorizing access...</div>
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}



function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/create" element={<CreatePlanPage />} />
          <Route path="/plans/workout/:id" element={<WorkoutPlanPage />} />
          <Route path="/plans/rehab/:id" element={<RehabPlanPage />} />
          <Route path="/plans/diet/:id" element={<MealPlanPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route 
            path="/admin" 
            element={
              <AdminRouteGuard>
                <AdminHub />
              </AdminRouteGuard>
            } 
          />
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
