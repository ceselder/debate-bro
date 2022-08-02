import type { NextApiRequest, NextApiResponse } from "next";
import CreateRedisClient from "../../../lib/redis";

const allowedMethods = ["POST", "GET", "PUT", "DELETE"]

export const TopicRequestHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    if (!allowedMethods.some(x => x === method)) {
        return res.status(405).send("method_not_allowed");
    }

    const redis = CreateRedisClient();

    try {
        await redis.connect();

        switch (req.method) {
            case "POST":
                const addRes = await redis.RPUSH("debatebro:topics", JSON.stringify(req.body.data));
                if (addRes < 1) {
                    return res.status(500).send("internal_server_error");
                }
                return res.status(201).send("created");
            case "GET":
                let topicsStringArray: string[] = await redis.LRANGE("debatebro:topics", 0, -1);
                if (topicsStringArray.length === 0) {
                    return res.status(404).send("not_found");
                }
                let topics: Topic[] = topicsStringArray.map(json => JSON.parse(json));
                return res.status(200).send(topics);
            case "PUT": 
                return res.status(501).send("PUT - not_implemented");
            case "DELETE": 
                return res.status(501).send("DELETE - not_implemented");
            default: return res.status(500).send("internal_server_error"); //Should never get here, but adding default is good practice
        }
    } catch (e) {

    } finally {
        if (redis) {
            console.log("Attempting to gracefully terminate redis connection");
            redis.disconnect();
        }
    }
}

export default TopicRequestHandler;