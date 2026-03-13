import { useEffect, useMemo, useState } from 'react'
import { TOURNAMENT_NAME, STORAGE_KEY } from '../utils'
import type { Team, Match } from '../types'

export function HomePage() {
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

  const rounds = useMemo(() => {
    return matches.reduce<Record<number, Match[]>>((accumulator, match) => {
      if (!accumulator[match.round]) {
        accumulator[match.round] = []
      }
      accumulator[match.round].push(match)
      return accumulator
    }, {})
  }, [matches])

  const completedMatches = matches.filter((match) => match.completed).length
  const totalRounds = Object.keys(rounds).length

  return (
    <div className="container">
      <div className="hero">
        <div>
          <p className="eyebrow">Free-hosting ready</p>
          <h1>{TOURNAMENT_NAME}</h1>
          <p className="hero-copy">
            Run a doubles event from one page: add teams, build the fixture list, record scores,
            and track the standings live.
          </p>
        </div>
      </div>

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
    </div>
  )
}