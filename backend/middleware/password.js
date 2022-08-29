const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

passwordSchema
    .is().min(8)                                    // Minimum length 8
    .is().max(20)                                   // Maximum length 20
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces

module.exports = (req, res, next) => {
    if (passwordSchema.validate(req.body.password)) {
        next();
    }
    else {

        return res
            .status(400)
            .json({ error: `Password is not strong enough to be valid : ${passwordSchema.validate('req.body.password', { list: true })}` })
    }
}
