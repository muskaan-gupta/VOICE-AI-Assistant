import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { Schema, Document, Model } from 'mongoose'

// MongoDB connection string - should be set in environment variables
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/voice-assistant'

// Global connection variable to prevent multiple connections
let isConnected = false

// Connect to MongoDB
export async function connectToDatabase() {
  if (isConnected) {
    return mongoose.connection
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
    
    isConnected = true
    console.log('✅ Connected to MongoDB')
    return conn
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw new Error('Failed to connect to database')
  }
}

// User interface (updated for MongoDB)
export interface User extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  name: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface UserCreate {
  email: string
  name: string
  password: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface SafeUser {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// User Schema
const userSchema = new Schema<User>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  versionKey: false // Removes __v field
})

// User model
const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', userSchema)

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// User operations
export class UserService {
  // Ensure database connection
  static async ensureConnection() {
    await connectToDatabase()
  }

  // Create user
  static async createUser(userData: UserCreate): Promise<SafeUser> {
    await this.ensureConnection()
    
    const { email, name, password } = userData
    
    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ email })
      if (existingUser) {
        throw new Error('User with this email already exists')
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password)
      
      // Create user
      const user = new UserModel({
        email,
        name,
        password: hashedPassword
      })
      
      const savedUser = await user.save()
      return this.sanitizeUser(savedUser)
      
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('User with this email already exists')
      }
      throw error
    }
  }
  
  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureConnection()
    return UserModel.findOne({ email }).exec()
  }
  
  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    await this.ensureConnection()
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    
    return UserModel.findById(id).exec()
  }
  
  // Authenticate user
  static async authenticateUser(loginData: UserLogin): Promise<SafeUser | null> {
    await this.ensureConnection()
    
    const { email, password } = loginData
    
    const user = await this.getUserByEmail(email)
    if (!user) {
      return null
    }
    
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return null
    }
    
    return this.sanitizeUser(user)
  }
  
  // Remove password from user object and format for frontend
  static sanitizeUser(user: User): SafeUser {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
  
  // Update user
  static async updateUser(id: string, updates: Partial<UserCreate>): Promise<SafeUser | null> {
    await this.ensureConnection()
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    
    try {
      const updateData: any = {}
      
      if (updates.name) {
        updateData.name = updates.name
      }
      
      if (updates.email) {
        updateData.email = updates.email
      }
      
      if (updates.password) {
        updateData.password = await hashPassword(updates.password)
      }
      
      const user = await UserModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).exec()
      
      return user ? this.sanitizeUser(user) : null
      
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('User with this email already exists')
      }
      throw error
    }
  }
  
  // Delete user
  static async deleteUser(id: string): Promise<boolean> {
    await this.ensureConnection()
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false
    }
    
    const result = await UserModel.findByIdAndDelete(id).exec()
    return !!result
  }
  
  // Get all users (admin function)
  static async getAllUsers(): Promise<SafeUser[]> {
    await this.ensureConnection()
    
    const users = await UserModel.find().sort({ createdAt: -1 }).exec()
    return users.map(user => this.sanitizeUser(user))
  }
  
  // Get user count
  static async getUserCount(): Promise<number> {
    await this.ensureConnection()
    return UserModel.countDocuments().exec()
  }
  
  // Search users by name or email (admin function)
  static async searchUsers(searchTerm: string): Promise<SafeUser[]> {
    await this.ensureConnection()
    
    const users = await UserModel.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 }).exec()
    
    return users.map(user => this.sanitizeUser(user))
  }
}

// Export UserModel for direct access if needed
export { UserModel }
