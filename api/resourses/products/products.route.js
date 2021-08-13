const express = require('express')
const _ = require('underscore')
const products = require("./../../../database").products
const uuidv4 = require('uuid/v4')
const log = require('./../utils/logger')
const validarProducto = require('./products.validate').validarProducto
const passport = require('passport')
const productosRouter = express.Router()
const jwtAuthenticate = passport.authenticate('jwt', { session: false })

productosRouter.get("/", (req, res) => {
    res.json(products)
})
//localhost:3000/productos
productosRouter.post('/', [jwtAuthenticate,validarProducto], (req,res)=>{
    let nuevoProducto = {
        ...req.body,
        id: uuidv4(),
        //dueño: req.user.username
    }
    console.log(nuevoProducto)
    products.push(nuevoProducto)
    log.info("Productos agregado a la colección de productos")
    res.status(201).json(nuevoProducto)

})

productosRouter.get('/:id', (req, res) => {
    for (let producto of products) {
        if (producto.id == req.params.id) {
            res.json(producto);
            return;
        }
    }
    log.warn(`Producto [${req.params.id}] no encontrado`)
    return res.status(404).send(`Producto [${req.params.id}] no encontrado`)
})

productosRouter.put('/:id', [jwtAuthenticate, validarProducto], (req, res) => {
    let reemplazoParaProducto = {
        ...req.body,
        id: req.params.id,
        dueño: req.user.username
    }

    let indice = _.findIndex(products, product => product.id == reemplazoParaProducto.id)
    if (indice !== -1) {
        console.log(products[indice].dueño, reemplazoParaProducto.dueño);
        if (products[indice].dueño !== reemplazoParaProducto.dueño) {
            log.info(`Usuario ${req.user.username} no es el dueño del producto con id ${reemplazoParaProducto.id}. Dueño real es el ${products[indice].dueño}. Request no será procesado`)
            res.status(404).send(`No eres dueño del producto con id ${reemplazoParaProducto.id}. Solo puedes modificar productos creados por ti`)
        }
        products[indice] = reemplazoParaProducto;
        log.info(`Producto con id [${reemplazoParaProducto.id}] remplazado con nuevo producto`, reemplazoParaProducto)
        res.status(200).json(reemplazoParaProducto);
    } else {
        log.error(`Producto con id [${reemplazoParaProducto.id}] no existe`)
        res.status(404).send(`Producto con id [${reemplazoParaProducto.id}] no existe`);

    }
})

productosRouter.delete('/:id', jwtAuthenticate, (req, res) => {
    let indiceABorrar = _.findIndex(products, product => product.id === req.params.id);
    console.log(indiceABorrar)
    if (indiceABorrar === -1) {
        log.error(`Producto [${req.params.id}] no encontrado. Nada que borrar`)
        res.status(404).send(`Producto [${req.params.id}] no encontrado. Nada que borrar`)
        return
    }

    if (products[indiceABorrar].dueño !== req.user.username) {
        log.info(`Usuario ${req.user.username} no es el dueño del producto con id ${products[indiceABorrar].id}. Dueño real es el ${products[indiceABorrar].dueño}. Request no será procesado`)
        res.status(404).send(`No eres dueño del producto con id ${products[indiceABorrar].id}. Solo puedes borrar productos creados por ti`)
    }

    log.info(`Producto con id [${req.params.id}] fue borrado`)
    let borrado = products.splice(indiceABorrar, 1);
    res.json(borrado);

});

module.exports = productosRouter;