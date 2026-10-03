import { config } from "./config";
import type { Knex } from "knex";

const knexConfig = {
    development: {
        client: "pg",
        connection: {
            host: config.POSTGRES_HOST,
            port: config.POSTGRES_PORT,
            user: config.POSTGRES_USER,
            password: config.POSTGRES_PASSWORD,
            database: config.POSTGRES_DB,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: "./database/migrations",
            extension: "ts",
        },
        seeds: {
            directory: "./database/seeds",
            extension: "ts",
        },
    },
};

export default knexConfig;