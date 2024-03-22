
const jwt = require('jsonwebtoken');
import dotenv from "dotenv";


// CONFIGURE DOTENV
dotenv.config();

const requireAuth = (req: any, res: any, next: (err?: Error) => void) => {

    const tokenn = req.cookies.jwt;

    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    //console.log(token);
    token = (token) ? token : tokenn;


    //check json web token exists and is verified

    if(token){
        jwt.verify(token,  'ELYSE', (err: any, decodedToken: any) => {
            if(err){
                console.log(err.message);
                //res.redirect('/login');
            } else{
                // console.log(decodedToken);
                next();
            }
        })
    }
    else{
        res.status(403).send('Access forbidden: You are not logged in');
    }
}



const isAdmin = (req: any, res: any, next: (err?: Error) => void) => {
    // Retrieve the JWT token from the any cookie
    const tokenn = req.cookies.jwt;

    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    //console.log(token);
    token = (token) ? token : tokenn;

    // Check if token exists
    if (token) {
        // Verify the token
        jwt.verify(token, 'ELYSE', (err: any, decodedToken: any) => {
            if (err) {
                // If verification fails (e.g., token expired or invalid), return a 403 Forbidden any
                res.status(403).send('Access forbidden: You do not have permission to access this resource.');
            } else {
                // If token is valid, check if the user has the admin role
                if (decodedToken.role === 'admin') {
                    // If the user is an admin, allow access to the next middleware/route handler
                    next();
                } else {
                    // If the user is not an admin, return a 403 Forbidden any
                    res.status(403).send('Access forbidden: You do not have permission to access this resource.');
                }
            }
        });
    } else {
        // If token doesn't exist, return a 403 Forbidden any
        res.status(403).send('Access forbidden: You do not have permission to access this resource.');
    }
};


module.exports = { requireAuth, isAdmin };