import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { swaggerDocumento } from "./docs/swagger";

import { produtoRouter } from "./modules/produtos/routes/ProdutoRoute";
import { pedidoRouter } from "./modules/pedidos/routes/PedidoRouter";
import { clienteRouter } from "./modules/clientes/routes/ClienteRouter";
import { adminRouter } from "./modules/admins/routes/AdminRouter";
import { bairrosRouter } from "./modules/bairros/routes/BairrosRouter";
import { itensPedidoRouter } from "./modules/itensPedido/routes/ItensPedidoRouter";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use((req, _res, next) => {
  req.url = req.url.replace(/^\/{2,}/, "/");
  next();
});
app.use(express.json());
app.use(cors());

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocumento, {
    swaggerOptions: { persistAuthorization: true },
  }),
);

app.use("/produtos", produtoRouter);
app.use("/pedidos", pedidoRouter);
app.use("/clientes", clienteRouter);
app.use("/admins", adminRouter);
app.use("/valores_entregas", bairrosRouter);
app.use("/bairros", bairrosRouter);
app.use("/itens-pedido", itensPedidoRouter);

app.get("/", (req, res) => {
  res.send("API: Restaurante");
});

app.listen(port, "0.0.0.0", (erro) => {
  if (erro) {
    console.error(`Erro ao iniciar o servidor na porta ${port}:`, erro.message);
    process.exit(1);
  }
  console.log(`Servidor rodando na porta: ${port}`);
});
