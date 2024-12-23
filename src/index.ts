import { AnyMongoAbility, ExtractSubjectType } from "@casl/ability";
import { rulesToAST } from "@casl/ability/extra";
import { CompoundCondition, Condition, FieldCondition } from "@ucast/core";
import * as drizzle from "drizzle-orm";
import { isRegExp } from "node:util/types";

export type TableWithColumns<
  T extends drizzle.TableConfig = drizzle.TableConfig,
> = drizzle.Table<T> & {
  [Key in keyof T["columns"]]: T["columns"][Key];
};

type FieldInterpreter = (
  condition: FieldCondition,
  table: TableWithColumns,
) => drizzle.SQL | undefined;

type CompoundInterpreter = (
  conditions: CompoundCondition,
  table: TableWithColumns,
) => drizzle.SQL | undefined;

const eq: FieldInterpreter = (condition, table) => {
  const column = table[condition.field];

  if (isRegExp(condition.value)) {
    return drizzle.ilike(column, condition.value.source);
  }

  return drizzle.eq(column, condition.value);
};

const ne: FieldInterpreter = (condition, table) => {
  const column = table[condition.field];

  return drizzle.ne(column, condition.value);
};

const gt: FieldInterpreter = (condition, table) => {
  const column = table[condition.field];

  return drizzle.gt(column, condition.value);
};

const gte: FieldInterpreter = (condition, table) => {
  const column = table[condition.field];

  return drizzle.gte(column, condition.value);
};

const lt: FieldInterpreter = (condition, table) => {
  const column = table[condition.field];

  return drizzle.lt(column, condition.value);
};

const lte: FieldInterpreter = (condition, table) => {
  const column = table[condition.field];

  return drizzle.lte(column, condition.value);
};

// we can't use `in` as const, so we're using `inArray` as alias
// inside the `interpreters` object we rename it to `in` to avoid confusion
const inArray: FieldInterpreter = (condition, table) => {
  const column = table[condition.field];
  return drizzle.inArray(column, condition.value as unknown[]);
};

const notInArray: FieldInterpreter = (condition, table) => {
  const column = table[condition.field];
  return drizzle.notInArray(column, condition.value as unknown[]);
};

const and: CompoundInterpreter = (conditions, table) => {
  return drizzle.and(
    ...conditions.value.map((condition) => {
      return generateSQL(condition, table);
    }),
  );
};

const or: CompoundInterpreter = (conditions, table) => {
  return drizzle.or(
    ...conditions.value.map((condition) => {
      return generateSQL(condition, table);
    }),
  );
};

const interpreters: Record<string, FieldInterpreter | CompoundInterpreter> = {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  and,
  or,
  in: inArray,
  nin: notInArray,
};

export function generateSQL<T extends drizzle.TableConfig>(
  condition: Condition,
  table: TableWithColumns<T>,
): drizzle.SQL | undefined {
  const { operator } = condition;

  const op = interpreters[operator];

  if (!op) {
    throw new Error(`Unsupported operator: ${operator}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return op(condition as any, table);
}

export function rulesToDrizzle<
  T extends drizzle.TableConfig,
  U extends AnyMongoAbility,
>(
  ability: U,
  action: Parameters<U["rulesFor"]>[0],
  subject: ExtractSubjectType<Parameters<U["rulesFor"]>[1]>,
  table: TableWithColumns<T>,
): drizzle.SQL | undefined {
  const condition = rulesToAST(ability, action, subject);

  if (!condition) {
    return undefined;
  }

  return generateSQL(condition, table);
}
