const express = require('express')
const _ = require('underscore')

const bcrypt = require('bcrypt')
const log = require('./../utils/logger')
const validarUsuario = require('./usuarios.validate').validarUsuario
const validarPedidoDeLogin = require('./usuarios.validate').validarPedidoDeLogin

const usuarios = require("./../../../database").usuarios
const usuariosRouter = express.Router()
const jwt = require('jsonwebtoken')
const uuidv4 = require('uuid/v4')

usuariosRouter.get('/',(req,res)=>{
    res.json(usuarios)
})

usuariosRouter.post('/', validarUsuario, (req,res)=>{
    let nuevoUsuario = req.body
    let index = _.findIndex(usuarios, usuario => {
        return usuario.username = nuevoUsuario.username &&  usuario.email === nuevoUsuario.email
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
            password: hashedPassword,
            id: uuidv4()
        })
        console.log(usuarios)
        res.status(201).send('Usuario creado exitosamente')
    })
})

usuariosRouter.post('/login', validarPedidoDeLogin,(req,res)=> {
    let usuarioNoAutenticado = req.body

    let index = _.findIndex(usuarios, usuario => {
        return usuario.username === usuarioNoAutenticado.username
    })
    if (index === -1){
        log.info(`Usuario ${usuarioNoAutenticado.username} no existe. No puedo ser autenticado`)
        res.status(400).send(`Credenciales incorrectas. El usuario no existe`);
    }

    let hashedPassword = usuarios[index].password;
    bcrypt.compare(usuarioNoAutenticado.password, hashedPassword, (err,iguales)=>{
        if (iguales){
            let token = jwt.sign({id: usuarios[index].id}, 'esto es un secreto',{expiresIn:86400})
            log.info(`Usuario ${usuarioNoAutenticado.username} completo autenticacion exitosamente`)
            res.status(200).json({token});
        }else{
            log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticación. Contraseña incorrecta`)
            res.status(400).send(`Credenciales incorrectas. Asegurate que el username y la contraseña sean correctas`)
        }
    })
})


module.exports = usuariosRouter