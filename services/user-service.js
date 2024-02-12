const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");
const tokenModel = require("../models/token-model");
const userModel = require("../models/user-model");
const tokenService = require("./token-service");
const bcrypt = require('bcryptjs')

const {validationResult} = require('express-validator')


class UserService{
    async registration(req, res, next){
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()){
                return next(ApiError.BadRequest('Validation failed', errors.array()))
            }

            const {name, email, age, password} = req.body
    
            const candidate = await userModel.findOne({email})
    
            if (candidate) {
                throw ApiError.BadRequest('This email is already in use!')
            }

            const passwordHash = await bcrypt.hash(password, 8);
    
            const user = await userModel.create({
                name, 
                email, 
                age, 
                password: passwordHash
            })

            const userDto = new UserDto(user)
            const tokens = tokenService.generateTokens({...userDto})

            await tokenService.saveToken(userDto.id, tokens.refreshToken)

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

            return res.json({...tokens, user: userDto})
        } catch (error) {
            next(error)
        }
    }

    async login(req, res, next){
        try {
            const {email, password} = req.body
            
            const user = await userModel.findOne({email})
            if (!user){
                throw ApiError.BadRequest("Email or Password is not correct!")
            }

            const isPassEquals = await bcrypt.compare(password, user.password)
            if(!isPassEquals){
                throw ApiError.BadRequest("Email or Password is not correct!")
            }

            const userDto = new UserDto(user)
            const tokens = tokenService.generateTokens({...userDto})
            await tokenService.saveToken(userDto.id, tokens.refreshToken)

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json({...tokens, user: userDto})
        } catch (error) {
            next(error)
        }
    }

    async logout(req, res, next){
        try {
            const {refreshToken} = req.cookies;

            const token = await tokenService.removeToken(refreshToken);

            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (error) {
            next(error)
        }
    }

    async refresh(req, res, next){
        try {
            const { refreshToken } = req.cookies

            if (!refreshToken){
                throw ApiError.UnauthorizedError()
            }

            const userData = tokenService.validateAccessToken(refreshToken)
            const tokenFromDb = await tokenService.findToken(refreshToken)

            if (!userData || !tokenFromDb) {
                throw ApiError.UnauthorizedError()
            }

            const user = await userModel.findById(userData.id)

            const userDto = new UserDto(user)
            const tokens = tokenService.generateTokens({...userDto})

            await tokenService.saveToken(userDto.id, tokens.refreshToken)

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json({...tokens, user: userDto})
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserService()