const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    refreshToken: {type: String, required: true}
})

module.exports = new mongoose.model('Token', tokenSchema)