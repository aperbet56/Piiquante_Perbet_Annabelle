module.exports = (req, res, next) => {
    const validEmail = (email) => {
        let emailRegex = /^[a-zA-Z0-9.-_]+[@]{1}[a-zA-Z0-9.-_]+[.]{1}[a-z]{2,10}$/;
        let isRegexTrue = emailRegex.test(email)
        isRegexTrue ? next() : res.status(400).json({message: "Adresse mail renseigné non valide"});
    }
    validEmail(req.body.email);
};