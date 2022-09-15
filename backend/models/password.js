// Importation du package passwordValidator
const passwordValidator = require("password-validator");

// Création du schema
const passwordSchema = new passwordValidator();

// Ajout de propriétés à l'intérieur 
passwordSchema
.is().min(10)                                     // Doit contenir au moins 10 caractères
.is().max(100)                                    // Doit contenir au maximum 100 caracrtères
.has().uppercase()                                // Doit contenir des lettres majuscules
.has().lowercase()                                // Doit contenir des lettres minuscules
.has().digits(2)                                  // Doit contenir au moins 2 chiffres
.has().symbols(1)                                // Doit contenir au moins un symbole
.has().not().spaces()                            // Ne doit pas contenir d'espaces
.is().not().oneOf(['Passw0rd', 'Password123','Azerty123', '123456789', '123123123']);  // Liste noire de mots de passe (mots de passe à proscrire)

module.exports = passwordSchema;