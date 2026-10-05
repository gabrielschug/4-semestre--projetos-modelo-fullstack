import express from "express";
import cors from "cors";

import { produtoRouter } from "./modules/produtos/routes/ProdutoRoute";
import { pedidoRouter } from "./modules/pedidos/routes/PedidoRouter";
import { clienteRouter } from "./modules/clientes/routes/ClienteRouter";
import { adminRouter } from "./modules/admins/routes/AdminRouter";
import { bairrosRouter } from "./modules/bairros/routes/BairrosRouter";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

app.use("/produtos", produtoRouter);
app.use("/pedidos", pedidoRouter);
app.use("/clientes", clienteRouter);
app.use("/admins", adminRouter);
app.use("/valores_entregas", adminRouter);
app.use("/bairros", bairrosRouter);

app.get("/", (req, res) => {
  res.send("API: Restaurante");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
