import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AuthGuard } from './components/auth/AuthGuard'
import { AdminGuard } from './components/admin'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { DroneListPage } from './pages/drones/DroneListPage'
import { DroneDetailPage } from './pages/drones/DroneDetailPage'
import { DroneFormPage } from './pages/drones/DroneFormPage'
import { RaceListPage, RaceDetailPage, RaceFormPage } from './pages/races'
import { PartDetailPage } from './pages/parts'
import { EventListPage, EventDetailPage, EventFormPage, EventAlbumPage } from './pages/events'
import { SettingsPage } from './pages/settings'
import { AdminLogin, AdminDashboard } from './pages/admin'
import { PublicProfile } from './pages/PublicProfile'
import { PublicDrone } from './pages/PublicDrone'
import { PublicRace } from './pages/PublicRace'
import { PublicEvent } from './pages/PublicEvent'
import { usePageTracking } from './hooks/usePageTracking'

function App() {
  // ページビュー追跡
  usePageTracking()

  return (
    <Routes>
      {/* Admin routes (outside Layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminGuard />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Public profile routes */}
        <Route path="/u/:userId" element={<PublicProfile />} />
        <Route path="/u/:userId/drones/:droneId" element={<PublicDrone />} />
        <Route path="/u/:userId/races/:raceId" element={<PublicRace />} />

        {/* Public event route */}
        <Route path="/e/:eventId" element={<PublicEvent />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/drones" element={<DroneListPage />} />
          <Route path="/drones/new" element={<DroneFormPage />} />
          <Route path="/drones/:droneId" element={<DroneDetailPage />} />
          <Route path="/drones/:droneId/edit" element={<DroneFormPage />} />
          <Route path="/drones/:droneId/parts/:partId" element={<PartDetailPage />} />
          <Route path="/races" element={<RaceListPage />} />
          <Route path="/races/new" element={<RaceFormPage />} />
          <Route path="/races/:raceId" element={<RaceDetailPage />} />
          <Route path="/races/:raceId/edit" element={<RaceFormPage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/new" element={<EventFormPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/events/:eventId/edit" element={<EventFormPage />} />
          <Route path="/events/:eventId/album" element={<EventAlbumPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
