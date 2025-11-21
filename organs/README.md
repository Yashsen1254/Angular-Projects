# Organ Donation Management System

A full-stack web application for managing organ donations with three user roles: Admin, Donor, and Receiver.

## Features

### Admin
- View all organs in the system
- Manage organ requests
- Approve/reject requests
- Connect donors and receivers by sharing contact information

### Donor
- Register organs for donation
- View donated organs and their status
- Dashboard with donation statistics

### Receiver
- Browse available organs
- Request organs
- View request status
- Dashboard with request statistics

## Tech Stack

### Frontend
- Angular 20
- TypeScript
- HTML/CSS

### Backend
- Node.js
- Express.js
- MySQL

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Angular CLI

### Database Setup

1. Create the database:
```bash
mysql -u root -p < database.sql
```

Or manually:
```sql
mysql -u root -p
source database.sql
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=organ_donation_db
```

4. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

The frontend will be available at `http://localhost:4200`

## Default Login Credentials

### Admin
- Email: `admin@organs.com`
- Password: `admin123`

### Donor
- Email: `donor@organs.com`
- Password: `donor123`

### Receiver
- Email: `receiver@organs.com`
- Password: `receiver123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Organs
- `GET /api/organs` - Get all organs (query params: status, donorId)
- `GET /api/organs/:id` - Get organ by ID
- `POST /api/organs` - Create new organ
- `PATCH /api/organs/:id/status` - Update organ status

### Requests
- `GET /api/requests` - Get all requests (query params: receiverId, status)
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create new request
- `PATCH /api/requests/:id/status` - Update request status

### Users
- `GET /api/users/:id` - Get user by ID

## Project Structure

```
organs/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── components/
│   │       ├── guards/
│   │       ├── models/
│   │       ├── pages/
│   │       ├── services/
│   │       └── ...
│   └── package.json
├── database.sql
└── README.md
```

## Usage

1. Start the MySQL database
2. Start the backend server (`cd backend && npm start`)
3. Start the frontend server (`cd frontend && ng serve`)
4. Open `http://localhost:4200` in your browser
5. Login with one of the default credentials or register a new account

## Development

The application uses:
- Role-based authentication and routing
- RESTful API architecture
- Responsive design
- Local storage for session management

## Notes

- Passwords are stored in plain text for demo purposes. In production, use bcrypt or similar for hashing.
- The application uses localStorage for session management. Consider using JWT tokens for production.
- CORS is enabled for development. Configure appropriately for production.

