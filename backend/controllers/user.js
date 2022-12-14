//Importation du modèle de création utilisateur
const User = require("../models/user");

// Importation des différents packages
const bcrypt = require ("bcrypt"); // Pour crypter le mot de passe
const jwt = require("jsonwebtoken"); //Pour créer des token aléatoires et introuvables afin de sécuriser la connexion au compte
const cryptojs = require("crypto-js"); // Pour crypter l'adresse email
require("dotenv").config();

// Exportation de la fonction "signup"
exports.signup = (req, res, next) => {
    const encryptEmail = cryptojs.HmacSHA512(req.body.email, process.env.SECRET_CRYPTOJS_TOKEN).toString(cryptojs.enc.Base64);
    //Hachage du mot de passe avec bcrypt (hash 10 fois)
    bcrypt.hash(req.body.password, 10) 
        .then(hash => {
            // Création d'un utilisateur
            const user = new User({
            email: encryptEmail, 
            password: hash 
            });
            //Sauvegarde de l'utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
                .catch(error => res.status(400).json({ error })); 
        })
        .catch(error => { 
            console.log(error)
            return res.status(500).json({ error })
        });
};

// Exportation de la fonction "login"
exports.login = (req, res, next) => {
    const encryptEmail = cryptojs.HmacSHA512(req.body.email, process.env.SECRET_CRYPTOJS_TOKEN).toString(cryptojs.enc.Base64);
    User.findOne({ email: encryptEmail }) // Cherche l'adresse email rentrée par l'utilisateur dans la base de données
        .then(user => {
            //Si aucune adresse email n'est trouvée, je renvoie une erreur
            if (!user) {
                return res.status(401).json({ message: "Paire login/mot de passe incorrecte"});
            }
            // Comparaison des hachages utilisés
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Si le mot de passe est faux, je renvoie une erreur
                    if (!valid) {
                        return res.status(401).json({ message: "Paire login/mot de passe incorrecte" });
                    }
                    // Si le mot de passe est correct, je renvoie un "user id", un token, et une date d'expiration (24h) pour le token
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.SECRET_TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
            })
        .catch(error => res.status(500).json({ error }));
};
