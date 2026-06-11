export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
  active: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  crestUrl: string;
}

export interface Round {
  id: string;
  key: string;
  name: string;
  order: number;
}

export interface Match {
  id: string;
  externalId: string;
  kickoffAt: string;
  status: "SCHEDULED" | "IN_PLAY" | "FINISHED" | "POSTPONED" | "CANCELED";
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: Team;
  awayTeam: Team;
  round: Round;
}

export interface Prediction {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  match: Match;
}

export interface RankingEntry {
  userId: string;
  displayName: string;
  points: number;
}

export interface AdminPrediction {
  id: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  user: { id: string; email: string; displayName: string };
  match: Match;
}
