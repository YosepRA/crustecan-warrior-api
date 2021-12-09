const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: String,
  email: String,
  tickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
});

userSchema.plugin(passportLocalMongoose);

const User = model('User', userSchema);

module.exports = User;
