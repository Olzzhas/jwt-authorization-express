const authMiddleware = require('./middlewares/auth-middleware');
const userService = require('./services/user-service');

const Router = require('express').Router;
const router = new Router();

const {body} = require('express-validator')

router.post('/create', body('email').isEmail(), userService.registration)

router.post('/login', userService.login)

router.post('/logout', userService.logout)

router.get('/refresh', userService.refresh)

router.get('/',authMiddleware, (req, res) => {
    return res.json(process.env.JWT_ACCESS_SECRET)
})



module.exports = router;