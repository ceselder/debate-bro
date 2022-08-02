import { createClient } from "redis";

export const CreateRedisClient = () => {
    try
    {
        const redis = createClient({
            url: process.env.REDIS_URL,
            socket: {
                tls: true,
                rejectUnauthorized: false
            }
        });        
        
        redis.on("error", (error) => {
            console.log(`Redis error\n${error}`);
        });

        return redis;
    } catch(e)
    {
        console.log(`Error when trying to create redis client:\n${e}`);
    }    
}

export default CreateRedisClient;

//TODO: Add typings for client