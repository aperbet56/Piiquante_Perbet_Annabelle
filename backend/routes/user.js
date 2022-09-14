// Importation des différents packages
const express = require ("express");

const router = express.Router(); 

// Importation du controllers "user.js"
const userCtrl = require ("../controllers/user");

const validPassword = require("../middleware/valid-password");
const validEmail = require("../middleware/valid-email")

// Création des routes
router.post("/signup", validEmail, validPassword, userCtrl.signup);
router.post("/login", userCtrl.login);

// Exportation des routes
module.exports = router;