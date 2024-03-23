import { Router } from "express";
const authController = require('../controllers/authController');
const { requireAuth, isAdmin } = require('../middleware/authmiddleware');
import schemaValidator from "../middleware/schemaValidator";

const router = Router();

//signing a user up
router.post(
    "/signup",
  /*   schemaValidator("/signup"), */
    authController.signup_post,
    (req: any, res: any) => {
      return res.send("Sign up complete");
    }
);


//Logging a user in
router.post(
    "/login",
    schemaValidator("/login"),
    authController.login_post,
    (req: any, res: any) => {
      return res.send("Logged in successfully");
    }
);

//logging a user out
router.post('/logout', authController.logout);

//getting all users
router.get('/users', requireAuth, isAdmin, authController.allUsers);

//updating the users role
router.put('/users/:userId', requireAuth, isAdmin, authController.updateUserRole);

//deleting a user
router.delete('/users/:userId', requireAuth, isAdmin, authController.deleteUser);

module.exports = router;
