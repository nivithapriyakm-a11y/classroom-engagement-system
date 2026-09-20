# ClassPulse - Classroom Comprehension Feedback

## Problem
Physical attendance does not always show whether students understand the lesson.

## Solution
ClassPulse allows students to anonymously submit:
- Understanding level
- A short quiz response

Teachers receive a live dashboard with:
- Number of responses
- Understanding distribution
- Quiz accuracy
- Classroom Resonance Index (CRI)
- Simple status indicating whether clarification may be needed

## Technologies
- Node.js
- Express.js
- EJS
- MongoDB
- Mongoose
- Socket.IO

## Setup

1. Install Node.js.
2. Run:

```bash
npm install
```

3. Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

4. Run:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

## Open-source / API credits
This project uses publicly available open-source packages:
- Express
- Mongoose
- EJS
- Socket.IO
- dotenv
- Nodemon

See each package's official repository/npm page for its license and documentation.

## Important
Do not upload `.env`, passwords, API keys, or `node_modules` to GitHub.
