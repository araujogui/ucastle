import { defineAbility } from "@casl/ability";
import { describe, expect, it } from "vitest";
import { rulesToDrizzle } from "./index.js";
import { integer, pgTable } from "drizzle-orm/pg-core";
import { eq, gt } from "drizzle-orm";

const users = pgTable("users", {
  id: integer().primaryKey(),
});

describe("rulesToDrizzle", () => {
  it("should generate an eq filter if condition operator is eq", () => {
    const ability = defineAbility((can) => {
      can("read", "User", { id: 1 });
    });

    const where = rulesToDrizzle(ability, users);

    expect(where).toEqual(eq(users.id, 1));
  });

  it("should generate an gt filter if condition operator is gt", () => {
    const ability = defineAbility((can) => {
      can("read", "User", { id: { $gt: 1 } });
    });

    const where = rulesToDrizzle(ability, users);

    expect(where).toEqual(gt(users.id, 1));
  });

  it("should throw an error if condition operator is not supported", () => {
    const ability = defineAbility((can) => {
      can("read", "User", { id: { $in: [1, 2] } });
    });

    expect(() => {
      rulesToDrizzle(ability, users);
    }).toThrowError("Unsupported operator: in");
  });
});
