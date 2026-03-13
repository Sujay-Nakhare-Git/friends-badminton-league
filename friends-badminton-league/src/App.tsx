import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AdminProvider } from './AdminContext'
import { Navigation } from './components/Navigation'
import { HomePage } from './pages/HomePage'
import { TeamsPage } from './pages/TeamsPage'
import { FixturesPage } from './pages/FixturesPage'
import { ResultsPage } from './pages/ResultsPage'
import { StandingsPage } from './pages/StandingsPage'

function App() {
  return (
    <AdminProvider>
      <Router>
        <div className="app-shell">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/fixtures" element={<FixturesPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/standings" element={<StandingsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AdminProvider>
  )
}

export default App
