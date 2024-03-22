const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');


interface UserDocument extends Document {
    password: string;
}

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
        lowercase: true,
        validate: [ isEmail, 'Please enter a valid email']
    },
    password:{
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Minimum password length is 6 characters"]
    },
    role: {
        type: String,
        default: "user"
    }
});

//function after the doc has been saved to db

/*userSchema.post('save', function(this: any, doc: Document, next: (err?: Error) => void){

    console.log('new user was created and saved', doc);
    next();
});*/

//function before the doc has been saved

userSchema.pre('save', async function(this: UserDocument, next: (err?: Error) => void){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//static method to log in user

userSchema.statics.login = async function (email: string, password: string) {
    const user = await this.findOne({ email });

    if(user){
        const auth = await bcrypt.compare(password, user.password);
        
        if(auth){
            return user;
        }
        throw Error ('Incorrect password');
    }
    throw Error('Incorrect Email')
}


const User = mongoose.model('User', userSchema);

module.exports = User;