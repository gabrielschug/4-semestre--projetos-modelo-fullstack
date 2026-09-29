import { z } from "zod"

import { adminLoginSchema } from "../schemas/AdminSchema"

export type LoginAdminInput = z.infer<typeof adminLoginSchema>
