Exercise: 
	Implement the POST /api/users, for each user they need these properties: {name, email, password}
		Also when defining the schema, for the email property set the unique property to "true"
			email: {
				type: String,
				unique: true
				}


One note when setting up the joi and mongoose models:
Password, I have the max joi validation password as 255 characters, but in mongoose I have it set to 1024. Why?
Because the password will be hashed which will be a longer string, and thats the string that I'll save.

Here is the user.js I created:
//`````````````````````````````````````````````````````````````````````````````````````````````````````````````````
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

// * ----------  PRE VALIDATE CUSTOMER NAME and PHONE NUMBER ----------
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(30)
      .trim()
      .required(),
    email: Joi.string()
      .email()
      .trim()
      .required()
      .max(255),
    password: Joi.string()
      .min(8)
      .max(255)
      .required()
  });

  return schema.validate(user);
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    trim: true
  },
  email: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024
  }
});

//* Define customers model (moved the schema declaration into it.)
let Users;
try {
  Users = mongoose.model("User");
} catch (error) {
  Users = mongoose.model("User", userSchema);
}

exports.Users = Users;
exports.validateUser = validateUser;

//`````````````````````````````````````````````````````````````````````````````````````````````````````````````````

Next, I'll cover the endpoint I constructed.
