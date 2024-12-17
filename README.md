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
  can("read", "User", { id: 1 });
});

// Convert MongoDB query conditions into Drizzle filters
const where = rulesToDrizzle(ability, "read", "User", users);
// eq(users.id, 1)
```
