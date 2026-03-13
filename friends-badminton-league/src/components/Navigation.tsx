import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../AdminContext'
import { TOURNAMENT_NAME, emptyAdminForm } from '../utils'
import type { AdminForm } from '../types'

export function Navigation() {
  const { isAdmin, login, logout } = useAdmin()
  const [adminForm, setAdminForm] = useState<AdminForm>(emptyAdminForm)
  const [message, setMessage] = useState<string>('')

  const handleAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const success = login(adminForm.username, adminForm.password)
    if (success) {
      setAdminForm(emptyAdminForm)
      setMessage('Admin access granted.')
    } else {
      setMessage('Invalid admin username or password.')
    }
  }

  const handleAdminLogout = () => {
    logout()
    setAdminForm(emptyAdminForm)
    setMessage('Logged out. Viewer mode enabled.')
  }

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-title-link">
          <h1 className="nav-title">{TOURNAMENT_NAME}</h1>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/teams">Teams</Link></li>
          <li><Link to="/fixtures">Fixtures</Link></li>
          <li><Link to="/results">Results</Link></li>
          <li><Link to="/standings">Standings</Link></li>
        </ul>
        <div className="nav-admin">
          <div className="access-panel">
            <div className="access-header">
              <span className={`role-badge ${isAdmin ? 'admin' : 'viewer'}`}>
                {isAdmin ? 'Admin mode' : 'Viewer mode'}
              </span>
              {isAdmin ? (
                <button className="ghost-button" type="button" onClick={handleAdminLogout}>
                  Logout
                </button>
              ) : null}
            </div>

            {isAdmin ? (
              <p className="access-copy">You can manage teams, fixtures, and scores.</p>
            ) : (
              <>
                <p className="access-copy">
                  Visitors can view results and standings. Sign in as admin to edit tournament data.
                </p>
                <form className="admin-form" onSubmit={handleAdminLogin}>
                  <label>
                    Username
                    <input
                      type="text"
                      value={adminForm.username}
                      onChange={(event) =>
                        setAdminForm((current) => ({ ...current, username: event.target.value }))
                      }
                      placeholder="admin (optional)"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={adminForm.password}
                      onChange={(event) =>
                        setAdminForm((current) => ({ ...current, password: event.target.value }))
                      }
                      placeholder="Enter password"
                    />
                  </label>
                  <button className="primary-button" type="submit">
                    Admin login
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      {message && <div className="nav-message">{message}</div>}
    </nav>
  )
}