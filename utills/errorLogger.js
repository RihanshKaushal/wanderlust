// Error logging utility for better debugging and monitoring
const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logError = (type, error, additionalInfo = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = {
        timestamp,
        type,
        message: error.message || error,
        stack: error.stack || "",
        ...additionalInfo
    };

    // Console log for immediate visibility
    console.error(`[${type}] ${timestamp}:`, error);

    // File log for persistent record
    const logFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logMessage) + "\n");
};

module.exports = { logError };
