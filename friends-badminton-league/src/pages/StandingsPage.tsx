import { useEffect, useMemo, useState } from 'react'
import { STORAGE_KEY, getTeamLabel, getHeadToHeadWinner } from '../utils'
import type { Team, Match, Standing } from '../types'

function parseScore(score: string): number {
  const numScore = parseInt(score, 10)
  return isNaN(numScore) ? 0 : numScore
}

export function StandingsPage() {
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

  const standings = useMemo(() => {
    const teamStats = new Map<string, { wins: number; losses: number; scoreDiff: number; headToHead: Map<string, number> }>()

    teams.forEach((team) => {
      teamStats.set(team.id, { wins: 0, losses: 0, scoreDiff: 0, headToHead: new Map() })
    })

    matches.filter((match) => match.completed).forEach((match) => {
      const teamAStats = teamStats.get(match.teamAId)
      const teamBStats = teamStats.get(match.teamBId)

      if (!teamAStats || !teamBStats) return

      const scoreA = parseScore(match.scoreA)
      const scoreB = parseScore(match.scoreB)

      // Determine winner based on higher score
      if (scoreA > scoreB) {
        teamAStats.wins++
        teamBStats.losses++
      } else if (scoreB > scoreA) {
        teamBStats.wins++
        teamAStats.losses++
      }
      // If scores are equal, it's a draw - no wins/losses recorded

      // Calculate score difference for tie-breaking
      const scoreDiff = scoreA - scoreB
      teamAStats.scoreDiff += scoreDiff
      teamBStats.scoreDiff -= scoreDiff

      teamAStats.headToHead.set(match.teamBId, scoreDiff)
      teamBStats.headToHead.set(match.teamAId, -scoreDiff)
    })

    return Array.from(teamStats.entries())
      .map(([teamId, stats]) => ({
        teamId,
        ...stats,
      }))
      .sort((left, right) => {
        if (left.wins !== right.wins) {
          return right.wins - left.wins
        }

        const leftHeadToHead = left.headToHead.get(right.teamId) || 0
        const rightHeadToHead = right.headToHead.get(left.teamId) || 0

        if (leftHeadToHead !== rightHeadToHead) {
          return rightHeadToHead - leftHeadToHead
        }

        return right.scoreDiff - left.scoreDiff
      })
  }, [teams, matches])

  return (
    <div className="container">
      <h2>Standings</h2>

      {standings.length === 0 ? (
        <p className="empty-state">No standings available yet. Complete some matches to see the leaderboard.</p>
      ) : (
        <div className="standings-table">
          <div className="standings-header">
            <span>Position</span>
            <span>Team</span>
            <span>Wins</span>
            <span>Losses</span>
            <span>Score Diff</span>
          </div>
          {standings.map((standing, index) => {
            const team = teams.find((t) => t.id === standing.teamId)
            return (
              <div className="standings-row" key={standing.teamId}>
                <span className="position">{index + 1}</span>
                <span className="team-name">{getTeamLabel(team!)}</span>
                <span className="wins">{standing.wins}</span>
                <span className="losses">{standing.losses}</span>
                <span className="score-diff">{standing.scoreDiff > 0 ? `+${standing.scoreDiff}` : standing.scoreDiff}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}