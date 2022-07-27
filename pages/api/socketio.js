import { Server } from 'socket.io'

const matchMakingMap = new Map();

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
            socket.on('find match', ({ uuid, defendTopics, attackTopics }) => {
                socket.join(uuid)
                let matchFound = false

                for (const [key, value] of matchMakingMap) {
                    if (key !== uuid) {
                        const matchedTopic = lookForMatch(defendTopics, value.attackTopics)
                                           || lookForMatch(attackTopics, value.defendTopics)
                        
                        if (!matchedTopic)
                        {
                            continue;
                        }

                        matchMakingMap.delete(key)
                        console.log(`found match ${key}`)

                        const payload = {parent: key, child: uuid, topic: matchedTopic}

                        socket.emit('matched', payload)
                        io.in(key).emit('matched', payload)

                        matchFound = true
                        break;
                    }
                }

                socket.on('offer', payload => {
                    console.log(`sending offer to ${payload.target}`)
                    io.to(payload.target).emit("offer", payload)
                })

                socket.on("answer", payload => {
                    io.to(payload.target).emit("answer", payload)
                })

                socket.on('ice-candidate', incoming => {
                    io.to(incoming.target).emit("ice-candidate", incoming.candidate)
                })

                if (!matchFound) {
                    matchMakingMap.set(uuid, { defendTopics: defendTopics, attackTopics: attackTopics })
                }

                socket.once('disconnect', function () {
                    socket.leave(uuid)
                    matchMakingMap.delete(uuid)
                });

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