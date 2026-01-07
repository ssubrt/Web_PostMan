import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity({ tableName: "requests" })
export class Request {
  @PrimaryKey({ autoincrement: true })
  id!: number

  @Property()
  method!: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"

  @Property()
  url!: string

  @Property({ type: "text" })
  headers!: string

  @Property({ type: "text", nullable: true })
  body?: string

  @Property({ nullable: true })
  responseStatus?: number

  @Property({ type: "text", nullable: true })
  responseData?: string

  @Property({ nullable: true })
  responseTime?: number

  @Property({ nullable: true })
  tags?: string

  @Property()
  createdAt: Date = new Date()
}
