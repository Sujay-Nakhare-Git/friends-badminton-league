import { FormEvent, useEffect, useMemo, useState } from 'react'

type Team = {
  id: string
  playerOne: string
  playerTwo: string
}

type Match = {
  id: string
  round: number
  teamAId: string
  teamBId: string
  scoreA: string
  scoreB: string
  completed: boolean
}

type TeamForm = {
  playerOne: string
  playerTwo: string
}

type AdminForm = {
  username: string
  password: string
}

type Standing = {
  teamId: string
  teamName: string
  played: number
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  difference: number
  tablePoints: number
}

const TOURNAMENT_NAME = 'Friends Badminton League Season 3'
const STORAGE_KEY = 'badminton-tournament-manager'
const ADMIN_SESSION_KEY = 'badminton-admin-session'
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'FBLSeason3!'

const emptyForm: TeamForm = {
  playerOne: '',
  playerTwo: '',
}

const emptyAdminForm: AdminForm = {
  username: '',
  password: '',
}

const demoTeams: Team[] = [
  {
    id: crypto.randomUUID(),
    playerOne: 'Ava',
    playerTwo: 'Liam',
  },
  {
    id: crypto.randomUUID(),
    playerOne: 'Mia',
    playerTwo: 'Noah',
  },
  {
    id: crypto.randomUUID(),
    playerOne: 'Ella',
    playerTwo: 'Ethan',
  },
  {
    id: crypto.randomUUID(),
    playerOne: 'Zoe',
    playerTwo: 'Lucas',
  },
]

const getTeamLabel = (team: Team) => `${team.playerOne} & ${team.playerTwo}`

const getHeadToHeadWinner = (leftTeamId: string, rightTeamId: string, matches: Match[]) => {
  let leftWins = 0
  let rightWins = 0

  matches.forEach((match) => {
    if (!match.completed) {
      return
    }

    const isRelevantMatch =
      (match.teamAId === leftTeamId && match.teamBId === rightTeamId) ||
      (match.teamAId === rightTeamId && match.teamBId === leftTeamId)

    if (!isRelevantMatch) {
      return
    }

    const scoreA = Number(match.scoreA)
    const scoreB = Number(match.scoreB)

    if (Number.isNaN(scoreA) || Number.isNaN(scoreB)) {
      return
    }

    if (match.teamAId === leftTeamId) {
      if (scoreA > scoreB) {
        leftWins += 1
      } else if (scoreB > scoreA) {
        rightWins += 1
      }
      return
    }

    if (scoreA > scoreB) {
      rightWins += 1
    } else if (scoreB > scoreA) {
      leftWins += 1
    }
  })

  if (leftWins === rightWins) {
    return 0
  }

  return leftWins > rightWins ? -1 : 1
}

const createRoundRobinSchedule = (teams: Team[]): Match[] => {
  if (teams.length < 2) {
    return []
  }

  const placeholders = teams.map((team) => team.id)
  const hasBye = placeholders.length % 2 === 1

  if (hasBye) {
    placeholders.push('BYE')
  }

  const rotation = [...placeholders]
  const totalRounds = rotation.length - 1
  const matches: Match[] = []

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    for (let i = 0; i < rotation.length / 2; i += 1) {
      const teamAId = rotation[i]
      const teamBId = rotation[rotation.length - 1 - i]

      if (teamAId !== 'BYE' && teamBId !== 'BYE') {
        matches.push({
          id: crypto.randomUUID(),
          round: roundIndex + 1,
          teamAId,
          teamBId,
          scoreA: '',
          scoreB: '',
          completed: false,
        })
      }
    }

    const fixed = rotation[0]
    const rest = rotation.slice(1)
    rest.unshift(rest.pop()!)
    rotation.splice(0, rotation.length, fixed, ...rest)
  }

  return matches
}

