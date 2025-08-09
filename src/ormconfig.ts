import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
//connect to database
const config: PostgresConnectionOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'dcx',
    password: 'dcx',
    database: 'dcx',
    entities: ['dist/**/*.entity.js'],
    //synchronize: true,
    //logging: true,
    migrationsTableName: 'migrations',
    migrations: ['dist/migrations/*.js'],


};
const AppDataSource = new DataSource(config);
export { AppDataSource }
export default config;
