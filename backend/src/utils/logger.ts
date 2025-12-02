import { env } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

function formatLog(entry: LogEntry): string {
  const { level, message, timestamp, data } = entry;
  const levelColors: Record<LogLevel, string> = {
    info: '\x1b[36m',   // Cyan
    warn: '\x1b[33m',   // Yellow
    error: '\x1b[31m',  // Red
    debug: '\x1b[35m',  // Magenta
  };
  const reset = '\x1b[0m';
  const color = levelColors[level];
  
  let log = `${color}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`;
  
  if (data) {
    log += `\n${JSON.stringify(data, null, 2)}`;
  }
  
  return log;
}

function log(level: LogLevel, message: string, data?: any): void {
  // Skip debug logs in production
  if (level === 'debug' && env.isProduction) {
    return;
  }

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  const formattedLog = formatLog(entry);

  switch (level) {
    case 'error':
      console.error(formattedLog);
      break;
    case 'warn':
      console.warn(formattedLog);
      break;
    default:
      console.log(formattedLog);
  }
}

export const logger = {
  info: (message: string, data?: any) => log('info', message, data),
  warn: (message: string, data?: any) => log('warn', message, data),
  error: (message: string, data?: any) => log('error', message, data),
  debug: (message: string, data?: any) => log('debug', message, data),
};

