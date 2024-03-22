import express, { NextFunction } from 'express';
import Blog from '../models/blogs';
import Comment from '../models/comments';
import {Like} from '../models/likes';
const { requireAuth, isAdmin } = require('../middleware/authmiddleware');
import schemaValidator from "../middleware/schemaValidator";

const router = express.Router();


// Get a list of blogs from the db
router.get('/blogs', async (req: any, res: any, next: NextFunction) => {
    try {
        console.log('executed get')
        const blogs = await Blog.find({}).populate("comments");
        res.send(blogs);
    } catch (err) {
        console.log(err)
        next(err);
    }
});


//get a single blog
router.get('/blogs/:id', async (req: any, res: any, next: NextFunction) => {
    try {
        //console.log(req.params);
        const blog = await Blog.findById(req.params.id).populate("comments");

        if (!blog) {
            // If blog is not found, return a 404 any
            return res.status(404).send("Blog not found");
        }
        
        res.send(blog);
    } catch (err) {
        next(err);
    }
});

// Add a new blog to the db
router.post('/createnew', schemaValidator("/blog/createnew"), requireAuth, isAdmin, async (req: any, res: any, next: NextFunction) => {
    try {
        const blog = await Blog.create(req.body);
        res.send(blog);
    } catch (err) {
        console.error('Error creating blog:', err);
        next(err);
    }
});


// Update a blog in the db
router.put('/blogs/:id', requireAuth, isAdmin, async (req: any, res: any, next: NextFunction) => {
    try {
        await Blog.findByIdAndUpdate({ _id: req.params.id }, req.body);
        const updatedBlog = await Blog.findOne({ _id: req.params.id });

        if (!updatedBlog) {
            return res.status(404).send("Blog not found");
        }
        //console.log(updatedBlog);
        res.send(updatedBlog);
    } catch (err) {
        next(err);
    }
});

// Delete a blog from the db
router.delete('/blogs/:id', requireAuth, isAdmin, async (req: any, res: any, next: NextFunction) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete({ _id: req.params.id });
        const deletedLike = await Like.deleteMany({ blogId: req.params.id });
        const deletedComment = await Comment.deleteMany({ blog: req.params.id });
        res.send(deletedBlog);
    } catch (err) {
        next(err);
    }
});

export default router;