const Joi = require('@hapi/joi')

const log = require('./../utils/logger')

const blueprintUsuario = Joi.object({
    username : Joi.string().alphanum().min(3).max(30).required(),
    password : Joi.string().min(6).max(200).required(),
    email : Joi.string().email().required()
})



module.exports = (req,res,next)=>{
    let result = blueprintUsuario.validate(req.body,{abortEarly:false,convert: false})
    if(result.error === undefined){
        next();//ve a la sgt funcion de la cadena y no es return
    }
    else{
        let errorDeValidacion = result.error.details.map(error=>{
            return `[${error.message}]`
        })
        log.warn('Los datos del usuario  no paso la validacion: ',req.body,errorDeValidacion)
        res.status(400).send(errorDeValidacion  )
    }
}
