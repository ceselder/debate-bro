import { GetStaticProps, NextPage } from "next";
import { useState, KeyboardEvent, useCallback } from "react";
import { CategoriesContainer } from "../components/admin/CategoriesContainer";
import TopicsContainer from "../components/admin/TopicsContainer";
import { CreateRedisClient } from "./../lib/redis";
import axios from "axios";

type AdminPageProps = {
    Topics: Topic[],
    Categories: TopicCategory[],
    Error: boolean
}

export const AdminPage: NextPage<AdminPageProps> = ({ Topics, Categories, Error }) => {
    const [allowed, setAllowed] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [authLoading, setAuthLoading] = useState<boolean>(false);

    const [categories, setCategories] = useState<TopicCategory[]>(Categories);
    const [topics] = useState<Topic[]>(Topics);

    const handleUsernameInput = ({ target: { value } }) => setUsername(value);

    const handlePasswordInput = ({ target: { value } }) => setPassword(value);

    const handleReturnPress = useCallback(async (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            setAuthLoading(true);
            var res = await axios.post("/api/admin/auth", { data: password}, { validateStatus: () => true }); //Allow errors, but need to handle externally.
            if (res.status === 200) {
                setAllowed(true);

            } else if (res.status === 401) {
                console.log("Wrong password");
            } else {
                console.log("Other error");
            }
            setAuthLoading(false);
        }
    }, [username, password]);

    if (!allowed) {
        return (
            <div className='h-full min-h-[100vh] w-full text-simvoni flex text-center flex-col text-white bg-spacecadet '>
                <h1 className='text-4xl lg:text-6xl xl:text-8xl mt-5'>debate<span className='text-frenchskyblue'>-</span>bro<span className='text-frenchskyblue'>.com</span></h1>
                    <div className={"h-40 w-80 rounded-sm shadow-xl px-3 flex flex-col justify-center m-auto bg-[whitesmoke] relative"}>
                        <div className={"my-2 text-2xl font-bold text-black text-center select-none"}>
                            Admin Login
                        </div>
                        <input onKeyDown={handleReturnPress} onChange={handleUsernameInput} value={username} type={"text"} placeholder={"Username"} className={"outline-none rounded-t-sm border-b-[1px] focus:shadow-[inset_0px_0px_2px_3px_rgba(59,130,246,0.6)] transition-shadow placeholder:text-center text-center h-10 text-xl text-black"} />
                        <input onKeyDown={handleReturnPress} onChange={handlePasswordInput} value={password} type={"password"} placeholder={"Password"} className={"outline-none rounded-b-sm border-t-[1px] focus:shadow-[inset_0px_0px_2px_3px_rgba(59,130,246,0.6)] transition-shadow placeholder:text-center text-center h-10 text-xl text-black"} />
                        {authLoading &&
                            <div className={`absolute top-0 left-0 w-full h-full bg-gray-600 opacity-60`}>
                                &nbsp;
                            </div>
                        }
                    </div>
            </div>
        )
    }

    return (
        <div className='h-full min-h-[100vh] w-full text-simvoni flex text-center flex-col text-white bg-spacecadet '>
            <h1 className='text-4xl lg:text-6xl xl:text-8xl mt-5'>debate<span className='text-frenchskyblue'>-</span>bro<span className='text-frenchskyblue'>.com</span></h1>
            {Error &&
                <>
                    Got error from redis
                </>
            }
            {!Error &&
                <>
                    <div className={"flex flex-row space-x-2 justify-center mx-auto"}>
                        <CategoriesContainer Categories={categories} updateCategories={setCategories} />
                        <TopicsContainer Topics={topics} Categories={categories} />
                    </div>
                </>
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