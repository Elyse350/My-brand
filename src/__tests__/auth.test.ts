import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
const User = require('../models/user');
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


describe("Users", () => {

    describe("Given correct input", () => {

        it("Should create a new user", async() => {
            const newUser = {
                email: "usertest@gmail.com",
                password: "usertest"
            }

            const signupResponse  = await request(app)
            .post('/api/auth/signup')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect((res) => {
                const responseBody = res.body;
                expect(responseBody).toHaveProperty("user");
                const user = responseBody.user;
                expect(user).toHaveProperty("_id");
                expect(user).toHaveProperty("email");
                expect(user).toHaveProperty("role");
            });

        });

    });

    describe("Given the admin is logged in", () => {

        it("Should update user's role", async() => {
            const loginResponse  = await request(app)
            .post('/api/auth/login')
            .send({
                email: adminEmail,
                password: adminPassword
            });

            const updateUser = await User.findOne({ email: "usertest@gmail.com" });
            if (!updateUser) {
                throw new Error("Blog with title you provided not found");
            }

            // Extract the cookies from the login response
            const cookies = loginResponse.headers['set-cookie'];
            const userId = updateUser._id;

            const signupResponse  = await request(app)
            .put(`/api/auth/users/${userId}`)
            .set('Cookie', cookies) // Set the cookies in the request
            .expect('Content-Type', /json/)
            .expect((res) => {
                const responseBody = res.body;
                expect(responseBody).toHaveProperty("message", "User role updated successfully");
            });

        });

    });

    describe("Given we enter correct data", () => {

        it("Should log in the user", async() => {
            const loginResponse  = await request(app)
            .post('/api/auth/login')
            .send({
                email: "usertest@gmail.com",
                password: "usertest"
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                const responseBody = res.body;
                expect(responseBody).toHaveProperty("user");
                const user = responseBody.user;
                expect(user).toHaveProperty("_id");
                expect(user).toHaveProperty("email");
                expect(user).toHaveProperty("role");
                expect(responseBody).toHaveProperty("token");
            });

        });

    });

    describe("Given we visit logout route", () => {

        it("Should log out the user", async() => {
            const logoutResponse  = await request(app)
            .post('/api/auth/logout')
            .expect(200)
            .expect('Logged out successfully');
        });

    });

    describe("Given the admin is logged in", () => {

        it("Should get a list of all the users", async() => {
            const loginResponse  = await request(app)
            .post('/api/auth/login')
            .send({
                email: adminEmail,
                password: adminPassword
            });

            // Extract the cookies from the login response
            const cookies = loginResponse.headers['set-cookie'];

            const getUsersResponse  = await request(app)
            .get(`/api/auth/users`)
            .set('Cookie', cookies) // Set the cookies in the request
            .expect(200)
            .expect((res) => {
                const responseBody = res.body;
                expect(Array.isArray(responseBody)).toBe(true);
            });

        });

    });

    describe("Given the admin is logged in", () => {

        it("Should Delete the user", async() => {
            const loginResponse  = await request(app)
            .post('/api/auth/login')
            .send({
                email: adminEmail,
                password: adminPassword
            });

            const deleteUser = await User.findOne({ email: "usertest@gmail.com" });
            if (!deleteUser) {
                throw new Error("Blog with title you provided not found");
            }

            // Extract the cookies from the login response
            const cookies = loginResponse.headers['set-cookie'];
            const userId = deleteUser._id;

            const deleteResponse  = await request(app)
            .delete(`/api/auth/users/${userId}`)
            .set('Cookie', cookies) // Set the cookies in the request
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                const responseBody = res.body.deletedUser;
                expect(responseBody).toHaveProperty("_id");
                expect(responseBody).toHaveProperty("email");
                expect(responseBody).toHaveProperty("role");
            });

        });

    });

});