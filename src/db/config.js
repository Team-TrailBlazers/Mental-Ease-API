import dotenv from "dotenv";
import assert from "assert";
dotenv.config();
console.log(process.env.PORT);

const {
  // HOST_URL,
  // HOST,
  PORT,
  SQL_SERVER,
  SQL_USER,
  SQL_PWD,
  SQL_DB,
  JWT_SECRET,
  MAIL_PASSWORD,
  STRIPE_SECRET_KEY,
  CLIENT,
} = process.env;

assert(PORT, "PORT is required");
// assert(HOST, "HOST is required");

const config = {
  port: PORT,
  // host: HOST,

  // url: HOST_URL,
  sql: {
    server: SQL_SERVER,
    user: SQL_USER,
    password: SQL_PWD,
    database: SQL_DB,
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  },
  jwt_secret: JWT_SECRET,
  mail_password: MAIL_PASSWORD,
  stripe_secret_key: STRIPE_SECRET_KEY,
  client: CLIENT,
};

export default config;
