import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * A logging utility that captures console output to a file
 * while still displaying it in the console
 */
export class Logger {
  private logStream: string[] = [];
  private logFilePath: string;
  private originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
  };

  /**
   * Creates a new Logger instance
   * @param logFilePath - Path to the log file (relative to project root)
   */
  constructor(logFilePath: string) {
    // Get absolute path to the log file
    this.logFilePath = path.join(path.dirname(path.dirname(__dirname)), logFilePath);

    // Store original console methods
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };
  }

  /**
   * Starts capturing console output
   */
  start(): void {
    // Override console methods to capture output
    console.log = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ');
      this.logStream.push(message);
      this.originalConsole.log(...args);
    };

    console.warn = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ');
      this.logStream.push(`[WARN] ${message}`);
      this.originalConsole.warn(...args);
    };

    console.error = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ');
      this.logStream.push(`[ERROR] ${message}`);
      this.originalConsole.error(...args);
    };
  }

  /**
   * Stops capturing console output and restores original console methods
   */
  stop(): void {
    // Restore original console methods
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
  }

  /**
   * Writes captured logs to the log file
   * @param append - Whether to append to existing log file or overwrite it
   */
  async saveLogToFile(append: boolean = true): Promise<void> {
    try {
      // Create directory if it doesn't exist
      const logDir = path.dirname(this.logFilePath);
      await fs.mkdir(logDir, { recursive: true });

      // Get current timestamp
      const timestamp = new Date().toISOString();

      // Format log content with session header
      const logContent = [
        append ? '' : '', // No empty line if we're creating a new file
        `\n==== LOG SESSION: ${timestamp} ====\n`,
        ...this.logStream,
        '\n==== END SESSION ====\n',
      ].join('\n');

      // Write to file (append or overwrite)
      if (append) {
        await fs.appendFile(this.logFilePath, logContent);
      } else {
        await fs.writeFile(this.logFilePath, logContent);
      }

      this.originalConsole.log(`Log saved to ${this.logFilePath}`);
    } catch (error) {
      this.originalConsole.error('Error saving log file:', error);
    }
  }

  /**
   * Clears the log stream
   */
  clearLog(): void {
    this.logStream = [];
  }
}

/**
 * Creates a new Logger instance for the specified script
 * @param scriptName - Name of the script (used in log file name)
 * @param logDirPath - Directory to store logs (relative to project root, defaults to 'data')
 * @returns A Logger instance
 */
export function createScriptLogger(scriptName: string, logDirPath: string = 'data'): Logger {
  const logFileName = `${scriptName}.log`;
  const logFilePath = path.join(logDirPath, logFileName);
  return new Logger(logFilePath);
}
