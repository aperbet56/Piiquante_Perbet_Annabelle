// Importation des packages
const express = require("express");
const router = express.Router();

// Importation de différents fichiers
const sauceCtrl = require("../controllers/sauce");
const multer = require("../middleware/multer-config");
const auth = require('../middleware/auth');

// Création des routes
router.post("/", auth, multer, sauceCtrl.createSauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get("/", auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.post("/:id/like", auth, sauceCtrl.likeDislikeSauce);

// Exportation des routes
module.exports = router;