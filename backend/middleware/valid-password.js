//Importation du schema de "password"
const passwordSchema = require("../models/password");

// Vérifier que le mot de passe respecte le schéma "password"
module.exports = (req, res, next) => {
    //Si le mot de passe est invalide
    if (!passwordSchema.validate(req.body.password)) { 
        res.status(400).json({message: "Le mot de passe doit contenir au moins 10 caractères, avec au moins une majuscule, une minuscule, un caractère spécial et au moins deux chiffres."});
    } else {
    //Si le mot de passe est bon, passe au middleware suivant
        next();
    }
};
