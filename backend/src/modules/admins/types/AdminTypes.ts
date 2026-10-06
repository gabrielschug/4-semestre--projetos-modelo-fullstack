import { z } from "zod";

import { adminCadastroSchema, adminLoginSchema } from "../schemas/AdminSchema";

export type LoginAdminInput = z.infer<typeof adminLoginSchema>;

export type CadastrarAdminInput = z.infer<typeof adminCadastroSchema>;
