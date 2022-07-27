import { useEffect, useRef, useState, createContext } from 'react'
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client'
import useCall from '../hooks/useCall';
import TopicSelect from '../components/TopicSelect';

export const SocketContext = createContext();
const uuid = uuidv4()

export default function SocketTest() {
    const [socket, setSocket] = useState(null)
    const [events, setEvents] = useState([])
    const [selectedTopics, setSelectedTopics] = useState([])
    const [callConnected, ourStreamRef, theirStreamRef] = useCall(uuid, socket)

    function findOpponent() {
        socket.emit('find match', { uuid: uuid })
        setEvents(events => [...events, 'finding match...'])
    }

    useEffect(() => {
        fetch('/api/socketio').finally(() => {
            const socket = io()
            setSocket(socket)
        })
    }, [])

    useEffect(() => {
        if (socket != null) {
            socket.on('connect', () => {
                setEvents(events => [...events, 'connected'])
                socket.emit('hello')
            })

            socket.on('matched', () => {
                setEvents(ev => [...ev, 'matched!'])
            })

            socket.on('disconnect', () => {
                setEvents(events => [...events, 'Disconnected'])
            })
        }
    }, [socket])

    return (
        <>
            <div className='h-screen w-full text-simvoni flex text-center flex-col text-white bg-spacecadet '>
            <h1 className='text-8xl mt-10'><span className='text-frenchskyblue'>debate</span> app</h1>
            <div className='flex flex-col lg:flex-row mx-20 my-10 justify-evenly align-center self-center'>
                    <video muted 
                        autoPlay="true" 
                        ref={ourStreamRef} 
                        className={`border-[0.5rem] rounded-2xl object-cover border-frenchskyblue 
                        block self-center ${callConnected
                        ? `w-[32rem] h-[24rem] 
                        2xl:w-[44rem] 2xl:h-[33rem]
                        3xl:w-[56rem] 3xl:h-[42rem]`
                        : 'w-[60rem] h-[45rem]'}`}>
                    </video>

                <video autoPlay="true" 
                       ref={theirStreamRef} 
                       className={`border-[0.5rem] rounded-2xl object-cover border-frenchskyblue block self-center ${callConnected ? '' : 'hidden'} 
                        w-[32rem] h-[24rem] 
                       2xl:w-[44rem] 2xl:h-[33rem]
                       3xl:w-[56rem] 3xl:h-[42rem]`}>
                </video>
            </div>
            <p className='text-3xl font-semibold '><span className='underline'>current topic:</span> <span className=' text-yellow-500'>Veganism</span> </p>
            <div className='text-center flex-grow-0 flex-shrink-0 w-96 flex flex-col self-center'>
                    
                    <TopicSelect />
                    <div onClick={findOpponent} className='p-2 text-3xl bg-frenchskyblue block rounded-lg hover:cursor-pointer'>
                        Find Opponent
                    </div>
                    <div>
                        {events.map(elem => <p>{elem}</p>)}
                    </div>
                </div>
            </div>
        </>
    )
}