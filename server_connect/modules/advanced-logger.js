require("dotenv").config();
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const { redactionKeys } = require("./redaction-keys");
const { toSystemPath } = require("../../../lib/core/path");
const prettyPrint = process.env.PRETTY_LOG === "enabled";
const logLevel = process.env.LOG_LEVEL || "debug";
const logEnvironment = process.env.LOG_ENVIRONMENT;
const logtailToken = process.env.LOGTAIL_TOKEN;
const logFilePath = process.env.LOG_FILE_PATH
  ? `${process.env.LOG_FILE_PATH}${getCurrentDate()}.log`
  : null;
const logDirectoryPath = process.env.LOG_FILE_PATH
  ? toSystemPath(process.env.LOG_FILE_PATH)
  : null;
const minLength = process.env.WRITE_LOG_MIN_LENGTH || 4096;
let Sentry;
const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  Sentry = require("@sentry/node");
  Sentry.init({ dsn: sentryDsn });
}

const transports = [];

if (prettyPrint) {
  transports.push({
    level: logLevel,
    target: "pino-pretty",
  });
}

if (logtailToken) {
  transports.push({
    level: logLevel,
    target: "@logtail/pino",
    options: { sourceToken: logtailToken },
  });
}

if (logFilePath) {
  transports.push({
    level: logLevel,
    target: "pino/file",
    options: {
      destination: toSystemPath(logFilePath),
      minLength: minLength,
      mkdir: true,
    },
  });
}

const transport = pino.transport({ targets: transports });

const logger = pino(
  {
    level: logLevel,
    redact: redactionKeys,
    allowErrorLevels: true,
  },
  transport
);

function getCurrentDate() {
  const now = new Date();
  const date = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return `${year}.${month.toString().padStart(2, "0")}.${date
    .toString()
    .padStart(2, "0")}`;
}

function parse(options) {
  options = options || {};
  let details = null;
  let bindings = options.bindings || {};

  if (options.details) {
    if (typeof options.details === "string") {
      try {
        details = JSON.parse(options.details);
      } catch (e) {
        console.error("Error parsing details string:", e);
      }
    } else if (typeof options.details === "object") {
      details = options.details;
    }
  }

  let message = options.message || "";

  return {
    message: message,
    log_level: options.log_level || "info",
    details,
    bindings
  };
}
async function cleanOldLogs(options) {
  options = this.parse(options);
  const logRetainDays = options.retainDays || 7;
  if (!logDirectoryPath || isNaN(logRetainDays)) {
    console.log("logDirectoryPath:", logDirectoryPath);
    console.log("logRetainDays:", logRetainDays);
    console.log("Invalid logDirectoryPath or logRetainDays.");
    return;
  }

  const logDirectory = logDirectoryPath;
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - logRetainDays);
  currentDate.setHours(0, 0, 0, 0);
  console.log("Checking logs older than:", currentDate);
  const files = await fs.promises.readdir(logDirectory);

  for (const file of files) {
    const filePath = path.join(logDirectory, file);
    const fileStat = await fs.promises.stat(filePath);
    const logDateMatches = file.match(/(\d{4})\.(\d{2})\.(\d{2})\.log$/);
    if (!logDateMatches) {
      console.log("Skipping non-log file:", filePath);
      continue;
    }

    const logDate = new Date(
      logDateMatches[1],
      logDateMatches[2] - 1,
      logDateMatches[3]
    );
    logDate.setHours(0, 0, 0, 0);
    console.log("Checking file:", filePath, "Log Date:", logDate);

    if (currentDate > logDate) {
      console.log("Removing outdated log file:", filePath);
      await fs.promises.unlink(filePath).catch((error) => {
        console.error("Error removing file:", filePath, error);
      });
    } else {
      console.log("Log file is not outdated:", filePath);
    }
  }
}

async function logMessage(options) {
  options =
    typeof this.parse === "function" ? this.parse(options) : parse(options);
    const { message, log_level, details, bindings } = options || {};
    
  
  if (!message) {
    return;
  }

  const logObject = {
    message,
    log_level,
    details,
    ...bindings
  };

  if (!prettyPrint && logEnvironment) {
    logObject.log_environment = logEnvironment;
  }

  // Log to Sentry regardless of log_level
  if (sentryDsn) {
    Sentry.captureMessage(message, {
      level: log_level,
      extra: logObject,
      tags: { details: JSON.stringify(details) },
    });
  }

  // Log to other destinations for all log levels
  logger[log_level](logObject);

}

function logMessageSync(options) {
  options =
    typeof this.parse === "function" ? this.parse(options) : parse(options);
  const { message, log_level, details} = options || {};

  if (!message) {
    return;
  }

  const logObject = {
    message,
    log_level,
    details,
    ...bindings
  };

  if (!prettyPrint && logEnvironment) {
    logObject.log_environment = logEnvironment;
  }

  // Log to Sentry regardless of log_level
  if (sentryDsn) {
    Sentry.captureMessage(message, {
      level: log_level,
      extra: logObject,
      tags: { details: JSON.stringify(details) },
    });
  }

  // Log to other destinations for all log levels
  logger[log_level](logObject);
}

module.exports = {
  logger,
  logMessage,
  logMessageSync,
  cleanOldLogs,
};
