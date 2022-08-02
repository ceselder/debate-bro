import { FC, FormEvent, useCallback, useState } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

type TopicContainerProps = {
    Topics: Topic[],
    Categories: TopicCategory[],
}

export const TopicsContainer: FC<TopicContainerProps> = ({ Topics, Categories }) => {
    const [categories] = useState<TopicCategory[]>(Categories);
    const [topics, setTopics] = useState<Topic[]>(Topics);
    const [adding, setAdding] = useState<boolean>(false);
    const [newTopicName, setNewTopicName] = useState<string>("");
    const [newTopicCat, setNewTopicCat] = useState<TopicCategory>("");

    const [saving, setSaving] = useState<boolean>(false);

    const handleNewTopicNameInput = ({ target: { value } }) => {
        setNewTopicName(value);
    }

    const handleSaveClick = useCallback(async () => {
        setSaving(true);
        var res = await  axios.post("/api/redis/topic", { data: { name: newTopicName, category: newTopicCat } }, { validateStatus: () => true });
        
        //Handle response logic/failure

        //Update the categories
        var updatedTopics = await axios.get("/api/redis/topic");
        setTopics(updatedTopics.data);

        //Clean up
        setNewTopicName("");
        setAdding(false);
        setSaving(false);
    }, [newTopicName, newTopicCat]);

    return (
        <div className={"text-simvoni bg-[whitesmoke] rounded-md p-2 shadow-lg flex flex-col w-1/3 relative"}>
            <button onClick={() => setAdding(!adding)} className={"bg-blue-500 hover:bg-blue-400 active:bg-blue-600 transition-all rounded-md h-10 text-center text-3xl w-full"}>
                Add Topic
            </button>
            <div className={`${adding ? "h-10 mt-2" : "h-0"} transition-all flex flex-row rounded-md`}>
                <input value={newTopicName} onChange={handleNewTopicNameInput} placeholder={"New Topic Name"} className={`placeholder:text-center text-center text-black text-2xl placeholder:text-xl ${adding ? "opacity-100" : "opacity-0"} outline-none transition-all rounded-tl-md rounded-bl-md w-3/5 focus:shadow-[inset_0px_0px_2px_3px_rgba(59,130,246,0.6)]`} />
                <select onChange={(event: FormEvent<HTMLSelectElement>) => { setNewTopicCat(event.currentTarget.value) }} value={newTopicCat} className={`truncate text-black outline-none ${adding ? "opacity-100" : "opacity-0"} text-lg w-1/5`}>
                    <option>Category</option>
                    {
                        Categories.map((category, index) => (
                            <option key={`select-option-${category}-${index}`} value={category}>{category}</option>
                        ))
                    }
                </select>
                <button onClick={handleSaveClick} className={`${adding ? "opacity-100" : "opacity-0"} text-3xl w-1/5 rounded-tr-md rounded-br-md bg-green-500 hover:bg-green-400 active:bg-green-600 transition-all`}>Save</button>
            </div>
            <div className={"mt-2 text-black rounded-md flex flex-row flex-wrap justify-center"}>
                {
                    topics.map(({ name, category }, index) => (
                        <div key={`${name}-${index}`} className={"m-1 select-none bg-white h-10 min-w-[15%] px-2 py-[.6rem] rounded-md shadow-md relative"}>
                            {name}
                            <div className={"absolute top-0 right-1 text-xs text-gray-400"}>
                                {category}
                            </div>
                        </div>
                    ))
                }
            </div>
            {saving &&
                <div className={`absolute top-0 left-0 w-full h-full flex bg-gray-600 opacity-60`}>
                    <FaSpinner className={"m-auto text-3xl animate-spin"} />
                </div>
            }
        </div>
    );
}

export default TopicsContainer;