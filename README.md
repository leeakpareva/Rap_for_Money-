# R4M – Rap For Money

A full-stack MERN application - an Instagram-style social platform for rappers and hip-hop creatives.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Social Feed**: Post images/videos, like, comment, and follow users
- **Media Upload**: Support for image and video uploads (stored locally for MVP)
- **Live Streaming**: WebRTC-based live streaming with 4-minute time limit
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Features**: Live streaming with signaling API

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads
- Simple WebRTC signaling for live streams

### Frontend
- React + Vite + TypeScript
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

## Prerequisites

- Node.js 16+
- MongoDB running locally or connection string
- Modern browser with WebRTC support

## Setup Instructions

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Rap_for_Money
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `/server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/r4m
JWT_SECRET=your_jwt_secret_key_here_change_in_production
SERVER_PORT=5000
CLIENT_URL=http://localhost:5173
```

**MongoDB Setup:**
- Install MongoDB locally OR use MongoDB Atlas
- If using local MongoDB, make sure it's running on port 27017
- Database name: `r4m` (will be created automatically)

### 3. Frontend Setup

```bash
cd client
npm install
```

### 4. Running the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
Rap_for_Money/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── postController.ts
│   │   │   ├── commentController.ts
│   │   │   └── livestreamController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── upload.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Post.ts
│   │   │   ├── Comment.ts
│   │   │   └── LiveStream.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── posts.ts
│   │   │   ├── comments.ts
│   │   │   └── livestreams.ts
│   │   ├── utils/
│   │   │   ├── helpers.ts
│   │   │   └── signaling.ts
│   │   └── index.ts
│   ├── uploads/ (created automatically)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── UserAvatar.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostComposer.tsx
│   │   │   ├── LikeButton.tsx
│   │   │   ├── FollowButton.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   └── LiveButton.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useWebRTC.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Feed.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── Live.tsx
│   │   │   ├── LiveRoom.tsx
│   │   │   ├── About.tsx
│   │   │   └── auth/
│   │   │       ├── Login.tsx
│   │   │       └── Register.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md
```

## Key Features in Detail

### Authentication
- JWT token-based authentication
- User registration with username, display name, email
- Login with email or username
- Protected routes and API endpoints

### Posts & Social Features
- Image and video upload (up to 100MB)
- Post feed with infinite scroll
- Like and unlike posts
- Comment system with real-time updates
- User profiles with follower/following system

### Live Streaming (MVP)
- WebRTC-based streaming (4-minute limit)
- Simple signaling server for peer connections
- Host and viewer modes
- Stream discovery page

### Mobile Responsive
- Mobile-first design
- Bottom navigation for mobile
- Responsive grid layouts
- Touch-friendly interactions

## Environment Variables

### Server (.env)
```env
MONGODB_URI=mongodb://localhost:27017/r4m
JWT_SECRET=your_super_secret_jwt_key
SERVER_PORT=5000
CLIENT_URL=http://localhost:5173
```

## Production Considerations (TODOs)

This is an MVP implementation. For production deployment:

1. **Media Storage**: Replace local file storage with cloud storage (AWS S3, Cloudinary)
2. **Live Streaming**: Use dedicated streaming infrastructure (Agora, Twilio, AWS IVS)
3. **Database**: Use MongoDB Atlas or managed database service
4. **Security**: Add rate limiting, input validation, CORS configuration
5. **Performance**: Add caching (Redis), CDN for media files
6. **Monitoring**: Add logging, error tracking, analytics
7. **Deployment**: Use Docker, CI/CD pipelines, cloud hosting

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Make sure MongoDB is running locally
   - Check the `MONGODB_URI` in your `.env` file

2. **File Upload Issues**:
   - Check that `/server/uploads` directory exists
   - Verify file permissions

3. **WebRTC Not Working**:
   - Ensure you're using HTTPS in production
   - Browser must support WebRTC (most modern browsers do)
   - Check browser permissions for camera/microphone

4. **CORS Issues**:
   - Verify `CLIENT_URL` in server `.env` matches your frontend URL

## License

This project is for educational/portfolio purposes. See individual component licenses for third-party dependencies.