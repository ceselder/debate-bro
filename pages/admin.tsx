import { GetStaticProps, NextPage } from "next";
import { CategoriesContainer } from "../components/admin/CategoriesContainer";
import TopicsContainer from "../components/admin/TopicsContainer";
import { CreateRedisClient } from "./../lib/redis";

type AdminPageProps = {
    Topics: Topic[],
    Categories: TopicCategory[],
    Error: boolean
}

export const AdminPage: NextPage<AdminPageProps> = ({ Topics, Categories, Error }) => {
    return (
        <div>
            {Error &&
                <div>
                    Got error from redis
                </div>
            }
            {!Error &&
                <div>
                    <CategoriesContainer Categories={Categories} />
                    <TopicsContainer Topics={Topics} />
                </div>
            }
        </div>
    );
}

export const getStaticProps: GetStaticProps<AdminPageProps> = async (context) => {
    const redis = CreateRedisClient();

    try {
        await redis.connect();

        let categories: TopicCategory[] = await redis.LRANGE("debatebro:categories", 0, -1);
        let topicsStringArray: string[] = await redis.LRANGE("debatebro:topics", 0, -1);
        let topics: Topic[] = topicsStringArray.map(json => JSON.parse(json));
        console.log(topics, categories);

        return {
            props: {
                Topics: topics,
                Categories: categories,
                Error: false
            }
        };
    } catch (e) {
        console.log(`Redis error (probably)\n${e}`);
        return {
            props: {
                Topics: [],
                Categories: [],
                Error: true
            }
        };
    } finally {
        if (redis) {
            console.log("Attempting to gracefully terminate redis connection");
            redis.disconnect();
        }
    }
}

export default AdminPage;