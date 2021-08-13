const express = require('express')
const _ = require('underscore')
const products = require("./../../../database").products
const uuidv4 = require('uuid/v4')

const validarProducto = require('./products.validate')
const log = require('./../utils/logger')
const passport = require('passport')

const jwtAuthenticate = passport.authenticate('jwt', { session: false })


const productsRouter = express.Router()

productsRouter.get("/", (req, res) => {
    res.json(products)
})
//localhost:3000/productos
productsRouter.post('/', [jwtAuthenticate, validarProducto], (req, res) => {
    let nuevoProducto = {
        ...req.body,
        id: uuidv4(),
        dueño: req.user.username
    }

    products.push(nuevoProducto)
    log.info("Productos agregado a la colección de productos")
    res.status(201).json(nuevoProducto)

})

productsRouter.get('/:id', (req, res) => {
    for (let producto of products) {
        if (producto.id == req.params.id) {
            res.json(producto);
            return;
        }
    }
    log.warn(`Producto [${req.params.id}] no encontrado`)
    return res.status(404).send(`Producto [${req.params.id}] no encontrado`)
})

productsRouter.put('/:id', [jwtAuthenticate, validarProducto], (req, res) => {
    let reemplazoParaProducto = {
        ...req.body,
        id: req.params.id,
        dueño: req.user.username
    }



    let indice = _.findIndex(products, product => product.id == reemplazoParaProducto.id)
    if (indice !== -1) {
        if (products[indece].dueño !== reemplazoParaProducto.dueño) {
            log.info(`Usuario ${req.user.username} no es el dueño del producto con id ${reemplazoParaProducto.id}. Dueño real es el ${products[indice].dueño}. Request no será procesado`)
            res.status.send(`No eres dueño del producto con id ${reemplazoParaProducto}. Solo puedes modificar productos creados por ti`)
        }
        products[indice] = reemplazoParaProducto;
        log.info(`Producto con id [${reemplazoParaProducto.id}] remplazado con nuevo producto`, reemplazoParaProducto)
        res.status(200).json(reemplazoParaProducto);
    } else {
        log.error(`Producto con id [${reemplazoParaProducto.id}] no existe`)
        res.status(404).send(`Producto con id [${reemplazoParaProducto.id}] no existe`);

    }
})

productsRouter.delete('/:id', jwtAuthenticate, (req, res) => {
    let indiceABorrar = _.findIndex(products, product => product.id === req.params.id);
    console.log(indiceABorrar)
    if (indiceABorrar === -1) {
        log.error(`Producto [${req.params.id}] no encontrado. Nada que borrar`)
        res.status(404).send(`Producto [${req.params.id}] no encontrado. Nada que borrar`)
        return
    }

    if (products[indiceABorrar].dueño !== req.user.username) {
        log.info(`Usuario ${req.user.username} no es el dueño del producto con id ${products[indeceABorrar].id}. Dueño real es el ${products[indeceABorrar].dueño}. Request no será procesado`)
        res.status.send(`No eres dueño del producto con id ${products[indeceABorrar]}. Solo puedes borrar productos creados por ti`)
    }

    log.info(`Producto con id [${req.params.id}] fue borrado`)
    let borrado = products.splice(indiceABorrar, 1);
    res.json(borrado);

});

module.exports = productsRouter;