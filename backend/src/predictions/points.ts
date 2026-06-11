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
  const actualWinner = getWinner(actualHome, actualAway);
  const predictedWinner = getWinner(predictedHome, predictedAway);

  if (actualWinner !== predictedWinner) {
    return 0;
  }

  // +1 base por acertar o resultado (vencedor ou empate)
  const base = 1;

  // Placar Exato: acertou os dois placares
  if (actualHome === predictedHome && actualAway === predictedAway) {
    const goleada = Math.abs(actualHome - actualAway) >= 3 && Math.abs(predictedHome - predictedAway) >= 3 ? 1 : 0;
    return base + 5 + goleada;
  }

  // A partir daqui só se aplica a jogos com vencedor (não empate)
  if (actualWinner === 'DRAW') {
    return base;
  }

  const isHome = actualWinner === 'HOME';
  const actualWinnerScore = isHome ? actualHome : actualAway;
  const actualLoserScore = isHome ? actualAway : actualHome;
  const predictedWinnerScore = isHome ? predictedHome : predictedAway;
  const predictedLoserScore = isHome ? predictedAway : predictedHome;
  const actualDiff = actualHome - actualAway;
  const predictedDiff = predictedHome - predictedAway;
  const goleada = Math.abs(actualDiff) >= 3 && Math.abs(predictedDiff) >= 3 ? 1 : 0;

  // Placar Vencedor: acertou o placar do time que ganhou
  if (actualWinnerScore === predictedWinnerScore) {
    return base + 3 + goleada;
  }

  // Diferença de Gols: acertou a diferença
  if (actualDiff === predictedDiff) {
    return base + 2 + goleada;
  }

  // Placar Perdedor: acertou o placar do time que perdeu
  if (actualLoserScore === predictedLoserScore) {
    return base + 1 + goleada;
  }

  return base;
}
