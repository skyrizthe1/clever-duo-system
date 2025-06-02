
// Database configuration for MySQL integration
// Updated with user's MySQL backend credentials

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  connectionLimit?: number;
}

// Backend API configuration
export const backendConfig = {
  baseUrl: 'http://127.0.0.1:5000',
  apiVersion: 'v1'
};

// Development configuration with user's MySQL credentials
export const databaseConfig: DatabaseConfig = {
  host: '127.0.0.1',
  port: 3306, // MySQL port
  database: 'exam_portal',
  user: 'root',
  password: 'nggforlife10+',
  ssl: false,
  connectionLimit: 10
};

// Production configuration (for deployment)
export const productionDatabaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'exam_portal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'nggforlife10+',
  ssl: process.env.DB_SSL === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10')
};

// Database tables structure for reference
export const databaseSchema = {
  users: {
    id: 'VARCHAR(36) PRIMARY KEY',
    name: 'VARCHAR(255) NOT NULL',
    email: 'VARCHAR(255) UNIQUE NOT NULL',
    password: 'VARCHAR(255) NOT NULL',
    role: 'ENUM("admin", "teacher", "student") NOT NULL',
    avatar: 'TEXT',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  },
  questions: {
    id: 'VARCHAR(36) PRIMARY KEY',
    type: 'ENUM("single-choice", "multiple-choice", "fill-blank", "short-answer") NOT NULL',
    content: 'TEXT NOT NULL',
    options: 'JSON',
    correct_answer: 'JSON NOT NULL',
    points: 'INT NOT NULL',
    category: 'VARCHAR(255) NOT NULL',
    created_by: 'VARCHAR(36) NOT NULL',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  },
  exams: {
    id: 'VARCHAR(36) PRIMARY KEY',
    title: 'VARCHAR(255) NOT NULL',
    description: 'TEXT',
    duration: 'INT NOT NULL',
    start_time: 'TIMESTAMP NOT NULL',
    end_time: 'TIMESTAMP NOT NULL',
    questions: 'JSON NOT NULL',
    created_by: 'VARCHAR(36) NOT NULL',
    published: 'BOOLEAN DEFAULT FALSE',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  },
  exam_submissions: {
    id: 'VARCHAR(36) PRIMARY KEY',
    exam_id: 'VARCHAR(36) NOT NULL',
    exam_title: 'VARCHAR(255) NOT NULL',
    student_id: 'VARCHAR(36) NOT NULL',
    student_name: 'VARCHAR(255) NOT NULL',
    submitted_at: 'TIMESTAMP NOT NULL',
    graded: 'BOOLEAN DEFAULT FALSE',
    score: 'DECIMAL(5,2)',
    answers: 'JSON NOT NULL',
    time_spent: 'INT NOT NULL',
    feedback: 'JSON',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  tasks: {
    id: 'VARCHAR(36) PRIMARY KEY',
    title: 'VARCHAR(255) NOT NULL',
    description: 'TEXT',
    status: 'ENUM("todo", "inprogress", "review", "done") NOT NULL',
    priority: 'ENUM("low", "medium", "high") NOT NULL',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    due_date: 'TIMESTAMP',
    tags: 'JSON',
    assigned_to: 'VARCHAR(36)',
    created_by: 'VARCHAR(36)'
  }
};
