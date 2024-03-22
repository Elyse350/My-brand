import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
import Message from '../models/usermessages';
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


describe("Messages", () => {

    describe("Given the user sends a message", () => {

        it("should send a message", async() => {

            const messageResponse  = await request(app)
            .post('/api/contactme')
            .send({
                name: "useTest",
                email: "usertest@gmail.com",
                message: "my message"
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                const responseBody = res.body;
                expect(responseBody).toHaveProperty("_id");
                expect(responseBody).toHaveProperty("name");
                expect(responseBody).toHaveProperty("email");
                expect(responseBody).toHaveProperty("message");
            });

        });

    });

    describe("Given the admin retrives all the messages", () => {

        it("should return all the messages", async() => {

            const loginResponse  = await request(app)
            .post('/api/auth/login')
            .send({
              email: adminEmail,
              password: adminPassword
            });

            // Extract the cookies from the login response
            const cookies = loginResponse.headers['set-cookie'];

            const getUsersResponse  = await request(app)
            .get(`/api/usermessages`)
            .set('Cookie', cookies) // Set the cookies in the request
            .expect(200)
            .expect((res) => {
                const responseBody = res.body;
                expect(Array.isArray(responseBody)).toBe(true);
            });

        });

    });

    describe("Given the admin is logged in", () => {

        it("Should delete the message", async() => {
            const loginResponse  = await request(app)
            .post('/api/auth/login')
            .send({
              email: adminEmail,
              password: adminPassword
            });

            const deleteMessage = await Message.findOne({ email: "usertest@gmail.com" });
            if (!deleteMessage) {
                throw new Error("Blog with title you provided not found");
            }

            // Extract the cookies from the login response
            const cookies = loginResponse.headers['set-cookie'];
            const messageId = deleteMessage._id;
            console.log(messageId);

            const deleteResponse  = await request(app)
            .delete(`/api/usermessages/${messageId}`)
            .set('Cookie', cookies) // Set the cookies in the request
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                const responseBody = res.body;
                expect(responseBody).toHaveProperty("_id");
                expect(responseBody).toHaveProperty("email");
            });

        });

    });

});