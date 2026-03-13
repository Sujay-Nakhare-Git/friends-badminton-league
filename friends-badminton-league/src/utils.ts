import type { Match, Team } from './types'

export const TOURNAMENT_NAME = 'Friends Badminton League Season 3'
export const STORAGE_KEY = 'badminton-tournament-manager'
export const ADMIN_SESSION_KEY = 'badminton-admin-session'
export const ADMIN_USERNAME = 'admin'
export const ADMIN_PASSWORD = 'FBLSeason3!'

export const emptyForm = {
  playerOne: '',
  playerTwo: '',
}

export const emptyAdminForm = {
  username: '',
  password: '',
}

export const demoTeams: Team[] = [
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

export const getTeamLabel = (team: Team) => `${team.playerOne} & ${team.playerTwo}`

export const getHeadToHeadWinner = (leftTeamId: string, rightTeamId: string, matches: Match[]) => {
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

export const createRoundRobinSchedule = (teams: Team[]): Match[] => {
  if (teams.length < 2) {
    return []
  }

  const placeholders = teams.map((team: Team) => team.id)
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