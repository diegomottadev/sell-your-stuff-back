const express = require('express')
const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const log = require('./../utils/logger')
const validarProducto = require('./products.validate').validarProducto
const passport = require('passport')
const productosRouter = express.Router()
const jwtAuthenticate = passport.authenticate('jwt', { session: false })
const productoController = require('./products.controller')
const procesarErrores = require('../../libs/errorHandler').procesarErrores
const {ProductoNoExiste, UsuarioNoEsDueño} = require('./products.error')

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
productosRouter.post('/', [jwtAuthenticate,validarProducto], procesarErrores((req,res)=>{
   return productoController.crearProducto(req.body,req.user.username)
    .then(producto =>{
        log.info("Producto agregado a la colección productos", producto.toObject())
        res.status(201).json(producto)
    })
}))

productosRouter.get('/:id',validarId, procesarErrores((req, res) => {

    let id = req.params.id
    return productoController.obtenerProducto(id).then(producto =>{
        if(!producto){
            throw new  ProductoNoExiste(`Producto con id [${id}] no existe`)
        }
    })
    
}))

productosRouter.put('/:id', [jwtAuthenticate, validarProducto], procesarErrores(async (req, res) => {

    let id = req.params.id
    let requestUsuario = req.user.username
    let productoAReemplazar
    
    productoAReemplazar = await productoController.obtenerProducto(id)

    if(!productoAReemplazar){
        throw new  ProductoNoExiste(`El producto con id [${id}]`)
    }

    if(productoAReemplazar.dueño !== requestUsuario){
        log.info(`Usuario ${requestUsuario} no es el dueño del producto con id ${id}. Dueño real es el ${productoAReemplazar.dueño}. Request no será procesado`)
        throw new  UsuarioNoEsDueño(`No eres dueño del producto con id ${id}. Solo puedes modificar productos creados por ti`)
    }

    productoController.reemplazarProducto(id,req.body,requestUsuario)
    .then(producto => {
            res.json(producto)
            log.info(`Producto con id [${id}] reemplazado con nuevo producto`, producto.toObject())
    })
   
}))

productosRouter.delete('/:id', [jwtAuthenticate, validarId],procesarErrores(async (req, res) => {

    let id = req.params.id
    let productoAborrar

    productoAborrar = await productoController.obtenerProducto(id)

    if (!productoAborrar) {
        log.error(`Producto [${id}] no encontrado. Nada que borrar`)
        throw new  ProductoNoExiste(`Producto [${id}] no encontrado. Nada que borrar`)
        
    }

    usuarioAutenticado = req.user.username
    if (productoAborrar.dueño !== usuarioAutenticado) {
        log.info(`Usuario ${usuarioAutenticado} no es el dueño del producto con id ${id}. Dueño real es el ${productoAborrar.dueño}. Request no será procesado`)
        throw new  UsuarioNoEsDueño(`No eres dueño del producto con id ${id}. Solo puedes borrar productos creados por ti`)
    }

    productoAborrar = await productoController.borrarProducto(id)
    log.info(`Producto con id [${id}] fue borrado`)
    res.json(productoAborrar);

    let borrado = products.splice(indiceABorrar, 1);
    res.json(borrado);

}));

module.exports = productosRouter;