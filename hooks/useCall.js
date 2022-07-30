import { useRef, useState, useEffect } from "react"
import io from 'socket.io-client'



export default function useCall(uuid, socket,) {
    const [callConnected, setCallConnected] = useState(false)
    const [mediaDevicesSupported, setMediaDevicesSupported] = useState()
    const ourUuid = uuid
    const ourStream = useRef()
    const ourStreamRef = useRef()
    const theirStreamRef = useRef()
    const peerRef = useRef()
    const otherUser = useRef()

    useEffect(() => {
        if (socket != null) {
            console.log('call connection established')

            if (!navigator || navigator === undefined || navigator.mediaDevices === undefined) {
                console.log('navigator issue')
                //setEvents(events => [...events, 'media devices undefined!'])
                setMediaDevicesSupported(false)
            }
            else {
                import('peerjs').then(({ default: Peer }) => {
                    navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true,
                    }).then(stream => {
                        console.log("own stun server")
                        setMediaDevicesSupported(true)
                        peerRef.current = new Peer(ourUuid, {iceServers: [{
                            urls: [ "stun:fr-turn1.xirsys.com" ]
                         }, {
                            username: "x36BhiWgWHjYGjwnHIrQMxxnHYQ7OMrw6K0aGYGMSVuGgBNNTlNXkqWJqOk_6AqDAAAAAGLj7XVjb29sZXN0cm9nZW4=",
                            credential: "107cde88-0f4a-11ed-b61b-0242ac120004",
                            urls: [
                                "turn:fr-turn1.xirsys.com:80?transport=udp",
                                "turn:fr-turn1.xirsys.com:3478?transport=udp",
                                "turn:fr-turn1.xirsys.com:80?transport=tcp",
                                "turn:fr-turn1.xirsys.com:3478?transport=tcp",
                                "turns:fr-turn1.xirsys.com:443?transport=tcp",
                                "turns:fr-turn1.xirsys.com:5349?transport=tcp"
                            ]
                         }],  debug: 3});

                        function callUser(userId) {
                            setCallConnected(true)
                            const call = peerRef.current.call(userId, ourStream.current)
                            call.on('stream', userVideoStream => {
                                theirStreamRef.current.srcObject = userVideoStream
                            })
                            call.on('close', () => {
                                console.log('closed')
                            })
                          
                            //peers[userId] = call
                          }


                        peerRef.current.on('call', call => {
                            setCallConnected(true)
                            call.answer(ourStream.current)
                            call.on('stream', userVideoStream => {
                                theirStreamRef.current.srcObject = userVideoStream
                            })
                          })
                        

                        console.log('got ur media')
                        ourStream.current = stream
                        ourStreamRef.current.srcObject = stream;

                        socket.on('matched', (msg) => {
                            if (ourUuid == msg.parent) {
                                console.log('matched', msg)
                                otherUser.current = msg.child
                                callUser(msg.child)
                            }
                        })

                    });
                });
            }
        }
    }, [socket])


    return [callConnected, ourStreamRef, theirStreamRef]
}