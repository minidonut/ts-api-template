import {createConnection, getConnection} from 'typeorm';
import {createDatabaseConnection} from "../../src/config/database";

const testConnection = {
    async create(){
        await createDatabaseConnection();
    },

    async close(){
        await getConnection().close();
    },

    async clear(){
        const connection = getConnection();
        const entities = connection.entityMetadatas;

        for (const entity of entities) {
            const repository = connection.getRepository(entity.name);
            await repository.clear();
        }
    },
};
export default testConnection;
