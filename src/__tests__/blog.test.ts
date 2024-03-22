import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
import Blog from '../models/blogs';
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

// Getting a blog by ID
describe("Get a single blog by ID", () => {

  describe("Given the blog exists", () => {

    it("should return the blog", async () => {


      await Blog.create({
        "title": "Healthy Eating Habits for a Balanced Diet",
        "snippet": "Learn about the importance of maintaining healthy eating habits for overall well-being.",
        "imageUrl": "https://example.com/healthyfood.jpg",
        "category": "Health",
        "author": "Emily Johnson",
        "body": "Maintaining a balanced diet is essential for promoting good health and preventing chronic diseases. Incorporating a variety of nutrient-rich foods into your meals ensures that your body receives the vitamins, minerals, and other essential nutrients it needs to function optimally. Aim to include a colorful array of fruits and vegetables, whole grains, lean proteins, and healthy fats in your daily diet. Additionally, stay hydrated by drinking plenty of water throughout the day. By making informed food choices and practicing portion control, you can achieve and maintain a healthy weight while supporting your overall well-being."
      });


      const testBlog = await Blog.findOne({title: "Healthy Eating Habits for a Balanced Diet"});
      if (!testBlog) {
        throw new Error("Test blog not found in the database");
      }
      const blogId = testBlog._id;
      await request(app).get(`/api/blog/blogs/${blogId}`).expect(200);


      const testBlogdelete = await Blog.findOne({title: "Healthy Eating Habits for a Balanced Diet"});
      if (!testBlogdelete) {
        throw new Error("Test blog not found in the database");
      }
      const blogIddelete = testBlogdelete._id;
      await Blog.findByIdAndDelete({_id: blogIddelete});
    }, 15000);

  });

  describe("Given the blog does not exist", () => {

    it("should return a 404", async () => {
      const blogId = new mongoose.Types.ObjectId().toHexString(); // Generate a valid ObjectId
      await request(app).get(`/api/blog/blogs/${blogId}`).expect(404);
    });

  });

});

// Getting all the blogs
describe("Get all blogs", () => {

  it("should return a list of blogs", async () => {
    await request(app).get(`/api/blog/blogs`).expect(200);
  });

});

//Adding a new blog in the database
describe("Creating a new Blog", () => {

  describe("Given the user isnt logged in", () => {

    it("Should send 403 forbidden", async () => {
      const response = await request(app)
        .post('/api/blog/createnew')
        .send({
          title: "Healthy Eating Habits for a Balanced Diet",
          snippet: "Learn about the importance of maintaining healthy eating habits for overall well-being.",
          imageUrl: "https://example.com/healthyfood.jpg",
          category: "Health",
          author: "Emily Johnson",
          body: "Maintaining a balanced diet is essential for promoting good health and preventing chronic diseases. Incorporating a variety of nutrient-rich foods into your meals ensures that your body receives the vitamins, minerals, and other essential nutrients it needs to function optimally. Aim to include a colorful array of fruits and vegetables, whole grains, lean proteins, and healthy fats in your daily diet. Additionally, stay hydrated by drinking plenty of water throughout the day. By making informed food choices and practicing portion control, you can achieve and maintain a healthy weight while supporting your overall well-being."
        })
        .expect(403)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain("Access forbidden: You are not logged in");
        });
    });

  });

  describe("Given the admin is logged in", () => {

    it("Should create the blog", async () => {
      const loginResponse  = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminEmail,
          password: adminPassword
        });
  
      // Extract the cookies from the login response
      const cookies = loginResponse.headers['set-cookie'];
  
      const response = await request(app)
        .post('/api/blog/createnew')
        .set('Cookie', cookies) // Set the cookies in the request
        .send({
          title: "Healthy Eating Habits for a Balanced Diet",
          snippet: "Learn about the importance of maintaining healthy eating habits for overall well-being.",
          imageUrl: "https://example.com/healthyfood.jpg",
          category: "Health",
          author: "Emily Johnson",
          body: "Maintaining a balanced diet is essential for promoting good health and preventing chronic diseases. Incorporating a variety of nutrient-rich foods into your meals ensures that your body receives the vitamins, minerals, and other essential nutrients it needs to function optimally. Aim to include a colorful array of fruits and vegetables, whole grains, lean proteins, and healthy fats in your daily diet. Additionally, stay hydrated by drinking plenty of water throughout the day. By making informed food choices and practicing portion control, you can achieve and maintain a healthy weight while supporting your overall well-being."
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          const responseBody = res.body;
          expect(responseBody).toHaveProperty("title");
          expect(responseBody).toHaveProperty("snippet");
          expect(responseBody).toHaveProperty("category");
        });
    });

  });

});

