const jwt = require('jsonwebtoken')

exports.cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token;

    try {
        const user = jwt.verify(token, 'fennec');
        req.user = user
        next()
    } catch (error) {
        res.clearCookie("token")
    }
}