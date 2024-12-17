# ucastle

Convert CASL rules into Drizzle filters

## Install

```sh
npm install ucastle
```

## Usage

```js
import { defineAbility } from "@casl/ability";
import { rulesToDrizzle } from "ucastle";

// Use any of your Drizzle tables
const users = pgTable("users", {
  id: integer().primaryKey(),
});

// Define your CASL ability
const ability = defineAbility((can) => {
  can("read", "User", { id: 1, age: { $lt: 18 } });
  can("read", "User", { age: { $gte: 18 } });
});

// Convert MongoDB query conditions into Drizzle filters
const where = rulesToDrizzle(ability, "read", "User", users);
// => or(
//  gte(users.age, 18),
//  and(eq(users.id, 1), lt(users.age, 18)),
// )
```
