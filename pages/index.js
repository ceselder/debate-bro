import { useEffect, useRef, useState, createContext } from 'react'
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client'
import useCall from '../hooks/useCall';
import TopicSelect from '../components/TopicSelect';
import Button from '../components/Button';
import useLocalStorage from '../hooks/useLocalStorage';
import { CreateRedisClient } from "./../lib/redis";

export const SocketContext = createContext();
const uuid = uuidv4()

const allTopics = [
    //economic issues
    'Keynesian Economics', 'Austrian Economics', 'Anarcho-Capitalism',
    'Anarcho-Communism', 'Right Libertarianism', 
    'Communism', 'Socialism', 'Neoliberalism', 'Privatized Healthcare', 
    'UBI', 'MMT', '"Taxation Is Theft"', 'Reformism',
    'Unions', 'Crypto',

    //other issues
    'Veganism', 'Abortion', 'Gun Control', 'Religion', 
    'Immigration', 'Transgenderism', 'Feminism', 'Democracy', 
    'Isolationism', 'Political Violence' ]

export const topicContext = createContext()

const checkForNewTopics = (excluded, existing, fromDb) => {
  const finalList = [ ...existing ];
  const arrayToLookUp = existing.concat(excluded);
  for (let dbTopic of fromDb) {
    if (!arrayToLookUp.some(x => x.name === dbTopic.name)) 
      finalList.push(dbTopic);
  }
  return finalList;
}

export default function App({ Topics, Categories }) {
    const [socket, setSocket] = useState(null)
    const [ streamReady,
            requestUserMedia,
            connectionState, 
            ourStreamRef, 
            theirStreamRef] = useCall(uuid, socket)


    const [categories] = useState(Categories);
    const [topics] = useState(Topics);
    
    const [availableTopics, setAvailableTopics] = useLocalStorage('availableTopics', topics)
    const [defendTopics, setDefendTopics] = useLocalStorage('defendTopics', [])
    const [attackTopics, setAttackTopics] = useLocalStorage('attackTopics', [])

    const [onlineUsers, setOnlineUsers] = useState(0)

    const [isDragging, setIsDragging] = useState()
    const [isSearching, setIsSearching] = useState(false)

    const [isMatched, setIsMatched] = useState(false)
    const [matchedTopic, setMatchedTopic] = useState('...')

    function cycleTopic(topics, topic)
    {
        const returnTopics = [...topics]
            for (let i = 0; i < returnTopics.length; i++)
            {
                if (returnTopics[i] === topic)
                {
                    returnTopics.splice(i,1)
                    returnTopics.push(topic)
                    break;
                }
            }
        return returnTopics
    }

    function cycleTopics(topic)
    {
        setDefendTopics(topics => cycleTopic(topics, topic))
        setAttackTopics(topics => cycleTopic(topics, topic))
    }

    function findOpponent() {
        setIsSearching(oldSearching => {
            const newSearching = !oldSearching
            if (newSearching === true) {
                socket.emit('find match', {
                    uuid: uuid,
                    attackTopics: attackTopics,
                    defendTopics: defendTopics
                })
            }
            else
            {
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
                socket.emit('hello')
            })

            socket.on('matched', (payload) => {
                setIsSearching(false)
                setIsMatched(true)
                setMatchedTopic(payload.topic)
                cycleTopics(payload.topic)
            })

            socket.on('call ended', () => {
                setIsMatched(false)
            })
            
            socket.on('online users', ({ onlineUsers} ) => {
                setOnlineUsers(onlineUsers)
            })
        }
    }, [socket])

    //Due to the way saved topics are loaded from localStorage, this dirty side effect is used to check for new
    //topics that were created and add them to the list if a user already has a list of saved topics in localStorage
    useEffect(() => {
        let put = checkForNewTopics([...defendTopics, ...attackTopics], [...availableTopics], [...topics]);
        setAvailableTopics(put);
    }, []);

    return (
        <>

            <div className='h-full min-h-[100vh] w-full text-simvoni flex text-center flex-col text-white bg-spacecadet '>
                <h1 className='text-4xl lg:text-6xl xl:text-8xl mt-5'>debate<span className='text-frenchskyblue'>-</span>bro<span className='text-frenchskyblue'>.com</span></h1>
                <h3>AUDIO ONLY IS FIXED!</h3>
                <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 mx-20 my-5 justify-evenly align-center self-center'>
                    <video muted
                        autoPlay={true}
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

                    <video autoPlay={true}
                        ref={theirStreamRef}
                        className={`aspect-[4/3] border-[0.5rem] rounded-2xl object-cover border-frenchskyblue flex shrink-0 self-center 
                        ${(connectionState === 'connected') ? '' : 'hidden'} 
                          w-[32rem] 2xl:w-[44rem] 3xl:w-[56rem]`}>
                    </video>
                </div>
                {(!streamReady) && <div className='justify-center flex flex-row gap-10 mb-20'>
                            <Button onClick={() => requestUserMedia({ audio: true })} 
                                src='/img/microphone.svg'
                                text='Audio Only'
                                color='bg-frenchskyblue'
                            />
                            <Button onClick={() => requestUserMedia({ audio: true, video: true })} 
                                src='/img/video.svg'
                                text='Video and Audio'
                                color='bg-frenchskyblue'
                            />
                </div>}
                {isMatched &&
                    (<p className='text-3xl font-semibold '><span className='underline'>current topic:</span> <span className=' text-yellow-400'>{matchedTopic}</span> </p>)}
                {(streamReady) &&  <div className='flex flex-col text-center self-center'>
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
                </div>}
                {(onlineUsers > 5) && <div className='mt-2 text-lg'>
                    <span className='text-green-400'>{onlineUsers}</span> users online!
                </div>}
                <div className='flex flex-row gap-2 mr-2 mt-2 fixed right-0 top-0'>
                    <img onClick={() => window.open('https://github.com/celestrogen/debate-bro')} className='p-2 opacity-80 hover:opacity-100 hover:cursor-pointer rounded-lg bg-frenchskyblue w-10 h-10' src='img/github.svg' alt="github"/>
                    <img onClick={() => window.open('https://twitter.com/coolestrogen')} className='p-2 opacity-80 hover:opacity-100 hover:cursor-pointer rounded-lg bg-frenchskyblue w-10 h-10' src='img/twitter.svg' alt="twitter" />
                </div>
            </div>

        </>
    )
}

export const getStaticProps = async (context) => {
    const redis = CreateRedisClient();

    try {
        await redis.connect();

        let categories = await redis.LRANGE("debatebro:categories", 0, -1);
        let topicsStringArray = await redis.LRANGE("debatebro:topics", 0, -1);
        let topics= topicsStringArray.map(json => JSON.parse(json));
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