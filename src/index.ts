import { PureAbility } from "@casl/ability";
import { rulesToAST } from "@casl/ability/extra";
import { FieldCondition } from "@ucast/core";
import { Column, eq, gt, SQL } from "drizzle-orm";
import { type PgTableWithColumns, type TableConfig } from "drizzle-orm/pg-core";

type Operator = (condition: FieldCondition, column: Column) => SQL | undefined;

const operators: Record<string, Operator> = {
  eq: (condition, column) => {
    return eq(column, condition.value);
  },
  gt: (condition, column) => {
    return gt(column, condition.value);
  },
};

export function rulesToDrizzle<T extends TableConfig>(
  ability: PureAbility,
  table: PgTableWithColumns<T>,
): SQL | undefined {
  const condition = rulesToAST(ability, "read", "User") as FieldCondition;

  if (!condition) {
    return undefined;
  }

  const { operator } = condition;

  const op = operators[operator];

  if (!op) {
    throw new Error(`Unsupported operator: ${operator}`);
  }

  const column = table[condition.field];

  return op(condition, column);
}
