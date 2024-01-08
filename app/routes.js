/**
 * Author:          Andy Jones - Department for Education
 * Description:     Routes for the application
 * GitHub Issue:   
 */

// DEPENDENCIES //

const express = require('express')
const router = express.Router()

// CONTROLLERS //

var publicController = require('./controllers/publicController.js')

// PUBLIC ROUTES //

// Gets 
router.get("/", publicController.get_home);



// Exports
module.exports = router