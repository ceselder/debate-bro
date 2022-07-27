import { useEffect, useRef, useState, createContext } from 'react'
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client'
import useCall from '../hooks/useCall';
import TopicSelect from '../components/TopicSelect';

export const SocketContext = createContext();
const uuid = uuidv4()

const allTopics = ['Veganism', 'Abortion', 'Communism', 
'Capitalism', 'Religion', 'Republicans',
'Social Democracy', 'Socialism', 'Racism'
, 'Immigration', 'CRT', 'BLM']

export const topicContext = createContext() 

export default function SocketTest() {
    const [socket, setSocket] = useState(null)
    const [events, setEvents] = useState([])
    const [callConnected, ourStreamRef, theirStreamRef] = useCall(uuid, socket)

    const [availableTopics, setAvailableTopics] = useState(allTopics)
    const [defendTopics, setDefendTopics] = useState([])
    const [attackTopics, setAttackTopics] = useState([])
    const [isDragging, setIsDragging] = useState()
    const [isSearching, setIsSearching] = useState(false)

    const [isMatched, setIsMatched] = useState(false)
    const [matchedTopic, setMatchedTopic] = useState('...')
    

    function findOpponent() {
        setIsSearching(oldSearching => 
            {
                const newSearching = !oldSearching
                if (newSearching === true)
                {
                    socket.emit('find match', { uuid: uuid, 
                                                attackTopics: attackTopics, 
                                                defendTopics: defendTopics })
                    setEvents(events => [...events, 'finding match...'])
                }
                return newSearching
            })
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

            socket.on('matched', (payload) => {
                setIsSearching(false)
                setIsMatched(true)
                setMatchedTopic(payload.topic)
                setEvents(ev => [...ev, `matched on ${payload.topic}!`])
            })

            socket.on('disconnect', () => {
                setEvents(events => [...events, 'Disconnected'])
            })
        }
    }, [socket])

    return (
        <>
        <topicContext.Provider value={[[availableTopics, setAvailableTopics], [defendTopics, setDefendTopics], [attackTopics, setAttackTopics], [isDragging, setIsDragging]]}>
        <div className='h-full min-h-[100vh] w-full text-simvoni flex text-center flex-col text-white bg-spacecadet '>
            <h1 className='text-4xl lg:text-6xl xl:text-8xl mt-5'>debate<span className='text-frenchskyblue'>-</span>bro<span className='text-frenchskyblue'>.com</span></h1>
            <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 mx-20 my-5 justify-evenly align-center self-center'>
                    <video muted 
                        autoPlay="true" 
                        ref={ourStreamRef} 
                        className={`aspect-[4/3] border-[0.5rem] rounded-2xl object-cover border-frenchskyblue 
                        flex self-center ${callConnected
                        ? `w-[32rem] h-[24rem] 
                        2xl:w-[44rem] 2xl:h-[33rem]
                        3xl:w-[56rem] 3xl:h-[42rem]`
                        : 'w-[44rem] '}`}>
                    </video>

                <video autoPlay="true" 
                       ref={theirStreamRef} 
                       className={`border-[0.5rem] rounded-2xl object-cover border-frenchskyblue block self-center ${callConnected ? '' : 'hidden'} 
                        w-[32rem] h-[24rem] 
                       2xl:w-[44rem] 2xl:h-[33rem]
                       3xl:w-[56rem] 3xl:h-[42rem]`}>
                </video>
            </div>
            {(isMatched) && 
            <p className='text-3xl font-semibold '><span className='underline'>current topic:</span> <span className=' text-yellow-400'>{matchedTopic}</span> </p>}
            
            <div className='flex flex-col text-center self-center'>
                    <div className='min-h-64'>
                        <TopicSelect />
                    </div>
                    
                    <div onClick={findOpponent} className={`justify-center mt-5 
                    ${isSearching ? 'bg-yellow-400' : 'bg-bluegray'}
                     self-center  w-fit p-4 text-3xl select-none rounded-lg hover:cursor-pointer`}>
                        <img className={`${isSearching ? '' : 'hidden'} inline-block w-8 mr-2`} src='/img/ball-triangle.svg' />
                        {isSearching ? 'Searching for opponent...' : 'Find Opponent!'}
                    </div>
                    <div>
                        {events.map(elem => <p>{elem}</p>)}
                    </div>
                </div>
            </div>
        </topicContext.Provider>
        
        </>
    )
}