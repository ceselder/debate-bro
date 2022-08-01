import { useRef, useState, useEffect } from "react"
import io from 'socket.io-client'

var options = {
    'constraints': {
        'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': true
        }
    }
}

export default function useCall(uuid, socket) {
    const [connectionState, setConnectionState] = useState('disconnected')
    const [streamReady, setStreamReady] = useState(false)

    const ourUuid = uuid
    const [ourStream, setOurStream] = useState(null)
    const ourStreamRef = useRef()
    const theirStreamRef = useRef()
    const peerRef = useRef()
    const otherUser = useRef()
    const callRef = useRef()

    function requestUserMedia(params)
    {
        navigator.mediaDevices.getUserMedia(params)
        .then(stream => {
            console.log(stream)
            setOurStream(stream)
        })
    }


    useEffect(() => {
        if (socket != null && ourStream) {
            console.log('yay')

            if (!navigator || navigator === undefined || navigator.mediaDevices === undefined) {
                alert('Could not get your camera/audio... Please use a different browser!')
            }
            else {
                import('peerjs').then(({ default: Peer }) => {
                        peerRef.current = new Peer(ourUuid, {
                            config: {
                                iceServers: [
                                    {
                                        urls: ["stun:stun.debate-bro.com:5349", "stun:stun.debate-bro.com:3478"]
                                    },
                                    {
                                        urls: ["turn:turn.debate-bro.com:5349", "turn:turn.debate-bro.com:3478"],
                                        username: "turn",
                                        credential: 'nkdhynpqmsxsqk', //todo change when we move to production
                                    }]
                            }, debug: 0 //3 for full logs
                        });

                        function setTheirStream(stream) {
                            theirStreamRef.current.srcObject = stream
                            setConnectionState('connected')
                        }

                        function callUser(userId) {
                            setConnectionState('connecting')
                            callRef.current = peerRef.current.call(userId, ourStream, options)
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
                            call.answer(ourStream)
                            call.on('stream', setTheirStream)
                        })

                        ourStreamRef.current.srcObject = ourStream;
                        setStreamReady(true)

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

                    
                });
            }
        }
    }, [socket, ourStream])


    return [streamReady, requestUserMedia, connectionState, ourStreamRef, theirStreamRef]
}