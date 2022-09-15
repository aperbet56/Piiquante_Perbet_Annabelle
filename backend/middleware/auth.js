//Importation de "jsonwebtoken" afin de créer des token aléatoires et uniques 
const jwt = require("jsonwebtoken");
require("dotenv").config();
 
//Exportation du module de token
module.exports = (req, res, next) => {
    try {
        // Fonction split qui récupére tout le header après l'espace 
        const token = req.headers.authorization.split(' ')[1];

        // Fonction verify qui décode le token, si le token n'est pas correct, une erreur sera générée
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
       
        // J'extrais l'ID utilisateur du token et le rajoute à l’objet Request afin que mes différentes routes puissent l’exploiter.
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
	    next();
    } catch(error) {
        res.status(401).json({ error });
    }
};