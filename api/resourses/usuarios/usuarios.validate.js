const Joi = require('joi')

const logs = require('./../../../utils/logger')

const blueprintUsuario = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required,
    email: Joi.string().email().required()

})

module.exports = (req,res,next) =>{
    const result = Joi.validate(req.body, blueprintUsuario, {abortEarly: false,convert:false})
    if (result.error === null){
        next()
    }else{
        log.info('Producto fallo la validación', result.error.details)
        res.status(400).send("Informacion del usuario no cumple con los requisitos. El nombre del usuario debe ser alfanumberico y tener 3 y 30 caracteres. La contraseña debe tener 6 y 200 caracteres. Asegurate de que el email sea valido")
    }
}