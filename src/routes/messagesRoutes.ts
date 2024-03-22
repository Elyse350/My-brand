import express, {  NextFunction } from 'express';
import Message from '../models/usermessages';
const { requireAuth, isAdmin } = require('../middleware/authmiddleware');
import schemaValidator from "../middleware/schemaValidator";

const router = express.Router();

// Get a list of messages from the db
router.get('/usermessages', requireAuth , isAdmin, async (req: any, res: any, next: NextFunction) => {
    try {
        const messages = await Message.find({});
        res.send(messages);
    } catch (err) {
        next(err);
    }
});

router.use((err: any, req: any, res: any, next: NextFunction) => {
        // Return a 401 Unauthorized any if authentication fails
        res.status(401).json({ error: 'Unauthorized: Please log in.' });
});

// Add a new message to the db
router.post('/contactme', schemaValidator("/contactme"), async (req: any, res: any, next: NextFunction) => {
    try {
        const messages = await Message.create(req.body);
        res.send(messages);
    } catch (err) {
        next(err);
    }
});

// Delete a message from the db
router.delete('/usermessages/:id', requireAuth, isAdmin, async (req: any, res: any, next: NextFunction) => {
    try {
        const deletedMessage = await Message.findByIdAndDelete({ _id: req.params.id });
        res.send(deletedMessage);
    } catch (err) {
        next(err);
    }
});

export default router;