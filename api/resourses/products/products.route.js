const express = require('express')
const _ = require('underscore')
const products = require("./../../../database").products
const uuidv4 = require('uuid/v4')
const Joi = require('joi')
const productsRouter = express.Router()


const blueprintProduct = Joi.object().keys({
    titulo : Joi.string().max(100).required(),
    precio : Joi.number().positive().precision(2).required(),
    moneda : Joi.string().length(3).uppercase
})

const validarProducto = (req,res,next)=>{
    let resultado = Joi.validate(req.body,blueprintProduct,{abortEarly:false,convert: false})
    console.log(resultado)

    if(resultado.error === null){
        next();//ve a la sgt funcion de la cadena y no es return
    }
    else{
        let errorDeValidacion = resultado.error.details.reduce((acumulador,error)=>{
            return acumulador + `[${error.message}]`
        })
        res.status(400).send(errorDeValidacion  )
    }
}

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
    return res.status(404).send(`Producto [${req.params.id}] no encontrado`)
    })

productsRouter.put('/:id',validarProducto,(req,res)=>{
        let id = req.params.id
        let reemplazoParaProducto = req.body;
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