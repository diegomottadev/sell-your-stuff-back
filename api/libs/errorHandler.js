const log = require('../resourses/utils/logger')
const mongoose = require('mongoose')
exports.procesarErrores = (fn) =>{
    return function(req,res,next){
        fn(req,res,next).catch(next)
    }
}



exports.procesarErroresDeDB = (err,req,res,next) => {
    if(err instanceof mongoose.Error || err.name === 'MongoError'){
        log.error('Ocurrio un error relacionado a mongoose',err)
        err.message = "Error relacionado a la base de datos ocurrio inesperadamente. Para ayuda contactar con el administrador del sistema"
        err.status = 500
    }

    next(err)
}

exports.erroresEnProduccion = (err,req,res,next) =>{
    res.status(err.status || 500)
    res.send({message: err.message})
} 

exports.erroresEnDesarrollo = (err,req,res,next) =>{
    res.status(err.status || 500)
    res.send({
        message: err.message,
        stack: err.stack || ""
    })
} 