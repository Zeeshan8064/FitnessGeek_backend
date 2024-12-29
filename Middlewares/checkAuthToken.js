const jwt = require('jsonwebtoken');
const User = require("../Models/UserSchema"); // Import your User model or appropriate database handler

function checkAuth(req, res, next) {
    const authToken = req.cookies.authToken;
    const refreshToken = req.cookies.refreshToken;

    if (!authToken || !refreshToken) {
        return res.status(401).json({
            message: 'Authentication failed: No authToken or refreshToken provided',
            ok: false,
        });
    }

    // Verify authToken
    jwt.verify(authToken, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            // Verify refreshToken if authToken is invalid
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (refreshErr, refreshDecoded) => {
                if (refreshErr) {
                    return res.status(401).json({
                        message: 'Authentication failed: Both tokens are invalid',
                        ok: false,
                    });
                }

                try {
                    // Fetch user details from database using refreshDecoded.userId
                    const user = await User.findById(refreshDecoded.userId);
                    if (!user) {
                        return res.status(404).json({
                            message: 'User not found',
                            ok: false,
                        });
                    }

                    // Generate new tokens
                    const newAuthToken = jwt.sign(
                        { userId: user._id },
                        process.env.JWT_SECRET,
                        { expiresIn: '50m' }
                    );
                    const newRefreshToken = jwt.sign(
                        { userId: user._id },
                        process.env.JWT_REFRESH_SECRET,
                        { expiresIn: '100d' }
                    );

                    // Set new tokens in cookies
                    res.cookie('authToken', newAuthToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'None',
                    });
                    res.cookie('refreshToken', newRefreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'None',
                    });

                    // Attach userId to the request object
                    req.userId = user._id;
                    req.ok = true;
                    next();
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    return res.status(500).json({
                        message: 'Internal server error',
                        ok: false,
                    });
                }
            });
        } else {
            // If authToken is valid, attach userId to the request object
            req.userId = decoded.userId;
            next();
        }
    });
}

module.exports = checkAuth;
