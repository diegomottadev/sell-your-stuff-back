const _ = require('underscore')
const log = require('./../resourses/utils/logger')
const bcrypt = require('bcrypt')
const passportJWT = require('passport-jwt')
const config = require('../config')
const usuarioController = require('../resourses/usuarios/usuarios.controller')
//modulo de autenticacion con jwt
//ve a buscar el token el headear del request
let jwtOption = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}
module.exports = new passportJWT.Strategy(jwtOption,(jwtPayload,next) =>{

    usuarioController.obtenerUsuario({id: jwtPayload.id})
    .then(usuario => {
        if(!usuario){
            log.info(`JWT token no es valido. Usuario con el id ${jwtPayload.id} no existe`)
            next(null,false)
            return 
        }
        log.info(`Usuario ${usuario.username} suministro un token valido. Autenticacion completada`)
        next(null,{
            username: usuario.username,
            id: usuario.id
        })
    }).catch(err =>{
        log.error("Error ocurrió al tratar de validar el token",err)
        next(err)
    })
})

//modulo de autenticacion basica
// const basicStrategyLogin = (username,password,done)=>{
//     let  index = _.findIndex(usuarios,usuario => usuario.username == username)
//     if (index === -1){
//         log.info(`Usuario ${username} no existe, no puede ser autentica`)
//         done(null,false)    
//         return
//     }

//     let hashedPassword = usuarios[index].password;
//     bcrypt.compare(password, hashedPassword, (err,some)=>{
//         if(some){
//             log.info(`Usuario ${username} completo la autenticación`)
//             done(null,true)
//             return
//         }else{
//             log.info(`Usuario ${username} no completo autenticación, contraseña incorrecta`)
//             done(null,false)  
//         }
//     })

// }

// module.exports = {
//     jwtStrategy,
//     // basicStrategyLogin
// }