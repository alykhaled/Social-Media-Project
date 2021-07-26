const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {userInputError, UserInputError} = require('apollo-server');

const { validateRegisterInput, validateLoginInput }= require('../../util/validators')
const {SECRET_KEY} = require('../../config');
const User = require('../../models/User')

function generateToken(user)
{
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    },
     SECRET_KEY,
    {expiresIn: '1h'});
}

module.exports = {
    Mutation: {
        async login(_,{username,password})
        {
            const {valid, errors} = validateLoginInput(username, password);
            if(!valid)
            {
                throw new UserInputError('Errors',{ errors });
            }
            const user = await User.findOne({username:username});
            if(!user)
            {
                throw new UserInputError('User not found');
            }
            const isValid = await bcrypt.compare(password, user.password);
            if(!isValid)
            {
                throw new UserInputError('Password is incorrect');
            }
            const token = generateToken(user);
            return {
                ...user._doc,
                id: user._id,
                token

            }

        },
        async register(_,{registerInput: {username, email, password, confirmPassword}})
        {
            //TODO: validate input
            const {valid, errors} = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid)
            {
                throw new UserInputError('Errors',{ errors });
            }
            //Make sure user doesn't already exist
            const user = await User.findOne({username});
            if(user)
            {
                throw new UserInputError('Username already exists',{
                    errors: {
                        username: 'Username already exists'
                    }
                });
            }
            //Hash the password and create an auth token
            password = await bcrypt.hash(password, 12);
            const newUser = new User({
                username,
                email,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();
            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token

            }
        }
    }
}