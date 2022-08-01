import { Server } from 'socket.io'

const matchMakingMap = new Map();
const ongoingCallsMap = new Map();
//todo use mongo so I can host on vercl

function lookForMatch(defendTopics, attackTopics)
{
    for (const defendTopic of defendTopics)
    {
        if (attackTopics.includes(defendTopic))
        {
            return defendTopic
        }
    }
    return null
}


const ioHandler = (req, res) => {
    if (!res.socket.server.io) {
        console.log('*First use, starting socket.io')

        const io = new Server(res.socket.server)

        io.on('connection', socket => {
            socket.emit('online users', { onlineUsers: io.engine.clientsCount} )
            socket.on('find match', ({ uuid, defendTopics, attackTopics }) => {
                socket.join(uuid)
                let matchFound = false

                const endCall = () => {
                    io.in(uuid).emit('call ended')
                    if (ongoingCallsMap.has(uuid))
                    {
                        const other = ongoingCallsMap.get(uuid)
                        io.in(other).emit('call ended')
                        matchMakingMap.delete(uuid)
                        ongoingCallsMap.delete(other)
                        ongoingCallsMap.delete(uuid)
                    }
                }

                socket.on('end call', endCall)

                socket.on('disconnecting', endCall)

                socket.on('disconnected', endCall )

                for (const [key, value] of matchMakingMap) {
                    if (key !== uuid) {
                        const matchedTopic = lookForMatch(defendTopics, value.attackTopics)
                                           || lookForMatch(attackTopics, value.defendTopics)
                        
                        if (!matchedTopic)
                        {
                            continue;
                        }

                        matchMakingMap.delete(key)

                        const payload = {parent: key, child: uuid, topic: matchedTopic}

                        socket.on('cancel search', () => 
                        {
                            matchMakingMap.delete(uuid)
                        })

                        socket.emit('matched', payload)
                        io.in(key).emit('matched', payload)
                        ongoingCallsMap.set(key, uuid)
                        ongoingCallsMap.set(uuid, key)

                        matchFound = true
                        break;
                    }
                }

                if (!matchFound) {
                    matchMakingMap.set(uuid, { defendTopics: defendTopics, attackTopics: attackTopics })
                }


            })
        })

        res.socket.server.io = io
    } else {
        console.log('socket.io already running')
    }
    res.end()
}

export const config = {
    api: {
        bodyParser: false
    }
}

export default ioHandler