import User from '../models/user.js';
import { verifyToken } from '../utils/jwt.js';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the access token
    const decoded = verifyToken(token);

    // Fetch the user from the database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Attach the user to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export default authenticate;