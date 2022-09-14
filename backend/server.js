// Création d'un serveur sur le port 3000

const http = require("http"); // Import du package http de Node
const app = require("./app"); // Import de l'application présente dans le fichier app.js

// Pour résoudre une erreur inconnue lors de la création d'un utilisateur depuis le front
const cors = require('cors');
app.use(cors()) 

// Normalisation de port
const normalizePort = val => {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};

const port = normalizePort(process.env.PORT || 3000);
app.set("port", port);

// Recherche et gestion des erreurs
const errorHandler = error => {
    if (error.syscall !== "listen") {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === "string" ? "pipe" + address : "port : " + port;
    switch (error.code) {
        case "EACCES":
            console.error(bind + "requires elevated privileges.");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + "is already in use.");
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () => {
    const address = server.address();
    const bind = typeof address === "string" ? "pipe" + address : "port : " + port;
    console.log("Listening on " + bind);
});

server.listen(port);