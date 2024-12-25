const jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
    const authToken = req.cookies.authToken;
    const refreshToken = req.cookies.refreshToken;

    // console.log("Check Auth Token MIDDLEWARE CALLED", authToken)

    if (!authToken || !refreshToken) {
        return res.status(401).json({ message: 'Authentication failed: No authToken or refreshToken provided' , ok : false });
    }

    jwt.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (refreshErr, refreshDecoded) => {
                if (refreshErr) {
                    return res.status(401).json({ message: 'Authentication failed: Both tokens are invalid', ok: false });
                } else {
                    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '50m' });
                    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '100d' });
                    console.log('Auth token:', authToken);
                    console.log('Refresh token:', refreshToken);
                    res.cookie('authToken', newAuthToken, { httpOnly: true });
                    res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
                    req.userId = refreshDecoded.userId;
                    req.ok = true;
                    next();
                }
            });
        } else {
            req.userId = decoded.userId;
            next();
        }
    });
}

module.exports = checkAuth;