function LeaderboardPanel({ playerName, onPlayerNameChange, onSavePlayer, leaderboard, status }) {
  return (
    <div className="ranking-panel">
      <div className="ranking-title">Leaderboard</div>
      <div className="ranking-controls">
        <input
          value={playerName}
          onChange={(event) => onPlayerNameChange(event.target.value)}
          maxLength={12}
          placeholder="Your name"
        />
        <button type="button" onClick={onSavePlayer}>Save player</button>
      </div>
      <div className="ranking-status">{status}</div>
      <ol className="ranking-list">
        {leaderboard.length === 0 ? (
          <li>No scores yet</li>
        ) : (
          leaderboard.slice(0, 10).map((entry, index) => (
            <li key={`${entry.userName}-${index}`}>{`${index + 1}. ${entry.userName} - ${entry.maxScore} pts`}</li>
          ))
        )}
      </ol>
    </div>
  );
}

export default LeaderboardPanel;
