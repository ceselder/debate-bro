import { useRef, useState, useEffect } from "react"
import io from 'socket.io-client'



export default function useCall(uuid, socket,) {
    const [connectionState, setConnectionState] = useState('disconnected')
    const ourUuid = uuid
    const ourStream = useRef()
    const ourStreamRef = useRef()
    const theirStreamRef = useRef()
    const peerRef = useRef()
    const otherUser = useRef()
    const callRef = useRef()



    useEffect(() => {
        if (socket != null) {

            if (!navigator || navigator === undefined || navigator.mediaDevices === undefined) {
                alert('Could not get your camera/audio... Please use a different browser!')
            }
            else {
                import('peerjs').then(({ default: Peer }) => {

                    function initStream(stream) {
                        peerRef.current = new Peer(ourUuid, {
                            config: {
                                iceServers: [
                                    {
                                        urls: ["stun:stun.debate-bro.com:5349", "stun:stun.debate-bro.com:3478"]
                                    },
                                    {
                                        urls: ["turn:turn.debate-bro.com:5349", "turn:turn.debate-bro.com:3478"],
                                        username: "turn",
                                        credential: process.env.TURN_PASS, //todo change when we move to production
                                    }]
                            }, debug: 0 //3 for full logs
                        });

                        function setTheirStream(stream) {
                            theirStreamRef.current.srcObject = stream
                            setConnectionState('connected')
                        }

                        function callUser(userId) {
                            setConnectionState('connecting')
                            callRef.current = peerRef.current.call(userId, ourStream.current)
                            callRef.current.on('stream', setTheirStream)
                            /*call.on('close', () => {
                                setConnectionState('disconnected')
                                console.log('connection closed')
                            })*/
                            //currently not working 
                        }


                        peerRef.current.on('call', call => {
                            callRef.current = call
                            setConnectionState('connected')
                            call.answer(ourStream.current)
                            call.on('stream', setTheirStream)
                        })


                        ourStream.current = stream
                        ourStreamRef.current.srcObject = stream;

                        socket.on('matched', (msg) => {
                            if (ourUuid == msg.parent) {
                                otherUser.current = msg.child
                                callUser(msg.child)
                            }
                        })

                        socket.on('call ended', () => {
                            setConnectionState('disconnected')
                            callRef.current.close()
                        })
                    }

                    navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true,
                    }).then(stream => {
                        initStream(stream)
                    })
                });
            }
        }
    }, [socket])


    return [connectionState, ourStreamRef, theirStreamRef]
}