******************************
**** Authenticating Users ****
******************************

I'll create a new file. auth.js
To speed things along I'll copy the body of my routes.js into it with the post method.

Lets refactor it.

#1 - The validate in the post method is using the validateUser method imported from the user module.
That module is checking the structure of a new user, its not for validating the email and password that I expect in this endpoint. I need a different validate function.
So, I'm going to remove the validateUser and write a new validate method for this endpoint to use.

For the validate schema I only need 2 properties, email and password.

#2 - Next I need to verify that I do have a user with a given email. 
	So, load the user and if I don't have a user with the given email return a 400 error with the message "Invalid email or password"
	
	**NOTE: I'm NOT sending the client a "404" error, because I don't want to tell the client why authentication failed. I don't want to tell
	if the email is incorrect or the password. it just says that it is a bad request, it doesn't have the right data to be processed.


#3 - Next, I validate the password with bcrypt.
		bcrypt.compare("request_string_to_compare", "stored_string_to_compare_against")
		
		IE:
		
		let user = await Users.findOne({ email: req.body.email });
		const passIsValid = await bcrypt.compare(req.body.password, user.password)

	req.body.password contains the plain-text password from the user request, user.password is the value from the database.

The compare method re-encrypts req.body.password using the hash method taken from the start of user.password, if the encrypted values match
then the method returns true.
	
If passIsValid returns false, then return a 400 error with the vague message again.

		let user = await Users.findOne({ email: req.body.email });
		const passIsValid = await bcrypt.compare(req.body.password, user.password)
		if (!passIsValid) return res.status(400).send("Invalid email or password.");

#4 - Finally, if we get to this point that means it is a valid login, so I'll just reply "true" for now.
	    res.send(true);
		

Tested with valid and invalid email/password combinations. works as expected!
In next lesson will go over replacing the "res.send(true)" with a JSON web token.

Code for auth.js:
`````````````````````````````````````````````````````````````````````````````````````````````````````````````
const { Users } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const passwordComplexity = require("joi-password-complexity");

// * ----------  PRE VALIDATE Email and Password ----------
function validate(req) {
  const complexityOptions = {
    min: 7,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 2,
    requirementCount: 4
  };
  /*
		Min & Max not considered in the count. 
		Only lower, upper, numeric and symbol. 
		requirementCount could be from 1 to 4 
		If requirementCount=0, then it takes count as 4
    */

  const schema = Joi.object({
    email: Joi.string()
      .email()
      .trim()
      .required()
      .max(255),
    password: passwordComplexity(complexityOptions)
  });

  return schema.validate(req);
}

router.post("/", async (req, res) => {
  //* Use Joi to pre-validate the request body.
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //* Validate that the email is in the DB already.
  //! Note, this returns a 400 error, not a 404, I don't want to tell the client "WHY" it failed, just that the provided data is invalid

  let user = await Users.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  try {
    const passIsValid = await bcrypt.compare(req.body.password, user.password);
    if (!passIsValid) return res.status(400).send("Invalid email or password.");

    res.send(true);
  } catch (ex) {
    res.status(500).send(ex.message);
  }
});

////////////////////////
//! Exports
////////////////////////
module.exports = router;
