import express from 'express'
import cors from 'cors'

import {produtoRoutes} from './modules/produtos/routes/produtoRoutes'
import {pedidoRoutes} from './modules/pedidos/routes/PedidoRoutes'
// import {adminRoutes} from './modules/admins/routes/adminRoutes'


// import routesMarcas from './routes/marcas'
// import routesCarros from './routes/carros'
// import routesClientes from './routes/clientes'
// import routesLogin from './routes/login'

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.use("/produtos", produtoRoutes)
app.use("/pedidos", pedidoRoutes)
// app.use("/admins", adminsRoutes)


// app.use("/marcas", routesMarcas)
// app.use("/carros", routesCarros)
// app.use("/clientes", routesClientes)
// app.use("/clientes/login", routesLogin)

app.get('/', (req, res) => {
  res.send('API: Restaurante')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})