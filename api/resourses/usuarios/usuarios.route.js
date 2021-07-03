const express = require('express')
const _ = require('underscore')

const bcrypt = require('bcrypt')
const log = require('./../utils/logger')
const validarUsuario = require('./usuarios.validate')
const usuarios = require("./../../../database").usuarios
const usuariosRouter = express.Router()

usuariosRouter.get('/',(req,res)=>{
    res.json(usuarios)
})

usuariosRouter.post('/', validarUsuario, (req,res)=>{
    let nuevoUsuario = req.body
    let index = _.findIndex(usuarios, usuario => {
        return usuario.username = nuevoUsuario.username || usuario.email === nuevoUsuario.email
    })

    if (index !== -1){
        //conflic hay un recurso usando esos datos
        log.info('Email o username ya existen en la base de datos');
        res.status(409).send('El username o email ya estan asociados a una cuenta')
        return
    }

    //hash genera una huella digital
    bcrypt.hash(nuevoUsuario.password, 10,(err,hashedPassword) =>{
        if(err){
            //Internal error server
            log.error('Error ocurrio al tratar de obtener el hash de una constraseña')
            res.status(500).send('Ocurrio un error procesando creacion del usuario')
            return
        }

        usuarios.push({
            username: nuevoUsuario.username,
            email : nuevoUsuario.email,
            password: hashedPassword
        })

        res.status(201).send('Usuario creado exitosamente')
    })

   

})

module.exports = usuariosRouter