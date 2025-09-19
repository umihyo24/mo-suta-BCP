import PropTypes from "prop-types";

function LogPanel({ logs, showDetails, onToggleDetails, conciseLogs }) {
  return (
    <div className="logWide">
      <div className="logHeader">
        <div className="logHeaderLabel">直近ログ</div>
        <button className="btn" onClick={onToggleDetails} type="button">
          {showDetails ? "詳細ログを閉じる" : "詳細ログを開く"}
        </button>
      </div>
      <div className="logRow">
        {conciseLogs.map((text, index) => (
          <div className="logItem" key={index}>
            {text}
          </div>
        ))}
      </div>
      {showDetails && (
        <div className="logDetails">
          {logs.map((text, index) => (
            <div className="logDetailsItem" key={index}>
              {text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

LogPanel.propTypes = {
  logs: PropTypes.arrayOf(PropTypes.string).isRequired,
  showDetails: PropTypes.bool.isRequired,
  onToggleDetails: PropTypes.func.isRequired,
  conciseLogs: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default LogPanel;
