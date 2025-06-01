
# MySQL Database Setup for Exam Portal

## Prerequisites
- MySQL 8.0 or higher
- MySQL Workbench 8.0

## Setup Instructions

### 1. Install MySQL 8.0
Download and install MySQL 8.0 from the official website if you haven't already.

### 2. Open MySQL Workbench
Launch MySQL Workbench 8.0 and connect to your MySQL server.

### 3. Create Database
Run the migration script located at `src/database/migrations/001_create_tables.sql` in MySQL Workbench:

1. Open the SQL file in MySQL Workbench
2. Execute the entire script to create the database and tables
3. Verify that all tables are created successfully

### 4. Update Configuration
Update the database configuration in `src/config/database.ts` with your MySQL credentials:

```typescript
export const databaseConfig: DatabaseConfig = {
  host: 'localhost', // Your MySQL host
  port: 3306, // Your MySQL port
  database: 'exam_portal',
  user: 'your_username', // Your MySQL username
  password: 'your_password', // Your MySQL password
  ssl: false,
  connectionLimit: 10
};
```

### 5. Backend Integration
To connect this frontend to a MySQL backend, you'll need to:

1. **Set up a Node.js/Express backend** with these dependencies:
   - `mysql2` - MySQL driver
   - `express` - Web framework
   - `cors` - Cross-origin requests
   - `bcrypt` - Password hashing
   - `jsonwebtoken` - Authentication
   - `dotenv` - Environment variables

2. **Create API endpoints** matching the structure in `src/utils/database.ts`

3. **Update the frontend API service** in `src/services/api.ts` to make HTTP requests to your backend instead of using mock data

### 6. Environment Variables
For production, set these environment variables:
- `DB_HOST` - Database host
- `DB_PORT` - Database port (usually 3306)
- `DB_NAME` - Database name (exam_portal)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_SSL` - SSL connection (true/false)

## Database Schema

### Tables Created:
1. **users** - Store user accounts (admin, teacher, student)
2. **questions** - Store exam questions with different types
3. **exams** - Store exam details and configuration
4. **exam_submissions** - Store student exam submissions and grades

### Default Users:
- Admin: admin@example.com / admin123
- Teacher: teacher@example.com / teacher123
- Student: student@example.com / student123

**Note:** Change these default passwords in production!

## Next Steps
1. Set up your Node.js backend server
2. Install required npm packages for backend
3. Create API routes matching the frontend expectations
4. Test the connection between frontend and backend
5. Deploy both frontend and backend to your preferred hosting service

## Troubleshooting
- Ensure MySQL service is running
- Check firewall settings if connecting remotely
- Verify user permissions in MySQL
- Check connection strings and credentials
