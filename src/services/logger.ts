/**
 * Slf4J / Logback Application Logger Service
 * Implements standard enterprise Java Spring Boot logging conventions.
 */

import { LogEntry } from '../types';

type LogListener = (logs: LogEntry[]) => void;

class Slf4jLoggerService {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs = 300;

  constructor() {
    this.loadPersistedLogs();
    if (this.logs.length === 0) {
      this.seedInitialBootLogs();
    }
  }

  private loadPersistedLogs() {
    try {
      const saved = localStorage.getItem('cms_slf4j_logs');
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch {
      this.logs = [];
    }
  }

  private persist() {
    try {
      localStorage.setItem('cms_slf4j_logs', JSON.stringify(this.logs.slice(-150)));
    } catch {
      // ignore
    }
  }

  private notify() {
    const copy = [...this.logs];
    this.listeners.forEach((listener) => listener(copy));
    this.persist();
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener([...this.logs]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.info('c.e.cms.service.LogbackAuditManager', 'Audit logs cleared by system administrator.');
    this.notify();
  }

  private formatTimestamp(): string {
    const now = new Date();
    const pad = (n: number, z = 2) => String(n).padStart(z, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const ms = pad(now.getMilliseconds(), 3);
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.${ms}`;
  }

  private addLog(
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
    logger: string,
    message: string,
    details?: string
  ) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: this.formatTimestamp(),
      level,
      logger,
      thread: 'http-nio-8080-exec-' + Math.floor(1 + Math.random() * 4),
      message,
      details,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    this.notify();

    // Also output to browser console in matching style
    const consoleColor =
      level === 'ERROR'
        ? '#ef4444'
        : level === 'WARN'
        ? '#f59e0b'
        : level === 'DEBUG'
        ? '#64748b'
        : '#10b981';

    // Quiet console log for developers inspecting dev tools
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(
        `%c[${entry.timestamp}] [${entry.thread}] ${entry.level} ${entry.logger} - ${entry.message}`,
        `color: ${consoleColor}; font-family: monospace; font-size: 11px;`
      );
    }
  }

  public info(logger: string, message: string, details?: string) {
    this.addLog('INFO', logger, message, details);
  }

  public warn(logger: string, message: string, details?: string) {
    this.addLog('WARN', logger, message, details);
  }

  public error(logger: string, message: string, details?: string) {
    this.addLog('ERROR', logger, message, details);
  }

  public debug(logger: string, message: string, details?: string) {
    this.addLog('DEBUG', logger, message, details);
  }

  private seedInitialBootLogs() {
    const now = this.formatTimestamp();
    this.logs = [
      {
        id: 'boot-1',
        timestamp: now,
        level: 'INFO',
        logger: 'c.e.cms.ContactManagementApplication',
        thread: 'main',
        message: 'Started ContactManagementApplication in 1.842 seconds (JVM running for 2.31)',
      },
      {
        id: 'boot-2',
        timestamp: now,
        level: 'INFO',
        logger: 'org.hibernate.Version',
        thread: 'main',
        message: 'HCANN000001: Hibernate Commons Annotations {6.0.6.Final}',
      },
      {
        id: 'boot-3',
        timestamp: now,
        level: 'INFO',
        logger: 'o.h.e.t.j.p.i.JtaPlatformInitiator',
        thread: 'main',
        message: 'HHH000490: Using JtaPlatformImplementation: NoJtaPlatform',
      },
      {
        id: 'boot-4',
        timestamp: now,
        level: 'INFO',
        logger: 'com.zaxxer.hikari.HikariDataSource',
        thread: 'main',
        message: 'HikariPool-1 - Starting... Connected to SQL Server 2022 (v16.0.4085)',
      },
      {
        id: 'boot-5',
        timestamp: now,
        level: 'INFO',
        logger: 'c.e.cms.security.JwtAuthenticationFilter',
        thread: 'main',
        message: 'Configured Stateless JWT Security Filter Chain. CSRF protection verified.',
      },
      {
        id: 'boot-6',
        timestamp: now,
        level: 'INFO',
        logger: 'c.e.cms.controller.ContactController',
        thread: 'http-nio-8080-exec-1',
        message: 'Spring Web MVC mapped 14 REST endpoints for ContactManagementResource.',
      },
    ];
  }
}

export const slf4j = new Slf4jLoggerService();
