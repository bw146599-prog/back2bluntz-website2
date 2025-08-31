import bcrypt from 'bcryptjs';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { db } from './db';
import { users, type User } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { Express, RequestHandler } from 'express';

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// User authentication functions
export async function createAdmin(username: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password);
  
  const [user] = await db
    .insert(users)
    .values({
      username,
      password: hashedPassword,
      isAdmin: true,
    })
    .returning();
    
  return user;
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));
    
  if (!user) {
    return null;
  }
  
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }
  
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));
    
  return user || null;
}

// Middleware to check if user is authenticated
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Middleware to check if user is admin
export const requireAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const user = await getUserById(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Setup authentication routes
export function setupAuth(app: Express) {
  app.use(getSession());
  
  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }
      
      const user = await authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      if (!user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Login failed' });
        }
        res.json({ message: 'Login successful', user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });
  
  // Check auth status
  app.get('/api/auth/me', async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const user = await getUserById(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      res.json({ user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
    } catch (error) {
      res.status(500).json({ message: 'Authentication check failed' });
    }
  });
  
  // Create first admin (only if no admins exist)
  app.post('/api/auth/setup', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }
      
      // Check if any admin users already exist
      const [existingAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.isAdmin, true))
        .limit(1);
        
      if (existingAdmin) {
        return res.status(403).json({ message: 'Admin already exists' });
      }
      
      const admin = await createAdmin(username, password);
      res.status(201).json({ 
        message: 'Admin created successfully', 
        user: { id: admin.id, username: admin.username, isAdmin: admin.isAdmin } 
      });
    } catch (error) {
      console.error('Admin setup error:', error);
      res.status(500).json({ message: 'Failed to create admin' });
    }
  });
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}