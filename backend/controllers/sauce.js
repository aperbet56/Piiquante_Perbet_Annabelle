// Importation du modèle sauce
const Sauce = require("../models/sauce");

// Importation du package fs (file system) contenant des fonctions pour modifier le système de fichier et la suppression de fichier
const fs = require("fs");

// Exportation de la fonction "createSauce" pour ajouter, créer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    //Suppression du champ "id" du corps de sauceObject
    delete sauceObject._id;
    const sauce = new Sauce({
        //opérateur Spread  copie tous les éléments de req.body créés 
        ...sauceObject,
        // Récupération de manière dynamique de l'url de l'image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
    });
    sauce.save()
        .then(() => res.status(201).json({message: "Nouvelle sauce enregistrée" })) 
        .catch((error) => res.status(400).json({ error }));
};

// Exportation de la fonction "deleteSauce" pour supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // vérifier si l’utilisateur qui a fait la requête de suppression est bien celui qui a créé la sauce
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({message: "Requête non autorisée"});
            } else {
                const filename = sauce.imageUrl.split("/images/")[1];
                // Fonction unlink du package fs pour supprimer le fichier, en lui passant le fichier à supprimer et le callback à exécuter une fois ce fichier supprimé.
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id}) 
                        .then(() => { res.status(200).json({message: "Sauce supprimée !"})}) 
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

// Exportation de la fonction "getAllSauces" permettant d'afficher toutes les sauces de la base de données 
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(404).json({ error }));
}; 

// Exportation de la fonction "getOneSauce" permettant d'afficher une sauce spécifique 
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Exportation de la fonction "modifySauce" permettant de modifier une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }   : { ...req.body };
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
            // vérifier si l’utilisateur qui a fait la requête de modification est bien celui qui a créé la sauce
                if (sauce.userId != req.auth.userId) {
                    res.status(403).json({message: "Requête non autorisée"});
                } else {
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Sauce modifiée !"}))
                        .catch(error => res.status(400).json({ error }));
                }
            })
            .catch(error => res.status(500).json({ error }));
};


// Exportation de la fonction "likeDislikeSauce" qui permet la gestion des likes et des dislikes
exports.likeDislikeSauce = (req, res, next) => {
    let like = req.body.like
    let userId = req.auth.userId
    let sauceId = req.params.id
    
    Sauce.findOne({_id: sauceId})
        .then(sauce => {
            // like = 1  l'utilisateur like la sauce
            if (like === 1) {
                // Vérification si l'utilisateur a déjà disliké la sauce 
                if (sauce.usersDisliked.includes(userId)) {
                    return res.status(400).json({ message: "Requête rejetée : veuillez retirer le dislike avant d'ajouter un like !" });
                }
                // Vérification si l'utilisateur a déjà liké la sauce
                else if (sauce.usersLiked.includes(userId)) {
                    return res.status(400).json({ message: "Vous avez déjà liké cette sauce !" });
                } else {
                    // Ajout de l'userId de l'utilisateur dans le tableau usersLiked et incrémentation du like
                    Sauce.updateOne({_id: sauceId}, {$inc: { likes: 1 }, $push: { usersLiked: userId }})
                        .then(() => res.status(200).json({ message: "Vous aimez cette sauce"}))
                        .catch(error => res.status(400).json({ error }));
                }
            }
    
            // like = -1  l'utilisateur dislike la sauce
            if (like === -1) {
                // Vérification si l'utilisateur a déjà liké la sauce
                if (sauce.usersLiked.includes(userId)) {
                    return res.status(400).json({message: "Requête rejetée : veuillez retirer le like avant d'ajouter un dislike" });
                }
                // Vérification si l'utilisateur a déjà disliké la sauce
                else if (sauce.usersDisliked.includes(userId)) {
                    return res.status(400).json({message: "Vous avez déjà disliké cette sauce !"}); 
                } else {
                    // Ajout de l'userId de l'utilisateur dans le tableau usersDisliked et incrémentation du dislike
                    Sauce.updateOne({_id: sauceId}, {$inc: { dislikes: 1 }, $push: { usersDisliked: userId }})
                        .then(() => res.status(200).json({message: "Vous n'aimez pas cette sauce !"}))
                        .catch(error => res.status(400).json({ error }));
                }
            }
    
            // like = 0  l'utilisateur annule son like ou son dislike
            if (like === 0) {
            // Si l'utilisateur a déjà liké la sauce
                if (sauce.usersLiked.includes(userId)) {
                // Suppression de l'userId de l'utilisateur du tableau usersLiked et diminution du nombre de like
                    Sauce.updateOne({_id: sauceId}, {$inc: { likes: -1 }, $pull: { usersLiked: userId }})
                        .then(() => res.status(200).json({message: "Votre like a bien été retiré"}))
                        .catch(error => res.status(400).json({ error }));
                }
                // Si l'utilisateur a déjà disliké la sauce
                else if (sauce.usersDisliked.includes(userId)) {
                // Suppression de l'userId de l'utilisateur du tableau usersDisliked et diminution du nombre de dislike
                    Sauce.updateOne({_id: sauceId}, {$inc: { dislikes: -1 }, $pull: { usersDisliked: userId }})
                        .then(() => res.status(200).json({message: "Votre dislike a bien été retiré !"}))
                        .catch(error => res.status(400).json({ error }));
                }
            }
        })
        .catch(error => res.status(404).json({ error }));
};