const Joi = require('@hapi/joi')

const log = require('./../utils/logger')

const blueprintUsuario = Joi.object({
    username : Joi.string().alphanum().min(3).max(30).required(),
    password : Joi.string().min(6).max(200).required(),
    email : Joi.string().email().required()
})



let validarUsuario = (req,res,next)=>{
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

const blueprintPedidoDeLogin = Joi.object({
    username : Joi.string().required(),
    password : Joi.string().required(),
})

let validarPedidoDeLogin = (req,res,next) =>{
    const resultado =  blueprintPedidoDeLogin.validate(req.body,{abortEarly:false,convert: false})
    if (resultado.error === undefined){
        next();
    }else{
        let errorDeValidacion = resultado.error.details.map(error =>{
            return `[${error.message}]`
        })
        log.warn('Login falló. Debes especificar el username y la contraseña del usuario. Ambos deber ser string: ',req.body,errorDeValidacion)
        res.status(400).send('Login falló. Debes especificar el username y la contraseña del usuario. Ambos deber ser string'  )
    }
}

module.exports = {
    validarPedidoDeLogin,
    validarUsuario
}