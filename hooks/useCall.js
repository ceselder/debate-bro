import { useRef, useState, useEffect } from "react"
import io from 'socket.io-client'



export default function useCall(uuid, socket,) {
    const [callConnected, setCallConnected] = useState(false)
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
                //setMediaDevicesSupported(true)
            }
            else {
                import('peerjs').then(({ default: Peer }) => {
                    navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true,
                    }).then(stream => {
                        //setMediaDevicesSupported(true)
                        peerRef.current = new Peer();

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