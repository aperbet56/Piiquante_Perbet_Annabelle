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


// Exportation de la fonction "likeDislikeSauce" qui permet la gestion du like et du dislike
exports.likeDislikeSauce = (req, res, next) => {
    let like = req.body.like
    let userId = req.auth.userId
    let sauceId = req.params.id
            
     
    switch (like) { 
        // Like sauce
        case 1 :
            Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: +1 }})
                .then(() => res.status(200).json({ message: "J'aime" }))
                .catch((error) => res.status(400).json({ error }))
              
        break;
            
        // Annulation du like / dislike
        case 0 :
            Sauce.findOne({ _id: sauceId })
                .then((sauce) => {
                    if (sauce.usersLiked.includes(userId)) { 
                        Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 }})
                            .then(() => res.status(200).json({ message: "Neutre" }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                    if (sauce.usersDisliked.includes(userId)) { 
                        Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 }})
                            .then(() => res.status(200).json({ message: "Neutre" }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                })
                .catch((error) => res.status(404).json({ error }))
        break;
            
        // Dislike Sauce 
        case -1 :
            Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 }})
                .then(() => { res.status(200).json({ message: "Je n'aime pas" }) })
                .catch((error) => res.status(400).json({ error }))
        break;
        
        default:
            console.log(error);
    }
};
  