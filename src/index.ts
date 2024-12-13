import { PureAbility } from "@casl/ability";
import { rulesToAST } from "@casl/ability/extra";
import { FieldCondition } from "@ucast/core";
import { eq, gt, SQL } from "drizzle-orm";
import { type PgTableWithColumns, type TableConfig } from "drizzle-orm/pg-core";

type Operator = (
  condition: FieldCondition,
  table: PgTableWithColumns<TableConfig>,
) => SQL | undefined;

const operators: Record<string, Operator> = {
  eq: (condition, table) => {
    const column = table[condition.field];

    return eq(column, condition.value);
  },
  gt: (condition, table) => {
    const column = table[condition.field];

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

  return op(condition, table);
}
