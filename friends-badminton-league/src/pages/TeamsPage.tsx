import { FormEvent, useEffect, useState } from 'react'
import { STORAGE_KEY, emptyForm, demoTeams, createRoundRobinSchedule } from '../utils'
import { useAdmin } from '../AdminContext'
import type { Team, TeamForm, Match } from '../types'

export function TeamsPage() {
  const { isAdmin } = useAdmin()
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [form, setForm] = useState<TeamForm>(emptyForm)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const storedTeams = localStorage.getItem(`${STORAGE_KEY}-teams`)
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams))
    }

    const storedMatches = localStorage.getItem(`${STORAGE_KEY}-matches`)
    if (storedMatches) {
      setMatches(JSON.parse(storedMatches))
    }
  }, [])

  const handleAddTeam = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isAdmin) {
      return
    }

    const trimmed = {
      playerOne: form.playerOne.trim(),
      playerTwo: form.playerTwo.trim(),
    }

    if (!trimmed.playerOne || !trimmed.playerTwo) {
      setMessage('Enter both player names.')
      return
    }

    setTeams((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        ...trimmed,
      },
    ])
    setForm(emptyForm)
    setMessage('Team added.')
  }

  const handleRemoveTeam = (teamId: string) => {
    if (!isAdmin) {
      return
    }

    setTeams((current) => current.filter((team) => team.id !== teamId))
    setMatches((current) => current.filter((match) => match.teamAId !== teamId && match.teamBId !== teamId))
    setMessage('Team removed.')
  }

  const handleGenerateSchedule = () => {
    if (!isAdmin) {
      return
    }

    if (teams.length < 2) {
      setMessage('Add at least two teams to create a schedule.')
      return
    }

    setMatches(createRoundRobinSchedule(teams))
    setMessage('Schedule generated.')
  }

  const handleLoadDemo = () => {
    if (!isAdmin) {
      return
    }

    setTeams(demoTeams)
    setMatches(createRoundRobinSchedule(demoTeams))
    setMessage('Demo tournament loaded.')
  }

  const handleReset = () => {
    if (!isAdmin) {
      return
    }

    setTeams([])
    setMatches([])
    setForm(emptyForm)
    setMessage('Tournament reset.')
  }

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-teams`, JSON.stringify(teams))
    localStorage.setItem(`${STORAGE_KEY}-matches`, JSON.stringify(matches))
  }, [teams, matches])

  return (
    <div className="container">
      <h2>Teams</h2>

      {message ? <div className="banner">{message}</div> : null}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Team Management</h3>
            <p>
              {isAdmin
                ? 'Add player pairs before generating the schedule.'
                : 'Viewer mode: team changes are available only for admins.'}
            </p>
          </div>
        </div>

        {isAdmin ? (
          <form className="team-form" onSubmit={handleAddTeam}>
            <label>
              Player one
              <input
                type="text"
                value={form.playerOne}
                onChange={(event) =>
                  setForm((current) => ({ ...current, playerOne: event.target.value }))
                }
                placeholder="Alex"
              />
            </label>
            <label>
              Player two
              <input
                type="text"
                value={form.playerTwo}
                onChange={(event) =>
                  setForm((current) => ({ ...current, playerTwo: event.target.value }))
                }
                placeholder="Jordan"
              />
            </label>
            <button className="primary-button" type="submit">
              Add team
            </button>
          </form>
        ) : (
          <div className="viewer-note">Login as admin to add or remove teams.</div>
        )}

        <div className="team-list">
          {teams.length === 0 ? (
            <p className="empty-state">No teams yet. Add a team or load the demo setup.</p>
          ) : (
            teams.map((team) => (
              <article className="team-card" key={team.id}>
                <div>
                  <h3>{team.playerOne} & {team.playerTwo}</h3>
                  <p>Doubles pair</p>
                </div>
                {isAdmin ? (
                  <button type="button" className="inline-button" onClick={() => handleRemoveTeam(team.id)}>
                    Remove
                  </button>
                ) : null}
              </article>
            ))
          )}
        </div>

        {isAdmin && (
          <div className="admin-actions">
            <button className="primary-button" type="button" onClick={handleGenerateSchedule}>
              Generate schedule
            </button>
            <button className="secondary-button" type="button" onClick={handleLoadDemo}>
              Load demo
            </button>
            <button className="ghost-button" type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        )}
      </section>
    </div>
  )
}