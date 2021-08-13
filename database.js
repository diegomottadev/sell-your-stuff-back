let products = [
    {id:'12',titulo:'mackpro13',precio:1300, moneda: 'USD', dueño: "admin"},
    {id:'123',titulo:'microfono',precio:1300, moneda: 'USD',dueño: "admin"},
    {id:'1234',titulo:'taza de cafe ',precio:1300, moneda: 'USD',dueño: "admin"},
]

let usuarios = [
    {
        username: 'admin',
        email: 'admin@admin.com',
        password: '$2b$10$UydhMVxSv9F8arwwACn43uouYO/rXd16e5uMyDWonG2a9M9x6F/TO',
        id: 'e0aa39f9-27b8-4bb0-bec9-eec940ee3a92'
      },
      {
        username: 'diegote',
        email: 'diego@admin.com',
        password: '$2b$10$ofnPAzj04KE97ukz90trfO9DzXgXWiDe9RbBJVihyq2/rGhlJYrUm',
        id: 'bfba9c85-f663-4263-94a8-4179e52e37af'
      }
];

module.exports ={
    products,
    usuarios
}