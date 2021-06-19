const express = require('express')
const _ = require('underscore')
const products = require("./../../../database").products
const uuidv4 = require('uuid/v4')

const productsRouter = express.Router()

productsRouter.get("/",(req,res)=> {
    res.json(products)
})
//localhost:3000/productos
productsRouter.post('/', (req,res) =>{
    let nuevoProducto = req.body
    if(!nuevoProducto.titulo|| !nuevoProducto.precio || !nuevoProducto.moneda){
        //Bad request
        res.status(404).send("Tu producto debe especificar un titulo, precio y moneda")
        return
    }
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
    return res.status(404).send(`Producto [${req.params.id}] no encontrado`)
    })

productsRouter.put('/:id',(req,res)=>{
        let id = req.params.id
        let reemplazoParaProducto = req.body;
        if(!reemplazoParaProducto.titulo|| !reemplazoParaProducto.precio || !reemplazoParaProducto.moneda){
            //Bad request
            res.status(404).send("Tu producto debe especificar un titulo, precio y moneda")
            return
        }
        let indice =  _.findIndex(products,product => product.id == id)
        if(indice !== -1){
            reemplazoParaProducto.id = id
            products[indice] = reemplazoParaProducto;
            res.status(200).json(reemplazoParaProducto);
        }else{
            res.status(404).send(`Producto [${id}] no encontrado`);

        }
    })

productsRouter.delete('/:id',(req,res)=>{
        let indiceABorrar = _.findIndex(products, product => product.id = req.params.id);
        if(indiceABorrar === -1){
            res.status(404).send(`Producto [${id}] no encontrado. Nada que borrar`);
        }

        let borrado = products.splice(indiceABorrar,1);
        res.json(borrado);

    });

    module.exports = productsRouter;