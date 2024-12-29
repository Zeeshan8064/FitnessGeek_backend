const jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
    const authToken = req.cookies.authToken;
    const refreshToken = req.cookies.refreshToken;

    if (!authToken || !refreshToken) {
        return res.status(401).json({ message: 'Authentication failed: No authToken or refreshToken provided', ok: false });
    }

    jwt.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // If authToken is invalid, verify refreshToken
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (refreshErr, refreshDecoded) => {
                if (refreshErr) {
                    return res.status(401).json({ message: 'Authentication failed: Both tokens are invalid', ok: false });
                } else {
                    // Issue new tokens if refreshToken is valid
                    const newAuthToken = jwt.sign({ userId: refreshDecoded.userId }, process.env.JWT_SECRET, { expiresIn: '50m' });
                    const newRefreshToken = jwt.sign({ userId: refreshDecoded.userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '100d' });

                    console.log('New Auth Token:', newAuthToken);
                    console.log('New Refresh Token:', newRefreshToken);

                    // Set new tokens in cookies
                    res.cookie('authToken', newAuthToken, {
                        httpOnly: true,
                        secure: true, // Add secure flag for production
                        sameSite: 'None', // Ensure cross-site cookies work
                    });
                    res.cookie('refreshToken', newRefreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'None',
                    });

                    req.userId = refreshDecoded.userId;
                    req.ok = true;
                    next();
                }
            });
        } else {
            // If authToken is valid
            req.userId = decoded.userId;
            req.ok = true;
            next();
        }
    });
}

module.exports = checkAuth;
