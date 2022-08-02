import { Dispatch, FC, SetStateAction, useCallback, useState } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

type CategoriesContainerProps = {
    Categories: TopicCategory[],
    updateCategories: Dispatch<SetStateAction<string[]>>
}

export const CategoriesContainer: FC<CategoriesContainerProps> = ({ Categories, updateCategories }) => {
    const [adding, setAdding] = useState<boolean>(false);
    const [newCat, setNewCat] = useState<string>("");

    const [saving, setSaving] = useState<boolean>(false);

    const handleNewCategoryInput = ({ target: { value } }) => {
        setNewCat(value);
    }

    const handleSaveClick = useCallback(async () => {
        setSaving(true);
        var res = await  axios.post("/api/redis/category", { data: newCat }, { validateStatus: () => true });
        
        //Handle response logic/failure

        //Update the categories
        var updatedCats = await axios.get("/api/redis/category");
        updateCategories(updatedCats.data);

        //Clean up
        setNewCat("");
        setAdding(false);
        setSaving(false);
    }, [newCat]);

    return (
        <div className={"text-simvoni bg-[whitesmoke] rounded-md p-2 shadow-lg flex flex-col w-1/3 relative"}>
            <button onClick={() => setAdding(!adding)} className={"bg-blue-500 hover:bg-blue-400 active:bg-blue-600 transition-all rounded-md h-10 text-center text-3xl w-full"}>
                Add Category
            </button>
            <div className={`${adding ? "h-10 mt-2" : "h-0"} transition-all flex flex-row rounded-md`}>
                <input value={newCat} onChange={handleNewCategoryInput} placeholder={"New Category"} className={`placeholder:text-center text-center text-black text-2xl placeholder:text-xl ${adding ? "opacity-100" : "opacity-0"} outline-none transition-all rounded-tl-md rounded-bl-md w-4/5 focus:shadow-[inset_0px_0px_2px_3px_rgba(59,130,246,0.6)]`} />
                <button onClick={handleSaveClick} className={`${adding ? "opacity-100" : "opacity-0"} text-3xl w-1/5 rounded-tr-md rounded-br-md bg-green-500 hover:bg-green-400 active:bg-green-600 transition-all`}>Save</button>
            </div>
            <div className={"mt-2 text-black rounded-md flex flex-row flex-wrap justify-center"}>
                {
                    Categories.map((category, index) => (
                        <div key={`${category}-${index}`} className={"m-1 select-none bg-white min-w-[15%] px-2 py-1 rounded-md shadow-md relative"}>
                            {category}
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

export default CategoriesContainerProps;