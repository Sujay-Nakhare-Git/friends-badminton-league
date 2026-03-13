import { useEffect, useMemo, useState } from 'react'
import { STORAGE_KEY, getTeamLabel } from '../utils'
import { useAdmin } from '../AdminContext'
import type { Team, Match } from '../types'

export function ResultsPage() {
  const { isAdmin } = useAdmin()
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])

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

  const teamMap = useMemo(() => {
    return new Map(teams.map((team) => [team.id, team]))
  }, [teams])

  const handleScoreChange = (matchId: string, team: 'A' | 'B', score: string) => {
    if (!isAdmin) return

    setMatches((previousMatches) => {
      const updatedMatches = previousMatches.map((match) =>
        match.id === matchId
          ? {
              ...match,
              [team === 'A' ? 'scoreA' : 'scoreB']: score,
            }
          : match
      )

      // Auto-save to localStorage
      localStorage.setItem(`${STORAGE_KEY}-matches`, JSON.stringify(updatedMatches))

      // Auto-complete match if both scores are entered
      const updatedMatch = updatedMatches.find(m => m.id === matchId)
      if (updatedMatch && updatedMatch.scoreA.trim() && updatedMatch.scoreB.trim()) {
        const finalMatches = updatedMatches.map(m =>
          m.id === matchId ? { ...m, completed: true } : m
        )
        localStorage.setItem(`${STORAGE_KEY}-matches`, JSON.stringify(finalMatches))
        return finalMatches
      }

      return updatedMatches
    })
  }

  const handleCompleteMatch = (matchId: string) => {
    if (!isAdmin) return

    setMatches((previousMatches) =>
      previousMatches.map((match) =>
        match.id === matchId
          ? { ...match, completed: true }
          : match
      )
    )
  }

  const handleSaveResults = () => {
    if (!isAdmin) return

    localStorage.setItem(`${STORAGE_KEY}-matches`, JSON.stringify(matches))
    alert('Results saved successfully!')
  }

  const pendingMatches = matches.filter((match) => !match.completed)
  const completedMatches = matches.filter((match) => match.completed)

  return (
    <div className="container">
      <h2>Results</h2>

      {!isAdmin && (
        <p className="admin-warning">Only admins can enter and edit match results.</p>
      )}

      {matches.length === 0 ? (
        <p className="empty-state">No matches available. Contact admin to generate fixtures.</p>
      ) : (
        <>
          {pendingMatches.length > 0 && (
            <section className="results-section">
              <h3>Pending Results</h3>
              <div className="match-list">
                {pendingMatches.map((match) => {
                  const teamA = teamMap.get(match.teamAId)
                  const teamB = teamMap.get(match.teamBId)

                  return (
                    <article className="match-card" key={match.id}>
                      <div className="match-teams">
                        <div className="team-info">
                          <h4>{getTeamLabel(teamA!)}</h4>
                        </div>
                        <span>vs</span>
                        <div className="team-info">
                          <h4>{getTeamLabel(teamB!)}</h4>
                        </div>
                      </div>
                      <div className="score-inputs">
                        <input
                          type="text"
                          placeholder="Score A"
                          value={match.scoreA}
                          onChange={(event) =>
                            handleScoreChange(match.id, 'A', event.target.value)
                          }
                          disabled={!isAdmin}
                        />
                        <span>-</span>
                        <input
                          type="text"
                          placeholder="Score B"
                          value={match.scoreB}
                          onChange={(event) =>
                            handleScoreChange(match.id, 'B', event.target.value)
                          }
                          disabled={!isAdmin}
                        />
                      </div>
                      {isAdmin && (
                        <p className="auto-save-note">
                          Match will be automatically saved and marked as completed when both scores are entered.
                        </p>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {completedMatches.length > 0 && (
            <section className="results-section">
              <h3>Completed Results</h3>
              <div className="match-list">
                {completedMatches.map((match) => {
                  const teamA = teamMap.get(match.teamAId)
                  const teamB = teamMap.get(match.teamBId)

                  return (
                    <article className="match-card" key={match.id}>
                      <div className="match-teams">
                        <div className="team-info">
                          <h4>{getTeamLabel(teamA!)}</h4>
                        </div>
                        <span>vs</span>
                        <div className="team-info">
                          <h4>{getTeamLabel(teamB!)}</h4>
                        </div>
                      </div>
                      <div className="final-score">
                        <span className="score-display">
                          {match.scoreA} - {match.scoreB}
                        </span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}