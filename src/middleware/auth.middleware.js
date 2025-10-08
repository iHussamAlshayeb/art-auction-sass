import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Get token from header (e.g., "Bearer eyJhbG...")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Attach the user's info to the request object
      req.user = {
        id: decoded.userId,
        role: decoded.role,
      };

      // 5. Proceed to the next function (the actual route handler)
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    // This middleware should run *after* the 'protect' middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
    }
    next();
  };
};