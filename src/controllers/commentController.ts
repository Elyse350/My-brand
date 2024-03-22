
import Comment from '../models/comments';
import Blog from '../models/blogs';

// Create a new comment
export const createComment = async (req: any, res: any) => {
    try {
        const { blogId } = req.params;
        const { name, comment } = req.body;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        //const commentedBlog = await Blog.findById(blogId).populate("comments");

        const newComment = await Comment.create({ name, comment, blog: blogId });

        // Push the new comment directly into the comments array of the blog
        blog.comments.push(newComment);

        await blog.save();

        res.status(201).json(newComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get comments for a specific blog
export const getCommentsByBlogId = async (req: any, res: any) => {
    try {
        const { blogId } = req.params;

        const comments = await Comment.find({ blog: blogId });
        if (!comments) {
            return res.status(404).json({ message: "No comments found for this blog" });
        }

        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//deleting a comment
export const deleteCommentByBlogId = async (req: any, res: any) => {
    try {
        const { commentId, blogId } = req.params;
        
        // Remove the comment directly from the comments collection
        const comment = await Comment.findByIdAndDelete(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Find the blog by its ID
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Remove the comment ID from the comments array of the blog
        blog.comments = blog.comments.filter(comment => comment.toString() !== commentId);

        // Save the changes to the blog
        await blog.save();

        res.status(200).json(comment);
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}