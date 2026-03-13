import { useEffect, useMemo, useState } from 'react'
import { STORAGE_KEY, getTeamLabel } from '../utils'
import type { Team, Match } from '../types'

export function FixturesPage() {
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

  const rounds = useMemo(() => {
    return matches.reduce<Record<number, Match[]>>((accumulator, match) => {
      if (!accumulator[match.round]) {
        accumulator[match.round] = []
      }
      accumulator[match.round].push(match)
      return accumulator
    }, {})
  }, [matches])

  return (
    <div className="container">
      <h2>Fixtures</h2>

      {matches.length === 0 ? (
        <p className="empty-state">No fixtures generated yet. Contact admin to create the schedule.</p>
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
                        <div className="team-info">
                          <h4>{getTeamLabel(teamA!)}</h4>
                        </div>
                        <span>vs</span>
                        <div className="team-info">
                          <h4>{getTeamLabel(teamB!)}</h4>
                        </div>
                      </div>
                      <div className="match-status">
                        <p className={`status-chip ${match.completed ? 'complete' : 'pending'}`}>
                          {match.completed ? 'Complete' : 'Scheduled'}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          ))
      )}
    </div>
  )
}