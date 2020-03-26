*************************************
**** Extracting Validation Logic ****
*************************************

This is super simple!
Create a validation.js file in the startup folder
create an exported function
Copy the line for setting up joi.objectID into it
copy the requirement of Joi into it

````````validation.js`````````````````````
const Joi = require("@hapi/joi");

module.exports = function() {
  Joi.objectId = require("joi-objectid")(Joi); //The require returns a function, so pass Joi const into it, it then again returns a function so we set Joi.objectId equall to it.
};


Now, import it back into index.js
Finally, to clean up one last thing, I'll change the app.listen for starting express to use winston logging.


````````````index.js`````````````````````
const { logger } = require("./startup/logging");
const express = require("express");
const app = express();
require("./startup/logging");
require("./startup/config")();
require("./startup/validation")();
require("./startup/routes")(app);
require("./startup/db")();

// * SET PORT AND START LISTENING
const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`listening on port ${port}...`));





All of the details are now delegated into other modules and index.js is WAY smaller and easier to read now!
