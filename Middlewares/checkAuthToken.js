const jwt = require('jsonwebtoken');
const { User } = require('../Models/UserSchema'); // Make sure to import your User model

function checkAuth(req, res, next) {
    const authToken = req.cookies.authToken;
    const refreshToken = req.cookies.refreshToken;

    // If no tokens are provided, send a failure response
    if (!authToken || !refreshToken) {
        return res.status(401).json({ message: 'Authentication failed: No authToken or refreshToken provided', ok: false });
    }

    // Verify the authToken
    jwt.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // If authToken is invalid, verify the refreshToken
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (refreshErr, refreshDecoded) => {
                if (refreshErr) {
                    return res.status(401).json({ message: 'Authentication failed: Both tokens are invalid', ok: false });
                } else {
                    // If refreshToken is valid, create new tokens
                    const newAuthToken = jwt.sign({ userId: refreshDecoded.userId }, process.env.JWT_SECRET, { expiresIn: '50m' });
                    const newRefreshToken = jwt.sign({ userId: refreshDecoded.userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '100d' });

                    // Set the new tokens in cookies
                    res.cookie('authToken', newAuthToken, { httpOnly: true, secure: true, sameSite: 'None' });
                    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None' });

                    req.userId = refreshDecoded.userId;
                    next();
                }
            });
        } else {
            // If authToken is valid, proceed to the next middleware
            req.userId = decoded.userId;
            next();
        }
    });
}

// Function to create and store new tokens
function createTokens(user) {
    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '50m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '100d' });

    return { authToken, refreshToken };
}

module.exports = { checkAuth, createTokens };
