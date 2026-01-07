import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core"
import { SqliteDriver } from "@mikro-orm/sqlite"
import { Request } from "./entities/Request.entity"
import path from "path"

let orm: MikroORM | undefined

export async function getORM() {
  if (orm) return orm

  orm = await MikroORM.init({
    entities: [Request],
    dbName: path.join(process.cwd(), "database.sqlite"),
    driver: SqliteDriver,
    debug: process.env.NODE_ENV !== "production",
    allowGlobalContext: true,
  })

  await orm.schema.updateSchema()

  return orm
}

export async function getEntityManager() {
  const orm = await getORM()
  return orm.em.fork()
}
