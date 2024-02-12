const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    age: {type: Number},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
})

module.exports = new mongoose.model('User', userSchema)