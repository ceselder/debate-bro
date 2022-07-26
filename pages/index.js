import { useEffect, useRef, useState, createContext } from 'react'
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client'
import useCall from '../hooks/useCall';

export const SocketContext = createContext();

export default function SocketTest() {
    const uuid = uuidv4()

    const [socket, setSocket] = useState(null)
    const [events, setEvents] = useState([])
    const [ourStreamRef, theirStreamRef] = useCall(uuid, socket)

    const [mediaDevicesSupported, setMediaDevicesSupported] = useState(false)

    function findOpponent() {
        socket.emit('find match', { uuid: uuid })
        setEvents(events => [...events, 'finding match...'])
    }

    useEffect(() => {
        fetch('/api/socketio').finally(() => {
            const socket = io()
            setSocket(socket)
    })}, []) // Added [] as useEffect filter so it will be executed only once, when component is mounted

    useEffect(() => {
        if (socket != null)
        {
            socket.on('connect', () => {
                setEvents(events => [...events, 'connected'])
                socket.emit('hello')
            })

            socket.on('matched', () => {
                console.log('matched!')
            })
    
            socket.on('disconnect', () => {
                setEvents(events => [...events, 'Disconnected'])
            })
        }
    }, [socket])

    return (
        <>
            <div className='h-full w-full flex flex-col'>
                <div className='mt-20 text-center flex flex-col self-center'>
                    <p>Socket.io ({uuid})</p>
                    <p>Media Devices Supported: {mediaDevicesSupported}</p>
                    <div onClick={findOpponent} className='p-2 bg-gray-500 block rounded-lg hover:cursor-pointer'>
                        Find Opponent
                    </div>
                    <div>
                        {events.map(elem => <p>{elem}</p>)}
                    </div>
                </div>
            </div>

            <div className='flex flex-row p-20 gap-20 justify-center'>
                <video muted autoPlay="true" ref={ourStreamRef} className='block min-w-[20rem] max-w-[20rem] min-h-[15rem] max-h-[15rem] bg-black'>
                </video>

                <video autoPlay="true" ref={theirStreamRef} className='block min-w-[20rem] max-w-[20rem] min-h-[15rem] max-h-[15rem] bg-black'>
                </video>
            </div>
        </>
    )
}