// Importation du package multer
const multer = require("multer");

// Dictionnaire MIME_TYPE pour l'extension des fichiers images
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png"
};

// Constante storage à passer à multer comme configuration
const storage = multer.diskStorage({
    // Fonction destination qui indique à multer d'enregistrer les fichiers dans le dossier images  
    destination: (req, file, callback) => {
        callback(null, "images");
    },

    /**
    * Fonction filename
    * Indiquer à multer d'utiliser le nom d'origine et de remplacer les espaces par des underscores 
    * Constante extension contenant le dictionnaire MIME_TYPES pour résoudre l'extension de fichier
    * Ajouter un timestamp Date.now() comme nom de fichier
    */
    filename: (req, file, callback) => {
        const name = file.originalname.split(" ").join("_");
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + "." + extension);
    }
});

// Exportation de multer entièrement configuré
module.exports = multer({storage: storage}).single("image");