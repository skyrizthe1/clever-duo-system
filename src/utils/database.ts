
// Database connection utilities for MySQL integration
// This will be used when you connect the backend

export interface DatabaseConnection {
  query: (sql: string, params?: any[]) => Promise<any[]>;
  execute: (sql: string, params?: any[]) => Promise<any>;
  close: () => Promise<void>;
}

// Database query builder helpers
export class QueryBuilder {
  private table: string;
  private selectFields: string[] = ['*'];
  private whereConditions: string[] = [];
  private orderByFields: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;

  constructor(tableName: string) {
    this.table = tableName;
  }

  select(fields: string[]): QueryBuilder {
    this.selectFields = fields;
    return this;
  }

  where(condition: string): QueryBuilder {
    this.whereConditions.push(condition);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.orderByFields.push(`${field} ${direction}`);
    return this;
  }

  limit(count: number): QueryBuilder {
    this.limitValue = count;
    return this;
  }

  offset(count: number): QueryBuilder {
    this.offsetValue = count;
    return this;
  }

  build(): string {
    let query = `SELECT ${this.selectFields.join(', ')} FROM ${this.table}`;
    
    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    if (this.orderByFields.length > 0) {
      query += ` ORDER BY ${this.orderByFields.join(', ')}`;
    }
    
    if (this.limitValue) {
      query += ` LIMIT ${this.limitValue}`;
    }
    
    if (this.offsetValue) {
      query += ` OFFSET ${this.offsetValue}`;
    }
    
    return query;
  }
}

// Helper functions for database operations
export const DatabaseHelpers = {
  // Generate UUID for MySQL
  generateId: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Format date for MySQL
  formatDate: (date: Date): string => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  },

  // Escape SQL values
  escape: (value: any): string => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? '1' : '0';
    if (value instanceof Date) return `'${DatabaseHelpers.formatDate(value)}'`;
    if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    return `'${value}'`;
  }
};

// API endpoints structure for backend integration
export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    getCurrentUser: '/api/auth/me'
  },
  users: {
    getAll: '/api/users',
    getById: '/api/users/:id',
    create: '/api/users',
    update: '/api/users/:id',
    delete: '/api/users/:id'
  },
  questions: {
    getAll: '/api/questions',
    getById: '/api/questions/:id',
    create: '/api/questions',
    update: '/api/questions/:id',
    delete: '/api/questions/:id'
  },
  exams: {
    getAll: '/api/exams',
    getById: '/api/exams/:id',
    create: '/api/exams',
    update: '/api/exams/:id',
    delete: '/api/exams/:id'
  },
  submissions: {
    getAll: '/api/submissions',
    getById: '/api/submissions/:id',
    create: '/api/submissions',
    grade: '/api/submissions/:id/grade'
  }
};
