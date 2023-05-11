# Advanced Logger Extension for Wappler

This extension for Wappler provides advanced logging functionality using the [Pino](https://github.com/pinojs/pino) library, [Logtail](https://logtail.com) for log aggregation, and [Sentry](https://sentry.io) for error tracking. It allows you to log messages with various log levels, supports multiple transport options such as console, file, and Logtail, and provides log redaction capabilities.

## Features

- Customizable log levels
- Pretty printing for console output
- Integration with Logtail and Sentry
- Log redaction support for sensitive data
- Log file management (automatic creation and removal)
- Flexible transport configuration

## Installation

Add the following dependencies to your `package.json`:

```js
npm install pino
```

## Transports and Required NPM Packages

The Advanced Logger Extension supports multiple transport options such as console, file, Logtail, and Sentry. Depending on which transports you want to use, you need to install the corresponding NPM packages and configure the relevant environment variables.

### Pretty Log
Add the following dependencies to your `package.json`:

```js
npm install pino-pretty
```

Configure the following environment variable:

- `PRETTY_LOG`: Set to 'enabled' for pretty-printed console output.

### File
No additional NPM packages are required for file logging.

Configure the following environment variables:

- `LOG_FILE_PATH`: Set the path to store log files.
- `WRITE_LOG_MIN_LENGTH`: Set the minimum log message length to write to a file.

### Logtail

To use Logtail for log aggregation, install the following NPM package:
```js
npm install @logtail/pino
```

Configure the following environment variable:

- `LOGTAIL_TOKEN`: Set the Logtail source token for log aggregation.


### Sentry
To use Sentry for error tracking, install the following NPM package:

```js
npm install @sentry/node,
```

Configure the following environment variable:

- `SENTRY_DSN`: Set the Sentry DSN for error tracking.

### Express HTTP Logging
To enable Express HTTP logging with the Advanced Logger Extension, you'll need to install the pino-http package. Add the following dependency to your package.json:

```js
npm install pino-http
```

After installing the package, you can use it as middleware in your Express application to enable HTTP logging.

## Configuration

The extension uses environment variables to configure various settings. These variables can be set in your .env file:

- `LOG_LEVEL`: Set the log level (e.g., trace, debug, info, warn, error, fatal).
- `LOG_ENVIRONMENT`: Set the log environment (e.g., production, development, etc.).
  
## Redaction
To redact sensitive data from your logs, you can customize the redaction keys in the `redaction-keys.js` file. The keys correspond to the properties in the log object that you want to redact.

For example, to redact the user_id and secret_key in the details object, your redaction-keys.js file should look like this:

```
const redactionKeys = [
    'details.user_id',
    'details.secret_key',
];

module.exports = { redactionKeys };
```

## Extension UI Actions

The extension provides two UI actions that can be used in Wappler: `Advanced Log` and `Clean Old Logs`. 

### Advanced Log
This action logs a message with the specified log level and details.

### Clean Old Logs
This action cleans old log files, removing files older than the specified number of days. Add this action to a node scheduler if you have file logging enabled and scheduled it for the desired interval. The action will scan the log directory specified in the ENV `LOG_FILE_PATH`.

## Extension Developers

To integrate the Advanced Logger extension into your project, follow these examples:

### Sync Logging

```js
const { logMessage } = require("./advanced-logger");

logMessageSync({
message: "Example log message",
log_level: "info",
details: {
    key1: "value1",
    key2: "value2"
    }
});
```


### Async Logging

```js
const { logMessage } = require("./advanced-logger");

await logMessage({
    message: `Fetching vulnerabilities took ${fetchTime - startTime} ms`,
    log_level: "debug",
    details: {
        user: "user@example.com",
        request_id: "12345"
    }
});
