import { useEffect, useRef, useState, createContext } from 'react'
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client'
import useCall from '../hooks/useCall';
import TopicSelect from '../components/TopicSelect';
import Button from '../components/Button';

export const SocketContext = createContext();
const uuid = uuidv4()

const allTopics = ['Veganism', 'Abortion', 'Communism',
    'Capitalism', 'Religion', 'Republicans',
    'Social Democracy', 'Socialism', 'Racism'
    , 'Immigration', 'CRT', 'BLM']

export const topicContext = createContext()

export default function App() {
    const [socket, setSocket] = useState(null)
    const [events, setEvents] = useState([])
    const [connectionState, ourStreamRef, theirStreamRef] = useCall(uuid, socket)

    const [availableTopics, setAvailableTopics] = useState(allTopics)
    const [defendTopics, setDefendTopics] = useState([])
    const [attackTopics, setAttackTopics] = useState([])
    const [isDragging, setIsDragging] = useState()
    const [isSearching, setIsSearching] = useState(false)

    const [isMatched, setIsMatched] = useState(false)
    const [matchedTopic, setMatchedTopic] = useState('...')

    function findOpponent() {
        setIsSearching(oldSearching => {
            const newSearching = !oldSearching
            if (newSearching === true) {
                socket.emit('find match', {
                    uuid: uuid,
                    attackTopics: attackTopics,
                    defendTopics: defendTopics
                })
                setEvents(events => [...events, 'finding match...'])
            }
            else
            {
                console.log('cancelling search')
                socket.emit('cancel search')
            }
            return newSearching
        })
    }

    function endCall() {
        socket.emit('end call');
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

            <div className='h-full min-h-[100vh] w-full text-simvoni flex text-center flex-col text-white bg-spacecadet '>
                <h1 className='text-4xl lg:text-6xl xl:text-8xl mt-5'>debate<span className='text-frenchskyblue'>-</span>bro<span className='text-frenchskyblue'>.com</span></h1>
                <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 mx-20 my-5 justify-evenly align-center self-center'>
                    <video muted
                        autoPlay="true"
                        ref={ourStreamRef}
                        className={`aspect-[4/3] border-[0.5rem] rounded-2xl object-cover border-frenchskyblue 
                        flex self-center ${(connectionState !== 'disconnected')
                                ? `w-[32rem] 2xl:w-[44rem] 3xl:w-[56rem]`
                                : 'w-[44rem] '}`}>
                    </video>

                    <div className={`aspect-[4/3] border-[0.5rem] rounded-2xl object-cover border-frenchskyblue flex shrink-0
                        ${(connectionState === 'connecting') ? '' : 'hidden'} 
                        w-[32rem] 2xl:w-[44rem] 3xl:w-[56rem]`}>
                        <img src='/img/three-dots.svg' className='block w-1/6 m-auto' />
                    </div>

                    <video autoPlay="true"
                        ref={theirStreamRef}
                        className={`aspect-[4/3] border-[0.5rem] rounded-2xl object-cover border-frenchskyblue flex shrink-0 self-center 
                        ${(connectionState === 'connected') ? '' : 'hidden'} 
                          w-[32rem] 2xl:w-[44rem] 3xl:w-[56rem]`}>
                    </video>
                </div>
                {isMatched &&
                    (<p className='text-3xl font-semibold '><span className='underline'>current topic:</span> <span className=' text-yellow-400'>{matchedTopic}</span> </p>)}
                <div className='flex flex-col text-center self-center'>
                    <div className='min-h-64'>
                        <topicContext.Provider value={[
                        connectionState, 
                        isSearching,
                        [availableTopics, setAvailableTopics],
                        [defendTopics, setDefendTopics],
                        [attackTopics, setAttackTopics],
                        [isDragging, setIsDragging]]}>
                            <TopicSelect />
                        </topicContext.Provider>
                    </div>
                    {(connectionState === 'disconnected') && 
                    <div onClick={findOpponent} className={`justify-center mt-5 
                     ${isSearching ? 'bg-yellow-400' : 'bg-bluegray'}
                     self-center  w-fit p-4 text-3xl select-none rounded-lg hover:cursor-pointer`}>
                        <img className={`${isSearching ? '' : 'hidden'} inline-block w-8 mr-2`} src='/img/ball-triangle.svg' />
                        {isSearching ? 'Searching for opponent...' : 'Find Opponent!'}
                    </div>}

                    {(connectionState !== 'disconnected') &&
                        <div className='flex flex-col xl:flex-row gap-2 justify-center'>
                            <Button onClick={endCall} 
                                src='/img/old-telephone.svg' 
                                text='End Call'
                                color='bg-red-600'
                            />
                            <Button onClick={endCall} 
                                src='/img/warning.svg' 
                                text='Report'
                                color='bg-yellow-500'
                            />
                            <Button onClick={() => { endCall(); findOpponent(); }} 
                                src='/img/skip.svg'
                                text='Next Opponent'
                                color='bg-green-500'
                            />
                        </div>
                    }

                    <div>
                        {events.map(elem => <p>{elem}</p>)}
                    </div>
                </div>
            </div>

        </>
    )
}