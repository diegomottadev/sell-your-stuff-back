const _ = require('underscore')
const log = require('./../resourses/utils/logger')
const usuarios = require('./../../database').usuarios
const bcrypt = require('bcrypt')

module.exports = (username,password,done)=>{
    let  index = _.findIndex(usuarios,usuario => usuario.username == username)
    if (index === -1){
        log.info(`Usuario ${username} no existe, no puede ser autentica`)
        done(null,false)    
        return
    }

    let hashedPassword = usuarios[index].password;
    bcrypt.compare(password, hashedPassword, (err,some)=>{
        if(some){
            log.info(`Usuario ${username} completo la autenticación`)
            done(null,true)
            return
        }else{
            log.info(`Usuario ${username} no completo autenticación, contraseña incorrecta`)
            done(null,false)  
        }
    })

}