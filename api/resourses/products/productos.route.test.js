let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let request = require('supertest')
let mongoose = require('mongoose')

let config = require('../../../config')
let Producto = require('./productos.model')
let Usuario = require('../usuarios/usuarios.model')
let app = require('../../../index').app
let server = require('../../../index').server

let productoYaEnBaseDeDatos = {
  titulo: 'Macbook Pro 13 Inches',
  precio: 1300,
  moneda: 'USD',
  dueño: 'daniel'
}

let nuevoProducto = {
  titulo: 'Cuerda Mammut 60 metros',
  precio: 200,
  moneda: 'USD'
}

let idInexistente = '5ab8dbcc6539f91c2288b0c1'

let testUsuario = {
  username: 'daniel',
  email: 'daniel@gmail.com',
  password: 'holaquetal'
}

let authToken
let tokenInvalido = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmEzMjJiZGQ2NTRhN2RiZmNjNGUzMCIsImlhdCI6MTUyMjE1MTk3OSwiZXhwIjoxNTIyMjM4Mzc5fQ.AAtAAAAkYuAAAy9O-AA0sAkcAAAAqfXskJZxhGJuTIk'

function obtenerToken(done) {
  // Antes de este bloque de tests creamos un usuario y obtenemos
  // su JWT token. Esto nos permitirá testear rutas que requieren autenticación.
  Usuario.deleteMany({}, err => {
    if (err) done(err)
    request(app)
      .post('/usuarios')
      .send(testUsuario)
      .end((err, res) => {
        expect(res.status).toBe(201)
        request(app)
          .post('/usuarios/login')
          .send({
            username: testUsuario.username,
            password: testUsuario.password
          })
          .end((err, res) => {
            expect(res.status).toBe(200)
            authToken = res.body.token
            done()
          })
      })
  })
}

describe('Productos', () => {
  
  beforeEach((done) => {
    Producto.deleteMany({}, err => { 
      done()
    })   
  })

  afterAll(async () => {
    server.close()
    await mongoose.disconnect()
  })

  describe('GET /productos/:id', () => {
    it('Tratar de obtener un producto con un id inválido debería retornar 400', done => {
      request(app)
        .get('/productos/123')
        .end((err, res) => {
          expect(res.status).toBe(400)
          done()
        })      
    })
    
    it('Tratar de obtener un producto que no existe debería retornar 404', done => {
      request(app)
        .get(`/productos/${idInexistente}`)
        .end((err, res) => {
          expect(res.status).toBe(404)
          done()
        })
    })

    it('Debería retornar un producto que si existe exitósamente', done => {
      Producto(productoYaEnBaseDeDatos).save()
        .then(producto => {
          request(app)
            .get(`/productos/${producto._id}`)
            .end((err, res) => {
              expect(res.status).toBe(200)
              expect(res.body).toBeInstanceOf(Object)
              expect(res.body.titulo).toEqual(producto.titulo)
              expect(res.body.precio).toEqual(producto.precio)
              expect(res.body.moneda).toEqual(producto.moneda)
              expect(res.body.dueño).toEqual(producto.dueño)
              done()
            })
        })
        .catch(err => {
          done(err)
        })
    })
  })

  describe('POST /productos', () => {

    beforeAll(obtenerToken)

    it('Si el usuario provee un token válido y el producto también es válido, debería ser creado', done => {
      request(app)
        .post('/productos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(nuevoProducto)
        .end((err, res) => {
          expect(res.status).toBe(201)
          expect(res.body.titulo).toEqual(nuevoProducto.titulo)
          expect(res.body.moneda).toEqual(nuevoProducto.moneda)
          expect(res.body.precio).toEqual(nuevoProducto.precio)
          expect(res.body.dueño).toEqual(testUsuario.username)
          done()
        })
    })

    it('Si el usuario no provee un token de autenticación válido, debería retornar 401', done => {
      request(app)
        .post('/productos')
        .set('Authorization', `Bearer ${tokenInvalido}`)
        .send(nuevoProducto)
        .end((err, res) => {
          expect(res.status).toBe(401)
          done()
        })
    })

    it('Si al producto le falta el título, no debería ser creado', done => {
      request(app)
        .post('/productos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          moneda: nuevoProducto.moneda,
          precio: nuevoProducto.precio
        })
        .end((err, res) => {
          expect(res.status).toBe(400)
          done()
        })
    })

    it('Si al producto le falta el precio, no debería ser creado', done => {
      request(app)
        .post('/productos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          titulo: nuevoProducto.titulo,
          moneda: nuevoProducto.moneda
        })
        .end((err, res) => {
          expect(res.status).toBe(400)
          done()
        })
    })

    it('Si al producto le falta la moneda, no debería ser creado', done => {
      request(app)
        .post('/productos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          titulo: nuevoProducto.titulo,
          precio: nuevoProducto.precio
        })
        .end((err, res) => {
          expect(res.status).toBe(400)
          done()
        })
    })
  })

  describe('DELETE /productos/:id', () => {

    let idDeProductoExistente

    beforeAll(obtenerToken)

    beforeEach(done => {
      Producto.deleteMany({}, (err) => { 
        if (err) done(err)
        Producto(productoYaEnBaseDeDatos).save()
          .then(producto => {
            idDeProductoExistente = producto._id
            done()
          })
          .catch(err => {
            done(err)
          })
      })
    })

    it('Tratar de obtener un producto con un id inválido debería retornar 400', done => {
      request(app)
        .delete('/productos/123')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(400)
          done()
        })
    })

    it('Tratar de borrar un producto que no existe debería retornar 404', done => {
      request(app)
        .delete(`/productos/${idInexistente}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(404)
          done()
        })
    })

    it('Si el usuario no provee un token de autenticación válido, debería retornar 401', done => {
      request(app)
        .delete(`/productos/${idDeProductoExistente}`)
        .set('Authorization', `Bearer ${tokenInvalido}`)
        .end((err, res) => {
          expect(res.status).toBe(401)
          done()
        })
    })

    it('Si el usuario no es el dueño del producto, debería retornar 401', done => {
      Producto({
        titulo: 'Adidas Gazelle',
        precio: 90,
        moneda: 'USD',
        dueño: 'ricardo98'
      }).save()
        .then(producto => {
          request(app)
            .delete(`/productos/${producto._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
              expect(res.status).toBe(401)
              expect(res.text.includes('No eres dueño del producto con id')).toBe(true)
              done()
          })
        })
        .catch(err => {
          done(err)
        })
    })

    it('Si el usuario es dueño del producto y entrega un token valido, el producto debería ser borrado', done => {
      request(app)
        .delete(`/productos/${idDeProductoExistente}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(200)
          expect(res.body.titulo).toEqual(productoYaEnBaseDeDatos.titulo)
          expect(res.body.precio).toEqual(productoYaEnBaseDeDatos.precio)
          expect(res.body.moneda).toEqual(productoYaEnBaseDeDatos.moneda)
          expect(res.body.dueño).toEqual(productoYaEnBaseDeDatos.dueño)
          Producto.findById(idDeProductoExistente)
            .then(producto => {
              expect(producto).toBeNull()
              done()
            })
            .catch(err => {
              done(err)
            })
        })
    })

  })

})