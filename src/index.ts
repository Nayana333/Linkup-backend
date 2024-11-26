import http from 'http';
import path from 'path';
import express, { Express, Request, Response } from "express";
import dotenv from 'dotenv';
import connectDB from "./config/db";
import userRoutes from './routes/userRoutes';
import session from 'express-session';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import adminRoute from "./routes/adminRoute";
import postRoutes from './routes/postRoutes';
import jobRoutes from './routes/jobRoute';
import connectionRoutes from './routes/connectionRoutes';
import chatRoute from './routes/chatRoute';
import { Server } from 'socket.io';
import socketIo_Config from './utils/socket/socket';
import MongoStore from 'connect-mongo';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

connectDB();
declare module 'express-session' {
  interface Session {
    userDetails?: { userName: string, email: string, password: string };
    otp?: string;
    otpGeneratedTime?: number;
    email?: string;
  }
}

const sessionSecret = process.env.SESSION_SECRET || 'default_secret_value';
app.enable("trust proxy");
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60,
    autoRemove: 'native',
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());

const io: Server = new Server(server, {
  cors: { origin:process.env.ORIGIN}
});
socketIo_Config(io);

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: process.env.ORIGIN,
  methods: "GET,HEAD,PUT,PATCH,DELETE,POST",
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoute);
app.use('/api/post', postRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/connect', connectionRoutes);
app.use('/api/chat', chatRoute);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
