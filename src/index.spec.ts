import { describe, expect, it } from "vitest";
import { generateSQL, rulesToDrizzle } from "./index.js";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { and, eq, gt, gte, lt, lte, or } from "drizzle-orm";
import { CompoundCondition, FieldCondition } from "@ucast/core";
import { defineAbility } from "@casl/ability";

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

  it("should generate an gte filter if condition operator is gte", () => {
    const condition = new FieldCondition("gte", "id", 1);

    const sql = generateSQL(condition, users);

    expect(sql).toEqual(gte(users.id, 1));
  });

  it("should generate an lt filter if condition operator is lt", () => {
    const condition = new FieldCondition("lt", "id", 1);

    const sql = generateSQL(condition, users);

    expect(sql).toEqual(lt(users.id, 1));
  });

  it("should generate an lte filter if condition operator is lte", () => {
    const condition = new FieldCondition("lte", "id", 1);

    const sql = generateSQL(condition, users);

    expect(sql).toEqual(lte(users.id, 1));
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

  it("should generate nested compound filters", () => {
    const condition = new CompoundCondition("or", [
      new FieldCondition("eq", "name", "John"),
      new CompoundCondition("and", [
        new FieldCondition("eq", "id", 1),
        new FieldCondition("eq", "name", "Jane"),
      ]),
    ]);

    const sql = generateSQL(condition, users);

    expect(sql).toEqual(
      or(eq(users.name, "John"), and(eq(users.id, 1), eq(users.name, "Jane"))),
    );
  });

  it("should throw an error if condition operator is not supported", () => {
    const condition = new FieldCondition("in", "id", [1, 2]);

    expect(() => {
      generateSQL(condition, users);
    }).toThrowError("Unsupported operator: in");
  });
});

describe("generateSQL", () => {
  it("should convert casl rules into drizzle filters", () => {
    const ability = defineAbility((can) => {
      can("read", "User", { id: 1 });
    });

    const sql = rulesToDrizzle(ability, "User", "read", users);

    expect(sql).toEqual(eq(users.id, 1));
  });
});
