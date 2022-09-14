// Importation des différents packages
const express = require ("express");
const mongoose = require ("mongoose");
const path = require("path");
require("dotenv").config();
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Importation des routes
const userRoutes = require ("./routes/user");
const sauceRoutes = require ("./routes/sauce");

// Connexion à la base de données MongoDB
mongoose.connect(process.env.SECRET_DB,  
    {useNewUrlParser: true,
    useUnifiedTopology: true,})
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

// Lancement de express
const app = express();

// Assainissement des données contre l'injection de requêtes NoSQL
app.use(mongoSanitize());

// Limiter les demandes répétées du même identifiant
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 150, // Limite chaque IP à 150 requêtes par `window`, ici 1 heure
    message: "Trop de requêtes venant de cette adresse IP, veuillez réessayer dans une heure",
});

app.use(helmet());

// Middleware CORS 
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    //autorisation des images venant d'une autre origine
    res.header("Cross-Origin-Resource-Policy", "cross-origin")
    next();
});

// Pour parser les objets json // extraction du corps json
app.use(express.json());

// Mise en place d'un gestionnaire de routage indiquant à Express de gérer la ressources images de manière statique
app.use("/images", express.static(path.join(__dirname, "images")));

// Ajout des routes
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

// Exportation de app
module.exports = app;