const App = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [form, setForm] = useState<TeamForm>(emptyForm)
  const [adminForm, setAdminForm] = useState<AdminForm>(emptyAdminForm)
  const [isAdmin, setIsAdmin] = useState(false)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const adminSession = window.sessionStorage.getItem(ADMIN_SESSION_KEY)

    setIsAdmin(adminSession === 'true')

    if (!saved) {
      return
    }

    try {
      const parsed = JSON.parse(saved) as { teams?: Team[]; matches?: Match[] }
      setTeams(parsed.teams ?? [])
      setMatches(parsed.matches ?? [])
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teams,
        matches,
      }),
    )
  }, [teams, matches])

  const teamMap = useMemo(() => {
    return new Map(teams.map((team) => [team.id, team]))
  }, [teams])

  const rounds = useMemo(() => {
    return matches.reduce<Record<number, Match[]>>((accumulator, match) => {
      if (!accumulator[match.round]) {
        accumulator[match.round] = []
      }

      accumulator[match.round].push(match)
      return accumulator
    }, {})
  }, [matches])

  const standings = useMemo<Standing[]>(() => {
    const base = teams.map((team) => ({
      teamId: team.id,
      teamName: getTeamLabel(team),
      played: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      difference: 0,
      tablePoints: 0,
    }))

    const table = new Map(base.map((entry) => [entry.teamId, entry]))

    matches.forEach((match) => {
      if (!match.completed) {
        return
      }

      const teamA = table.get(match.teamAId)
      const teamB = table.get(match.teamBId)
      const scoreA = Number(match.scoreA)
      const scoreB = Number(match.scoreB)

      if (!teamA || !teamB || Number.isNaN(scoreA) || Number.isNaN(scoreB)) {
        return
      }

      teamA.played += 1
      teamB.played += 1
      teamA.pointsFor += scoreA
      teamA.pointsAgainst += scoreB
      teamB.pointsFor += scoreB
      teamB.pointsAgainst += scoreA

      if (scoreA > scoreB) {
        teamA.wins += 1
        teamA.tablePoints += 3
        teamB.losses += 1
      } else if (scoreB > scoreA) {
        teamB.wins += 1
        teamB.tablePoints += 3
        teamA.losses += 1
      }
    })

    return Array.from(table.values())
      .map((entry) => ({
        ...entry,
        difference: entry.pointsFor - entry.pointsAgainst,
      }))
      .sort((left, right) => {
        if (right.wins !== left.wins) {
          return right.wins - left.wins
        }

        const headToHeadResult = getHeadToHeadWinner(left.teamId, right.teamId, matches)

        if (headToHeadResult !== 0) {
          return headToHeadResult
        }

        if (right.difference !== left.difference) {
          return right.difference - left.difference
        }

        return left.teamName.localeCompare(right.teamName)
      })
  }, [matches, teams])

  const completedMatches = matches.filter((match) => match.completed).length
  const totalRounds = Object.keys(rounds).length

  const handleAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const username = adminForm.username.trim().toLowerCase()
    const password = adminForm.password.trim()

    const validUsername = username === '' || username === ADMIN_USERNAME

    if (validUsername && password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
      setAdminForm(emptyAdminForm)
      setMessage('Admin access granted.')
      return
    }

    setMessage('Invalid admin username or password.')
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setAdminForm(emptyAdminForm)
    setMessage('Logged out. Viewer mode enabled.')
  }

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

  const handleScoreChange = (matchId: string, field: 'scoreA' | 'scoreB', value: string) => {
    if (!isAdmin) {
      return
    }

    if (value !== '' && !/^\d+$/.test(value)) {
      return
    }

    setMatches((current) =>
      current.map((match) => {
        if (match.id !== matchId) {
          return match
        }

        const updated = {
          ...match,
          [field]: value,
        }

        const scoreA = Number(updated.scoreA)
        const scoreB = Number(updated.scoreB)
        const completed = updated.scoreA !== '' && updated.scoreB !== '' && scoreA !== scoreB

        return {
          ...updated,
          completed,
        }
      }),
    )
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Free-hosting ready</p>
          <h1>{TOURNAMENT_NAME}</h1>
          <p className="hero-copy">
            Run a doubles event from one page: add teams, build the fixture list, record scores,
            and track the standings live.
          </p>
        </div>
        <div className="hero-side">
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

          {isAdmin ? (
            <div className="hero-actions">
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
          ) : null}
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Teams</span>
          <strong>{teams.length}</strong>
        </article>
        <article className="stat-card">
          <span>Rounds</span>
          <strong>{totalRounds}</strong>
        </article>
        <article className="stat-card">
          <span>Matches played</span>
          <strong>
            {completedMatches}/{matches.length}
          </strong>
        </article>
      </section>

      {message ? <div className="banner">{message}</div> : null}

      <main className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Teams</h2>
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
                    <h3>{getTeamLabel(team)}</h3>
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
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Schedule &amp; scores</h2>
              <p>
                {isAdmin
                  ? 'Round-robin fixtures for all doubles teams.'
                  : 'Viewer mode: results and standings are visible, score edits require admin access.'}
              </p>
            </div>
          </div>

          <div className="round-list">
            {matches.length === 0 ? (
              <p className="empty-state">Generate a schedule to start entering scores.</p>
            ) : (
              Object.entries(rounds)
                .sort(([left], [right]) => Number(left) - Number(right))
                .map(([round, roundMatches]) => (
                  <div className="round-card" key={round}>
                    <h3>Round {round}</h3>
                    <div className="match-list">
                      {roundMatches.map((match) => {
                        const teamA = teamMap.get(match.teamAId)
                        const teamB = teamMap.get(match.teamBId)

                        return (
                          <article className="match-card" key={match.id}>
                            <div className="match-teams">
                              <span>{teamA ? getTeamLabel(teamA) : 'Unknown team'}</span>
                              <span className="versus">vs</span>
                              <span>{teamB ? getTeamLabel(teamB) : 'Unknown team'}</span>
                            </div>
                            <div className="score-inputs">
                              {isAdmin ? (
                                <input
                                  aria-label={`${teamA ? getTeamLabel(teamA) : 'Team A'} score`}
                                  inputMode="numeric"
                                  placeholder="0"
                                  value={match.scoreA}
                                  onChange={(event) =>
                                    handleScoreChange(match.id, 'scoreA', event.target.value)
                                  }
                                />
                              ) : (
                                <div className="score-box">{match.scoreA || '—'}</div>
                              )}
                              <span>-</span>
                              {isAdmin ? (
                                <input
                                  aria-label={`${teamB ? getTeamLabel(teamB) : 'Team B'} score`}
                                  inputMode="numeric"
                                  placeholder="0"
                                  value={match.scoreB}
                                  onChange={(event) =>
                                    handleScoreChange(match.id, 'scoreB', event.target.value)
                                  }
                                />
                              ) : (
                                <div className="score-box">{match.scoreB || '—'}</div>
                              )}
                            </div>
                            <p className={`status-chip ${match.completed ? 'complete' : 'pending'}`}>
                              {match.completed ? 'Complete' : 'Awaiting valid score'}
                            </p>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>
      </main>

      <section className="panel standings-panel">
        <div className="panel-heading">
          <div>
            <h2>Standings</h2>
            <p>Teams are sorted by wins, head-to-head, then score difference.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>L</th>
                <th>PF</th>
                <th>PA</th>
                <th>Diff</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-table">
                    Standings will appear after teams are added.
                  </td>
                </tr>
              ) : (
                standings.map((entry, index) => (
                  <tr key={entry.teamId}>
                    <td>{index + 1}</td>
                    <td>{entry.teamName}</td>
                    <td>{entry.played}</td>
                    <td>{entry.wins}</td>
                    <td>{entry.losses}</td>
                    <td>{entry.pointsFor}</td>
                    <td>{entry.pointsAgainst}</td>
                    <td>{entry.difference}</td>
                    <td>{entry.tablePoints}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default App
