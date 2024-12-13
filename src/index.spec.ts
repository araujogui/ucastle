import { describe, expect, it } from "vitest";
import { generateSQL } from "./index.js";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { and, eq, gt, or } from "drizzle-orm";
import { CompoundCondition, FieldCondition } from "@ucast/core";

const users = pgTable("users", {
  id: integer().primaryKey(),
  name: text(),
});

describe("generateSQL", () => {
  it("should generate an eq filter if condition operator is eq", () => {
    const condition = new FieldCondition("eq", "id", 1);

    const sql = generateSQL(condition, users);

    expect(sql).toEqual(eq(users.id, 1));
  });

  it("should generate an gt filter if condition operator is gt", () => {
    const condition = new FieldCondition("gt", "id", 1);

    const sql = generateSQL(condition, users);

    expect(sql).toEqual(gt(users.id, 1));
  });

  it("should generate an and filter if condition operator is and", () => {
    const condition = new CompoundCondition("and", [
      new FieldCondition("eq", "id", 1),
      new FieldCondition("eq", "name", "John"),
    ]);

    const sql = generateSQL(condition, users);

    expect(sql).toEqual(and(eq(users.id, 1), eq(users.name, "John")));
  });

  it("should generate a or filter if condition operator is or", () => {
    const condition = new CompoundCondition("or", [
      new FieldCondition("eq", "id", 1),
      new FieldCondition("eq", "name", "John"),
    ]);

    const sql = generateSQL(condition, users);

    expect(sql).toEqual(or(eq(users.id, 1), eq(users.name, "John")));
  });

  it("should throw an error if condition operator is not supported", () => {
    const condition = new FieldCondition("in", "id", [1, 2]);

    expect(() => {
      generateSQL(condition, users);
    }).toThrowError("Unsupported operator: in");
  });
});
