import http from 'http';
import path from 'path';
import express, { Express, Request, Response } from "express";
import dotenv from 'dotenv';
import connectDB from "./config/db";
import userRoutes from './routes/userRoutes'
import  session  from 'express-session';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
app.use(express.json());

//session
declare module 'express-session' {
  interface Session {
    userDetails?: { userName: string, email: string, password: string };
    otp?: string;
    otpGeneratedTime?: number; 
    email?: string;
  }
}


const sessionSecret= process.env.SESSION_SECRET || 'default_secret_value'

app.use(session({
  secret:sessionSecret, 
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

//route
app.use('/api/users', userRoutes);




connectDB();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
