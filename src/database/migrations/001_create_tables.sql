
-- Exam Portal Database Schema for MySQL 8.0
-- Run this script in MySQL Workbench to create the database structure

-- Create database (run this first)
CREATE DATABASE IF NOT EXISTS exam_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE exam_portal;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Questions table
CREATE TABLE questions (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('single-choice', 'multiple-choice', 'fill-blank', 'short-answer') NOT NULL,
    content TEXT NOT NULL,
    options JSON,
    correct_answer JSON NOT NULL,
    points INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_created_by (created_by),
    INDEX idx_type (type)
);

-- Exams table
CREATE TABLE exams (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    questions JSON NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_published (published),
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time)
);

-- Exam submissions table
CREATE TABLE exam_submissions (
    id VARCHAR(36) PRIMARY KEY,
    exam_id VARCHAR(36) NOT NULL,
    exam_title VARCHAR(255) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    graded BOOLEAN DEFAULT FALSE,
    score DECIMAL(5,2),
    answers JSON NOT NULL,
    time_spent INT NOT NULL,
    feedback JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_exam_id (exam_id),
    INDEX idx_student_id (student_id),
    INDEX idx_graded (graded),
    INDEX idx_submitted_at (submitted_at)
);

-- Insert default admin user (password should be hashed in production)
INSERT INTO users (id, name, email, password, role) VALUES 
('admin-001', 'Admin User', 'admin@example.com', 'admin123', 'admin'),
('teacher-001', 'Teacher User', 'teacher@example.com', 'teacher123', 'teacher'),
('student-001', 'Student User', 'student@example.com', 'student123', 'student');
