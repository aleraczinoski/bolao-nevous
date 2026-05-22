export function getWinner(homeScore: number, awayScore: number): 'HOME' | 'AWAY' | 'DRAW' {
  if (homeScore === awayScore) {
    return 'DRAW';
  }

  return homeScore > awayScore ? 'HOME' : 'AWAY';
}

export function calculatePoints(
  actualHome: number,
  actualAway: number,
  predictedHome: number,
  predictedAway: number,
): number {
  if (actualHome === predictedHome && actualAway === predictedAway) {
    return 3;
  }

  const actualWinner = getWinner(actualHome, actualAway);
  const predictedWinner = getWinner(predictedHome, predictedAway);
  return actualWinner === predictedWinner ? 1 : 0;
}