//updating a blog

describe("updating a Blog", () => {

  describe("Given the admin isn't logged in", () => {

    it("Should return Forbidden", async () => {

      const blog = await Blog.findOne({ title: "Healthy Eating Habits for a Balanced Diet" });
      if (!blog) {
        throw new Error("Blog with title 'Hello there' not found");
      }
      const response = await request(app)
      .put(`/api/blog/blogs/${blog._id}`)
      .send({
        category: "Edited"
      })
        .expect(403)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain("Access forbidden: You are not logged in");
        });

    });

  });

  describe("Given the admin is logged in", () => {

    it("Should Update the blog", async () => {

      const loginResponse  = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminEmail,
          password: adminPassword
        });
  
      // Extract the cookies from the login response
      const cookies = loginResponse.headers['set-cookie'];

      const blog = await Blog.findOne({ title: "Healthy Eating Habits for a Balanced Diet" });
      if (!blog) {
        throw new Error("Blog with title you provided not found");
      }

      const blogId = blog._id;
      //console.log("Blog ID from the database:", blogId); // Add this line to log the blogId retrieved from the database
      // Add this line to log the blogId from the URL
      const updatedblog = {
        category: "Edited"
      };
  
      const url = `/api/blog/blogs/${blogId}`;
      await request(app)
          .put(url)
          .set('Cookie', cookies) // Set the cookies in the request
          .send(updatedblog)// Set the updated category
          .expect(200)
          .expect('Content-Type', /json/)
          .expect((res) => {
              const responseBody = res.body;
              expect(responseBody).toHaveProperty("title");
              expect(responseBody).toHaveProperty("snippet");
              expect(responseBody).toHaveProperty("category");
              expect(responseBody).toHaveProperty("category", "Edited"); // Assert the updated category
          });
      //console.log("Blog ID from the URL:", blogId);

    });

  });

});

// Delete a blog from the db
describe("Deleting a Blog", () => {

  describe("Given the admin isn't logged in", () => {

    it("Should return Forbidden", async () => {

      const blog = await Blog.findOne({ title: "Healthy Eating Habits for a Balanced Diet" });
      if (!blog) {
        throw new Error("Blog with title 'Hello there' not found");
      }
      const response = await request(app)
      .delete(`/api/blog/blogs/${blog._id}`)
        .expect(403)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain("Access forbidden: You are not logged in");
        });

    });

  });

  describe("Given the admin is logged in", () => {

    it("Should Delete the blog", async () => {

      const loginResponse  = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminEmail,
          password: adminPassword
        });
  
      // Extract the cookies from the login response
      const cookies = loginResponse.headers['set-cookie'];

      const blog = await Blog.findOne({ title: "Healthy Eating Habits for a Balanced Diet" });
      if (!blog) {
        throw new Error("Blog with title you provided not found");
      }

      const blogId = blog._id;
      //console.log("Blog ID from the database:", blogId); // Add this line to log the blogId retrieved from the database
      // Add this line to log the blogId from the URL
  
      const url = `/api/blog/blogs/${blogId}`;
      await request(app)
          .delete(url)
          .set('Cookie', cookies) // Set the cookies in the request
          .expect(200)
          .expect('Content-Type', /json/)
          .expect((res) => {
              const responseBody = res.body;
              expect(responseBody).toHaveProperty("title");
              expect(responseBody).toHaveProperty("snippet");
              expect(responseBody).toHaveProperty("category");
              expect(responseBody).toHaveProperty("category", "Edited"); // Assert the updated category
          });
      //console.log("Blog ID from the URL:", blogId);

    });

  });

});