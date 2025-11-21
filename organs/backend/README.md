# Organ Donation Backend API

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials.

4. Import the database schema:
```bash
mysql -u root -p < ../database.sql
```

5. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

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

