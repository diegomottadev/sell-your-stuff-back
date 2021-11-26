const express = require('express')
const _ = require('underscore')
const products = require("./../../../database").products
const uuidv4 = require('uuid/v4')
const log = require('./../utils/logger')
const validarProducto = require('./products.validate').validarProducto
const passport = require('passport')
const productosRouter = express.Router()
const jwtAuthenticate = passport.authenticate('jwt', { session: false })
const productoController = require('./products.controller')

function validarId(req,res,next){
    let id = req.params.id
    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400).send(`El id [${id}] suministrado en el url no es válido`)
        return
    }
    next()
}

productosRouter.get("/", (req, res) => {

    productoController.obtenerProductos().then(productos =>{
        res.json(productos)
    }).catch(err =>{
        res.status(500).send('Error al leer los productos de la base de datos')
    })
})
//localhost:3000/productos
productosRouter.post('/', [jwtAuthenticate,validarProducto], (req,res)=>{

    productoController.crearProducto(req.body,req.user.username)
    .then(producto =>{
        log.info("Producto agregado a la colección productos", producto.toObject())
        res.status(201).json(producto)
    }).catch(err =>{
        log.warn('Producto no pudo ser creado',err)
        res.status(500).send("Error ocurrio al tratar de crear el producto")
    })
})

productosRouter.get('/:id',validarId, (req, res) => {

    let id = req.params.id
    productoController.obtenerProducto(id).then(producto =>{
        if(!producto){
            res.status(404).send(`Producto con id [${id}] no existe`)
        }else{
            res.json(producto)
        }
    }).catch(err=>{
        log.warn(`Excepción ocurrió al tratar de obtener producto con id [${id}]`,err)
        res.status(500).send(`Error ocurrio obteniendo producto con id [${id}]`)

    })
    
})

productosRouter.put('/:id', [jwtAuthenticate, validarProducto], async (req, res) => {

    let id = req.params.id
    let requestUsuario = req.user.username
    let productoAReemplazar


    try{
        productoAReemplazar = await productoController.obtenerProducto(id)
        
    }catch (err){
        log.warn(`Excepción ocurrió al procesar la modificación del producto con id [${id}]`)
        res.status(500).send(`Error ocurrió modificando producto con id [${id}]`)
        return
    }

    if(!productoAReemplazar){
        res.status(404).send(`El producto con id [${id}]`)
    }

    if(productoAReemplazar.dueño !== requestUsuario){
        log.info(`Usuario ${requestUsuario} no es el dueño del producto con id ${id}. Dueño real es el ${productoAReemplazar.dueño}. Request no será procesado`)
        res.status(401).send(`No eres dueño del producto con id ${id}. Solo puedes modificar productos creados por ti`)
        return 
    }

    productoController.reemplazarProducto(id,req.body,requestUsuario)
    .then(producto => {
            res.json(producto)
            log.info(`Producto con id [${id}] reemplazado con nuevo producto`, producto.toObject())
    })
    .catch (err =>{
        log.error(`Excepción al tratar de reemplazar producto con id [${id}]`,err)
        res.status(500).send(`Error ocurrio al reemplazar el producto con id [${id}]`)
    })

   
})

productosRouter.delete('/:id', [jwtAuthenticate, validarId],async (req, res) => {

    let id = req.params.id
    let productoAborrar

    try{
        productoAborrar = await productoController.obtenerProducto(id)
    }catch (err){
        log.warn(`Excepción ocurrió al procesar el borrado de producto con id [${id}]`,err)
        res.status(500).send(`Error ocurrio borrando producto con id [${id}]`)
        return
    }

    if (!productoAborrar) {
        log.error(`Producto [${id}] no encontrado. Nada que borrar`)
        res.status(404).send(`Producto [${id}] no encontrado. Nada que borrar`)
        return
    }

    usuarioAutenticado = req.user.username
    if (productoAborrar.dueño !== usuarioAutenticado) {
        log.info(`Usuario ${usuarioAutenticado} no es el dueño del producto con id ${id}. Dueño real es el ${productoAborrar.dueño}. Request no será procesado`)
        res.status(401).send(`No eres dueño del producto con id ${id}. Solo puedes borrar productos creados por ti`)
        return
    }

    try{
        productoAborrar = await productoController.borrarProducto(id)
        log.info(`Producto con id [${id}] fue borrado`)
        res.json(productoAborrar);

    }catch (err){
        log.error(`Excepción al tratar de borrar producto con id [${id}]`,err)
        res.status(500).send(`Error ocurrio al borrar el producto con id [${id}]`)
    }

    let borrado = products.splice(indiceABorrar, 1);
    res.json(borrado);

});

module.exports = productosRouter;