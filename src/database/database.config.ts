export class DatabaseConfigService {
    public async getMongoConfig() {
        return {
            uri: "mongodb://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + "@" + process.env.MONGO_HOST
                + "/?authMechanism=" + process.env.MONGO_AUTH_MECHANISM + "&authSource=" + process.env.MONGO_DATABASE,
            useNewUrlParser: true,
            useUnifiedTopology: true
        };
    }
}