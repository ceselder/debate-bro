import React from 'react'

export default function Button({ onClick, text, src, color }) {
    return (
        <div onClick={onClick} className={`
                        justify-center ${color}
                        opacity-80 hover:opacity-100
                        self-center w-fit p-4 text-3xl select-none rounded-lg hover:cursor-pointer`}>
            <img className='inline-block w-8 mr-2' src={src} />
            {text}
        </div>
    )
}
