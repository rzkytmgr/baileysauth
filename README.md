<p align="center">
	<p align="center">Baileys Auth</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/baileys-v7.0.0--rc.6-x?labelColor=%230bd09f&color=%23f2f5f4">
  <img src="https://img.shields.io/npm/v/baileysauth?label=%20baileysauth&labelColor=%23cdb34c&color=%23f2f5f4">
  <br>
  <img src="https://img.shields.io/npm/unpacked-size/baileysauth?label=size">
  <img src="https://img.shields.io/github/actions/workflow/status/rzkytmgr/baileysauth/matrix-node-test.yaml">
  <img src="https://img.shields.io/npm/v/baileysauth?label=npm%20release">
  <img src="https://img.shields.io/npm/dw/baileysauth">
</p>

<hr>

Lightweight package multiple session and multiple authentication methods for [Baileys](https://github.com/WhiskeySockets/Baileys) whatsapp socket library. Supporting SQL and NoSQL databases.

<details open>
  <summary><b>Table of Contents</b></summary>
  <ul>
    <li>
      <a href="#installation">Installation</a>
    </li>
    <li>
      <a href="#how-to-use">How to use</a>
    </li>
    <li>
      <a href="#example-usage">Example</a>
    </li>
  </ul>
</details>


## Installation

This package relies on peer dependencies for database drivers.
Make sure to install the appropriate driver for your preferred database.  
Supported databases:
- MySQL – requires [`mysql2`](https://www.npmjs.com/package/mysql2)
- PostgreSQL – requires [`pg`](https://www.npmjs.com/package/pg)
- MongoDB – requires [`mongodb`](https://www.npmjs.com/package/mongodb)

### Example Installation

```bash
# Using MySQL
npm install baileysauth mysql2

# Using PostgreSQL
npm install baileysauth pg

# Using MongoDB
npm install baileysauth mongodb
```
After packages installation, now you can import the `useBaileysAuthState` function to your code
```typescript
import useBaileysAuthState from 'baileysauth';
```

## How to Use

This package provides two ways to connect to your database using a connection string or using a connection options object,
### Using a Connection String
You can establish a connection by passing a valid connection string directly:
```typescript
const { saveCreds, state } = await useBaileysAuthState(
  "mysql://<username>:<password>@localhost:3306/mydatabase"
);
```
> [!NOTE]
> Since the release of version `v1.2.0` baileysauth has supported custom table name and session name for connection string connect method. Please check the [example](https://github.com/rzkytmgr/baileysauth/tree/master/example) directory to see how to customize it.

### Using Connection Options

Alternatively, you can use an options object for more flexibility. This method allows you to specify the database driver explicitly using the dialect property and pass driver-specific options through the args property.
```typescript
const { saveCreds, wipeCreds, state } = await useBaileysAuthState({
  dialect: "mysql", // allowed values: mysql, pg, mongodb
  database: MYSQL_DATABASE,
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  port: MYSQL_PORT,
  session: APP_SESSION,
  table: APP_STORE,
  // Driver-specific options (optional)
  args: {
    // For MySQL (mysql2)
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false },
  },
});
```
> [!NOTE]
> The args property should contain valid options specific to the selected dialect. Refer connection options below based on your dialect,
> - MySQL – [`ConnectionOptionsBase`](https://github.com/rzkytmgr/baileysauth/blob/master/src/Types/index.ts#L29) and [`ConnectionOptions`](https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/Connection.d.ts#L82-L338)
> - PostgreSQL – [`ConnectionOptionsBase`](https://github.com/rzkytmgr/baileysauth/blob/master/src/Types/index.ts#L29) and [`ClientConfig`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/pg/index.d.ts#L12-L33)
> - MongoDB – [`MongoDBConnectionOptions`](https://github.com/rzkytmgr/baileysauth/blob/master/src/Types/index.ts#L42) and [`MongoClientOptions`](https://github.com/mongodb/node-mongodb-native/blob/main/src/mongo_client.ts#L141-L318)

If you are still confused, please ask by [creating an issue](https://github.com/rzkytmgr/baileysauth/issues).

## Example Usage

For usage examples, you can refer to the example directory. [Check it out!](https://github.com/rzkytmgr/baileysauth/tree/master/example)

## 🧩 Contributing
If you have any question or you have an issue when trying to use the package feel free to [create an issue](https://github.com/rzkytmgr/baileysauth/issues) or [make a pull request](https://github.com/rzkytmgr/baileysauth/pulls) to contribute.

---
<sub>Made with ❤️ by <a href="https://github.com/rzkytmgr">Rizky Aulia Tumangger</a> - Copyright All Rights Reserved © 2025</sub>