const express = require('express')
const _ = require('underscore')
const products = require("./../../../database").products
const uuidv4 = require('uuid/v4')
const productsRouter = express.Router()
const validarProducto = require('./products.validate')
const log = require('./../utils/logger')
productsRouter.get("/",(req,res)=> {
    res.json(products)
})
//localhost:3000/productos
productsRouter.post('/', validarProducto,(req,res) =>{
    let nuevoProducto = req.body

    nuevoProducto.id = uuidv4()
    products.push(nuevoProducto)
    //Created 200
    res.status(201).json(nuevoProducto)

})

productsRouter.get('/:id',(req,res)=> {
    for( let producto of products){
        if (producto.id == req.params.id){
            res.json(producto);
            return;
        }
    }
    log.warn(`Producto [${req.params.id}] no encontrado`)
    return res.status(404).send(`Producto [${req.params.id}] no encontrado`)
    })

productsRouter.put('/:id',validarProducto,(req,res)=>{
        let id = req.params.id
        let reemplazoParaProducto = req.body;
        let indice =  _.findIndex(products,product => product.id == id)
        if(indice !== -1){
            reemplazoParaProducto.id = id
            products[indice] = reemplazoParaProducto;
            log.info(`Producto con id [${id}] remplazado con nuevo producto`, reemplazoParaProducto)

            res.status(200).json(reemplazoParaProducto);
        }else{
            log.error(`Producto [${req.params.id}] no encontrado`)
            res.status(404).send(`Producto [${id}] no encontrado`);

        }
    })

productsRouter.delete('/:id',(req,res)=>{
        let indiceABorrar = _.findIndex(products, product => product.id === req.params.id);
        console.log(indiceABorrar)
        if(indiceABorrar === -1){
            log.error(`Producto [${req.params.id}] no encontrado. Nada que borrar`)
            res.status(404).send(`Producto [${req.params.id}] no encontrado. Nada que borrar`)
            return
        }
        let borrado = products.splice(indiceABorrar,1);
        res.json(borrado);

    });

    module.exports = productsRouter;