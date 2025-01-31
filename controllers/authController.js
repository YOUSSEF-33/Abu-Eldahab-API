import { User } from '../models/index.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateVerificationCode } from '../utils/verficationCode.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import bcrypt from "bcryptjs";
import validator from 'validator'; // For email validation

export const register = async (req, res) => {
    const { firstName, lastName, userName, email, password } = req.body;

    // Validate the input data
    if (!firstName || !lastName || !userName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate password length (at least 8 characters)
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(12); // Using 12 rounds for better security
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a verification code
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create the user record
        const user = await User.create({
            firstName,
            lastName,
            userName,
            email,
            password: hashedPassword,
            verificationCode,
            verificationCodeExpires,
        });

        // Send verification email
        await sendVerificationEmail(email, verificationCode);

        // Generate access and refresh tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store the hashed refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Respond with the tokens
        res.status(201).json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password.' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store the refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Send tokens to the client
        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
};

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required.' });
    }

    try {
        // Verify the refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find the user by ID
        const user = await User.findByPk(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token.' });
        }

        // Generate a new access token
        const accessToken = generateAccessToken(user);

        // Optionally, generate a new refresh token (token rotation)
        const newRefreshToken = generateRefreshToken(user);

        // Store the new refresh token in the database
        user.refreshToken = newRefreshToken;
        await user.save();

        // Send the new tokens to the client
        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token.' });
    }
};

export const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if the code matches and is not expired
        if (
            user.verificationCode === code &&
            new Date(user.verificationCodeExpires) > new Date()
        ) {
            // Mark the user as verified
            user.isVerified = true;
            user.verificationCode = null; // Clear the verification code
            user.verificationCodeExpires = null; // Clear the expiration time
            await user.save();

            res.status(200).json({ message: 'Email verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid or expired code' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a new verification code
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Update the user's record with the new code and expiration time
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        await user.save();

        // Send the new verification code via email
        await sendVerificationEmail(email, verificationCode);

        res.status(200).json({ message: 'Verification code resent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserInfo = async (req, res) => {
    const { id } = req.user; // Assuming the user ID is passed as a route parameter

    try {
        // Find the user by ID
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password', 'refreshToken'] }, // Exclude sensitive fields
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user's information
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // Fetch all users
        const { count, rows: users } = await User.findAndCountAll({
            attributes: {
                exclude: [
                    'password',
                    'refreshToken',
                    'verificationCode',
                    'verificationCodeExpires'
                ]
            },
            limit,
            offset,
            order: [['id', 'ASC']],
        });
        res.status(200).json({
            users: users,
            total: count,
            page: page, // Current page
            limit: limit,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching users' });
    }
};
