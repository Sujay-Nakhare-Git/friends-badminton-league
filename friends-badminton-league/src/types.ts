export type Team = {
  id: string
  playerOne: string
  playerTwo: string
}

export type Match = {
  id: string
  round: number
  teamAId: string
  teamBId: string
  scoreA: string
  scoreB: string
  completed: boolean
}

export type TeamForm = {
  playerOne: string
  playerTwo: string
}

export type AdminForm = {
  username: string
  password: string
}

export type Standing = {
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