import { Request, Response } from 'express';
const User = require('../models/user');
import dotenv from "dotenv";
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// CONFIGURE DOTENV
dotenv.config();


const maxAge = 3 * 24 * 60 * 60;

const createToken = (id:any, role: any) => {
    return jwt.sign({ id, role }, 'ELYSE', {
        expiresIn:  maxAge
    })
}


module.exports.signup_post = async(req: any, res: any) => {
    const { email, password, role } = req.body;
    
    try {
         // Check if email already exists
         const existingUser = await User.findOne({ email });
         if (existingUser) {
             return res.status(400).json({ error: 'Email already exists' });
         }

        const user = await User.create({ email, password, role });
        res.status(201).json({ user: { _id: user._id, email: user.email, role: user.role } });

    } catch (err: any) {

        // Handle validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        } else if ( err && err.code === 11000 ) {
            res.status(400).send('The email already exists');
            return;
        }

        console.log(err);
        res.status(400).send('error, user not created');

    }

}

module.exports.login_post = async(req: any, res: any) => {
    const { email, password } = req.body;

    // Check if email or password is missing
    if (!email || !password) {
        return res.status(422).json({ error: 'Email and password are required.' });
    }

    try {
        //const user = await User.login(email, password);
        const user = await User.findOne({ email });
        const userpassword = user.password;
        //console.log(userpassword, password, user);

        if (user) {
            //console.log(user);
            const auth = await bcrypt.compare(password, userpassword);
            //console.log(auth);
            if(auth){
                const token = createToken(user._id, user.role);
                //console.log(token);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                return res.status(200).json({ user: { _id: user._id, email: user.email, role: user.role }, token });
            } else{
                //console.log("failed");
                return res.status(400).json({ error: 'Invalid credentials. Please check your email and password.' });
            }
            //console.log('out');
        } else {
            return res.status(400).json({ error: 'Invalid credentials. Please check your email and password.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while logging in.' });
    }
}


module.exports.logout = (req: any, res: any) => {
    res.cookie('jwt', "", { maxAge: 1 });
    res.send('Logged out successfully')
}


module.exports.allUsers = async (req: any, res: any) => {
    try {
        const users = await User.find({}, '-password');
        res.send(users);
    } catch (err) {
        res.status(400).json({ err: 'Error retrieving the users' });
    }
}

module.exports.updateUserRole = async(req: any, res: any) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
    
        if (!user) {
            return res.status(404).json({ message: "User not found" + userId, userId: userId });
        }
    
        const userNewRole = (user.role === 'admin') ? 'user' : 'admin';
        
        await User.findByIdAndUpdate(userId, { role: userNewRole });
        const users = await User.find({}, '-password');
    
        res.status(200).json({ message: "User role updated successfully", users });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports.deleteUser = async(req: any, res: any) => {
    const userId = req.params.userId;
    try {
        const deletedUser = await User.findByIdAndDelete(userId).select('-password');
        const users = await User.find({}, '-password');
        res.send({ deletedUser, users });
    } catch (err) {
        console.error("Error deleting user:", err);
    }
}