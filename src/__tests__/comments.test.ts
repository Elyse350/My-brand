import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
import Blog from '../models/blogs';
const User = require('../models/user');
import Comment from '../models/comments';
import dotenv from "dotenv";


// CONFIGURE DOTENV
dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});
  
afterAll(async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error closing the database connection:', error);
  }
});


describe("Commenting on a blog", () => {

    describe("Given the blog exists", () => {

      it("should return the comment", async () => {
    
    
        await Blog.create({
            "title": "Test comment blog",
            "snippet": "Learn about the importance of maintaining healthy eating habits for overall well-being.",
            "imageUrl": "https://example.com/healthyfood.jpg",
            "category": "Health",
            "author": "Emily Johnson",
            "body": "Maintaining a balanced diet is essential for promoting good health and preventing chronic diseases. Incorporating a variety of nutrient-rich foods into your meals ensures that your body receives the vitamins, minerals, and other essential nutrients it needs to function optimally. Aim to include a colorful array of fruits and vegetables, whole grains, lean proteins, and healthy fats in your daily diet. Additionally, stay hydrated by drinking plenty of water throughout the day. By making informed food choices and practicing portion control, you can achieve and maintain a healthy weight while supporting your overall well-being."
        });
    
    
          const testBlog = await Blog.findOne({title: "Test comment blog"});
          if (!testBlog) {
            throw new Error("Test blog not found in the database");
          }
          const blogId = testBlog._id;
          await request(app)
          .post(`/api/blogs/${blogId}/comments`)
          .send({
            name: "Tester",
            comment: "Test comment"
          })
          .expect(201)
          .expect((res) => {
            const responseBody = res.body;
            expect(responseBody).toHaveProperty("name");
            expect(responseBody).toHaveProperty("comment");
          });
    
    
          /*const testBlogdelete = await Blog.findOne({title: "Healthy Eating Habits for a Balanced Diet"});
          if (!testBlogdelete) {
            throw new Error("Test blog not found in the database");
          }
          const blogIddelete = testBlogdelete._id;
          await Blog.findByIdAndDelete({_id: blogIddelete});*/
      }, 15000);
    
    });

    describe("Given the user retrives all the comments on a blog", () => {

        it("should return all the comments", async() => {

            const testBlog = await Blog.findOne({title: "Test comment blog"});
            if (!testBlog) {
              throw new Error("Test blog not found in the database");
            }
            const blogId = testBlog._id;

            const getUsersResponse  = await request(app)
            .get(`/api/blogs/${blogId}/comments`)
            .expect(200)
            .expect((res) => {
                const responseBody = res.body;
                expect(Array.isArray(responseBody)).toBe(true);
            });

        });

    });

    describe("Given the admin is logged in", () => {

        it("should delete a comment", async() => {

            const loginResponse  = await request(app)
            .post('/api/auth/login')
            .send({
              email: adminEmail,
              password: adminPassword
            });

            const testBlog = await Blog.findOne({title: "Test comment blog"});
            const testComment = await Comment.findOne({comment: "Test comment"});
            if (!testBlog || !testComment) {
              throw new Error("Test blog not found in the database");
            }
            const blogId = testBlog._id;
            const commentId = testComment._id;

            // Extract the cookies from the login response
            const cookies = loginResponse.headers['set-cookie'];

            const getUsersResponse  = await request(app)
            .delete(`/api/blogs/${blogId}/${commentId}`)
            .set('Cookie', cookies) // Set the cookies in the request
            .expect(200)
            .expect((res) => {
                const responseBody = res.body;
                expect(responseBody).toHaveProperty("name");
                expect(responseBody).toHaveProperty("comment");
            });

        });

    });

    describe("Given the user likes a blog", () => {

        it("should like the blog", async() => {

            await User.create({
                email: "usertestlike@gmail.com",
                password: "usertestlike"
            });

            const loginResponse  = await request(app)
            .post('/api/auth/login')
            .send({
                email: "usertestlike@gmail.com",
                password: "usertestlike"
            });

            // Extract the cookies from the login response
            const cookies = loginResponse.headers['set-cookie'];

            const testBlog = await Blog.findOne({title: "Test comment blog"});
            if (!testBlog) {
              throw new Error("Test blog not found in the database");
            }
            const blogId = testBlog._id;

            const getUsersResponse  = await request(app)
            .post(`/api/blogs/${blogId}/like`)
            .set('Cookie', cookies) // Set the cookies in the request
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                const responseBody = res.body;
                expect(responseBody).toHaveProperty("message", "Blog liked successfully");
            });

        });

    });

    describe("Given the user has liked the blog before", () => {

        it("should unlike the blog", async() => {

            const loginResponse  = await request(app)
            .post('/api/auth/login')
            .send({
                email: "usertestlike@gmail.com",
                password: "usertestlike"
            });

            // Extract the cookies from the login response
            const cookies = loginResponse.headers['set-cookie'];

            const testBlog = await Blog.findOne({title: "Test comment blog"});
            const testUser = await User.findOne({email: "usertestlike@gmail.com"});
            if (!testBlog || !testUser) {
              throw new Error("Test blog not found in the database");
            }
            const blogId = testBlog._id;
            const userId = testUser._id;

            const getUsersResponse  = await request(app)
            .post(`/api/blogs/${blogId}/like`)
            .set('Cookie', cookies) // Set the cookies in the request
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                const responseBody = res.body;
                expect(responseBody).toHaveProperty("message", "Blog unliked successfully");
            });

            await Blog.findByIdAndDelete({_id: blogId});
            await User.findByIdAndDelete({_id: userId});

        });

    });

})