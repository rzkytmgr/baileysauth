## 🔐 Baileys Authentication
Multiple authentication methods package for [Baileys](https://github.com/WhiskeySockets/Baileys) WhatsApp bot library, supporting both SQL and NoSQL databases. 

<details open>
  <summary><b>Table of Contents</b></summary>
  <ul>
    <li>
      <a href="#-installation">Installation</a>
    </li>
    <li>
      <a href="#-how-to-use">How to use</a>
    </li>
    <li><a href="#-connect-to-mysql">Connect to MySQL</a></li>
    <li><a href="#-connect-to-postgresql">Connect to PostgreSQL</a></li>
    <li><a href="#-connect-to-mongodb">Connect to MongoDB</a></li>
    <li>
      <a href="#-example">Example</a>
    </li>
  </ul>
</details>


## 📥 Installation
This package uses peer dependencies, which means you will need to manually install the relevant database driver based on the database you're using. For example, if you're working with MySQL, you should install the corresponding MySQL driver. Make sure to consult the documentation to find the correct version of the driver to ensure compatibility.

```bash
# MySQL
npm i baileysauth mysql2
```

```bash
# PostgreSQL
npm i baileysauth pg
```

```bash
# MongoDB
npm i baileysauth mongodb
```

If you're using alternative package managers like `yarn` or `pnpm`, you can install the dependencies as follows

```bash
# Using yarn
yarn add baileysauth {driver}
```

```bash
# Using pnpm
pnpm add baileysauth {driver}
```

## 📜 How to use

This package allow you to connect to database with two methods, the first one is using connection string and the second is using connection options object based on database you used.
> [!warning]
> For now, connection method using connection string doesn't support custom table name and session name. it means you cannot create multiple session if you using connection string connect method.

When you're using connection options object to connect to database you can choose driver database by include `dialect` property on connection object, check code below

```typescript
const { saveCreds, wipeCreds, state } = await useBaileysAuthState({
  dialect: "mysql", // allowed value `mysql`, `postgres`, `mongodb`, or `mongodb+srv`
  ...otherConnectionOptions
);
```

But, if you're using connection string method, you don't need to define them,

```typescript
const { saveCreds, state } = await useBaileysAuthState("mysql://<username>:<password>@localhost:3306/mydatabase");
```

Currently this package only support MySQL, PostgreSQL, and MongoDB. If you cannot find your favorites database, feel free to [create an issue](https://github.com/rzkytmgr/baileysauth/issues). If you still confuse please check the details below.

## 🐬 Connect to MySQL

Connect using connection string method for MySQL
```typescript
const { saveCreds, wipeCreds, state } = await useBaileysAuthState("mysql://root:password@localhost:3306/dbname");
```

If you prefer using connection options object, You can refer to [`ConnectionOptionsBase`](https://github.com/rzkytmgr/baileysauth/blob/master/src/Types/index.ts#L29) and [`ConnectionOptions`](https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/Connection.d.ts#L82-L338) type from `mysql2` package driver for full of connection options allowed property. here is an example with several important connection options,
```typescript
const { saveCreds, wipeCreds, state } = await useBaileysAuthState({
  dialect: "mysql",         // database driver
  host: "localhost",        // your database host
  user: "root",             // your database user
  password: "password",     // your database password
  database: "mydatabase",   // your database name
  port: 3306,               // your database port
  sessionName: "mysession", // session name
  tableName: "mytable",     // session table name in database
);
```

## 🐘 Connect to PostgreSQL

Actually it looks the same as how to connect to mysql

```typescript
const { saveCreds, wipeCreds, state } = await useBaileysAuthState("postgresql://postgres:postgres@localhost:5432/dbname");
```

The differences goes on how you connect with connection options method. Maybe all of important connection options looks the same. But, for others options you can refer to [`ConnectionOptionsBase`](https://github.com/rzkytmgr/baileysauth/blob/master/src/Types/index.ts#L29) and [`ClientConfig`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/pg/index.d.ts#L12-L33) type from `pg` package driver.
```typescript
const { saveCreds, wipeCreds, state } = await useBaileysAuthState({
  dialect: "postgres",      // database driver
  host: "localhost",        // your database host
  user: "postgres",         // your database user
  password: "password",     // your database password
  port: 5432,               // your database port
  sessionName: "mysession", // session name
  tableName: "mytable",     // session table name in database
);
```

## 🍃 Connect to MongoDB

Below how to connect to your MongoDB
```typescript
const { saveCreds, wipeCreds, state } = await useBaileysAuthState("mongodb://username:password@localhost:27017/yourdatabase?authSource=admin");
```

> [!warning]
> Note that if you're using object connection options method, the value of the `dialect` property matters because it defines your MongoDB protocol. For example, if your MongoDB protocol is `mongodb+srv`, you need to set the `dialect` property to `mongodb+srv`. otherwise, use `mongodb`. 

If you prefer using object, you can refer to [`MongoDBConnectionOptions`](https://github.com/rzkytmgr/baileysauth/blob/master/src/Types/index.ts#L42) and [`MongoClientOptions`](https://github.com/mongodb/node-mongodb-native/blob/main/src/mongo_client.ts#L141-L318) type from `mongodb` package driver.
```typescript
const { saveCreds, wipeCreds, state } = await useBaileysAuthState({
  dialect: "mongodb",        // for this property, please refer to warning blockquote
  host: "localhost",         // your database host
  user: "username",          // your database user
  password: "password",      // your database password
  port: 27017,               // your database port
  sessionName: "mysession",  // session name
  collection: "mycollection",// tableName define as collection name
);
```

## 🤔 Example
Implementation on real case,
```javascript
import { useBaileysAuthState } from "baileysauth";

const initializer = async (session) => {
    try {
        const { saveCreds, wipeCreds, state } = await useBaileysAuthState("mysql://root:password@localhost:3306/baileys_auth");

        const socket = makeWASocket({
            auth: state,
        });

        socket.ev.on("creds.update", saveCreds);
        socket.ev.on("connection.update", (listener) => { /** your connection update handler */ });
        socket.ev.on("messages.upsert", (args) => { /** your message handler */ });
    } catch (err) {
        console.debug(err);
    }
};

initializer("mysession");
```
## 🧩 Contributing
If you have any question or you have an issue when trying to use the package feel free to [create an issue](https://github.com/rzkytmgr/baileysauth/issues) or [make a pull request](https://github.com/rzkytmgr/baileysauth/pulls) to contribute.

---
<sub>Made with ❤️ by <a href="https://instagram.com/rzkytmgr">Rizky Aulia Tumangger</a> - Copyright All Rights Reserved © 2025</sub>