import { useEffect, useState } from "react"


export default function useLocalStorage(key, initialValue) {
    if (typeof window === 'undefined') //nextjs ssr
    {
        return [[], () => (null)]
        //incredibly bad practice
    }


    const [value, setValue] = useState(() => {
        const jsonValue = localStorage.getItem(key)
        if (jsonValue != null) return JSON.parse(jsonValue)
        return initialValue
    })


        useEffect(() => {
            localStorage.setItem(key, JSON.stringify(value))
        
        }, [key, value])

    return [value, setValue]
}

//credits: web dev simplified