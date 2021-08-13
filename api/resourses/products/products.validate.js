const Joi = require('@hapi/joi')

const log = require('./../utils/logger')

// const blueprintProducto = Joi.object({
//   titulo: Joi.string().max(100).required(),
//   precio: Joi.number().positive().precision(2).required(),
//   moneda: Joi.string().length(3).uppercase().required()
// })


const blueprintProducto = Joi.object({
    titulo: Joi.string().required(),
    precio: Joi.number().required(),
    moneda: Joi.string().required()
})

let validarProducto = (req, res, next) => {
    const resultado = blueprintProducto.validate(req.body, { abortEarly: false, convert: false })
    if (resultado.error === undefined) {
        next()
    } else {
        let errorDeValidacion = resultado.error.details.map(error => {
            return `[${error.message}]`
        })
        log.warn(`El siguiente producto no pasó la validación: ${req.body} - ${errorDeValidacion}   `)
        res.status(400).send(`El producto en el body debe especificar titulo, precio y moneda. Errores en tu request: ${errorDeValidacion}`)
    }
}

module.exports = {
    validarProducto
}