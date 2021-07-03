const Joi = require('@hapi/joi')

const log = require('./../utils/logger')

const blueprintProduct = Joi.object({
    titulo : Joi.string().max(100).required(),
    precio : Joi.number().positive().precision(2).required(),
    moneda : Joi.string().length(3)
})

module.exports = (req,res,next)=>{
    let resultado = blueprintProduct.validate(req.body,{abortEarly:false,convert: false})
    if(resultado.error === undefined){
        next();//ve a la sgt funcion de la cadena y no es return
    }
    else{
        let errorDeValidacion = resultado.error.details.reduce((acumulador,error)=>{
            return acumulador + `[${error.message}]`
        })
        log.warn('El siguiente producto no paso la validacion: ',req.body,errorDeValidacion)
        res.status(400).send(errorDeValidacion  )
    }
}