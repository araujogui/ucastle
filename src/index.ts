import { PureAbility } from "@casl/ability";
import { rulesToAST } from "@casl/ability/extra";
import { CompoundCondition, Condition, FieldCondition } from "@ucast/core";
import * as drizzle from "drizzle-orm";
import { type PgTableWithColumns, type TableConfig } from "drizzle-orm/pg-core";

type FieldOperator = (
  condition: FieldCondition,
  table: PgTableWithColumns<TableConfig>,
) => drizzle.SQL | undefined;

type CompoundOperator = (
  conditions: CompoundCondition,
  table: PgTableWithColumns<TableConfig>,
) => drizzle.SQL | undefined;

const eq: FieldOperator = (condition, table) => {
  const column = table[condition.field];

  return drizzle.eq(column, condition.value);
};

const gt: FieldOperator = (condition, table) => {
  const column = table[condition.field];

  return drizzle.gt(column, condition.value);
};

const and: CompoundOperator = (conditions, table) => {
  return drizzle.and(
    ...conditions.value.map((condition) => {
      return generateSQL(condition, table);
    }),
  );
};

const or: CompoundOperator = (conditions, table) => {
  return drizzle.or(
    ...conditions.value.map((condition) => {
      return generateSQL(condition, table);
    }),
  );
};

const operators: Record<string, FieldOperator | CompoundOperator> = {
  eq,
  gt,
  and,
  or,
};

export function generateSQL<T extends TableConfig>(
  condition: Condition,
  table: PgTableWithColumns<T>,
): drizzle.SQL | undefined {
  const { operator } = condition;

  const op = operators[operator];

  if (!op) {
    throw new Error(`Unsupported operator: ${operator}`);
  }

  return op(condition as any, table);
}

export function rulesToDrizzle<T extends TableConfig>(
  ability: PureAbility,
  table: PgTableWithColumns<T>,
): drizzle.SQL | undefined {
  const condition = rulesToAST(ability, "read", "User");

  if (!condition) {
    return undefined;
  }

  return generateSQL(condition, table);
}
