import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client'

export default function SocketTest() {
    const [pc, setPc] = useState()
    const [uuid, setUuid] = useState(uuidv4())
    const [events, setEvents] = useState([])
    const [matched, setMatched] = useState(false)

    const ourStream = useRef()

    const socketRef = useRef()
    const ourStreamRef = useRef()
    const theirStreamRef = useRef()
    const peerRef = useRef()
    const otherUser = useRef()

    async function findOpponent() {
        socketRef.current.emit('find match', { uuid: uuid })
        setEvents(events => [...events, 'finding match...'])
    }

    useEffect(() => {
        fetch('/api/socketio').finally(() => {
            const socket = io()
            socketRef.current = socket

            navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            }).then(stream => {
                console.log('got ur media')
                ourStream.current = stream
                ourStreamRef.current.srcObject = stream;


                socket.on('matched', (msg) => {
                    setEvents(events => [...events, JSON.stringify(msg)])
                    if (uuid == msg.parent) {
                        console.log('matched', msg)
                        otherUser.current = msg.child
                        callUser(msg.child)
                    }
                })

                socket.on("offer", (incoming) => {console.log('offerrr'); handleRecieveCall(incoming); })

                socket.on("answer", handleAnswer)

                socket.on("ice-candidate", handleNewICECandidateMsg)

            });

            socket.on('connect', () => {
                setEvents(events => [...events, 'connected'])
                socket.emit('hello')
            })

            socket.on('disconnect', () => {
                setEvents(events => [...events, 'Disconnected'])
            })
        })
    }, []) // Added [] as useEffect filter so it will be executed only once, when component is mounted

    function callUser(userID) {
        peerRef.current = createPeer(userID)
        ourStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, ourStream.current))
    }

    function createPeer(userID) {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: ["stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                        "stun:stun3.l.google.com:19302",]
                },
                {
                    urls: "turn:openrelay.metered.ca:80",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "turn:openrelay.metered.ca:443",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "turn:openrelay.metered.ca:443?transport=tcp",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
            ]
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

        return peer;
    }


    function handleNegotiationNeededEvent(userID) {
        peerRef.current.createOffer().then(offer => {
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: userID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            };
            console.log("offer emitted")
            socketRef.current.emit("offer", payload);
        }).catch(e => console.log('error', e));
    }


    function handleRecieveCall(incoming) {
        console.log("handling recieve call")
        peerRef.current = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp);
        peerRef.current.setRemoteDescription(desc).then(() => {
            ourStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, ourStream.current));
        }).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit("answer", payload);
        })
    }

    function handleAnswer(message) {
        console.log("handling answer")
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            console.log('candidate found')
            const payload = {
                target: otherUser.current,
                candidate: e.candidate,
            }
            socketRef.current.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log('error', e));
    }

    function handleTrackEvent(e) {
        console.log(e.streams)
        theirStreamRef.current.srcObject = e.streams[0];
    };


    return (
        <>
            <div className='h-full w-full flex flex-col'>
                <div className='mt-20 text-center flex flex-col self-center'>
                    <p>Socket.io ({uuid})</p>
                    <div onClick={findOpponent} className='p-2 bg-gray-500 block rounded-lg hover:cursor-pointer'>
                        Find Opponent
                    </div>
                    <div>
                        {events.map(elem => <p>{elem}</p>)}
                    </div>
                </div>
            </div>

            <div className='flex flex-row p-20 gap-20 justify-center'>
                <video muted autoPlay="true" ref={ourStreamRef} className='block min-w-[20rem] max-w-[20rem] min-h-[15rem] max-h-[15rem] bg-black'>
                </video>

                <video autoPlay="true" ref={theirStreamRef} className='block min-w-[20rem] max-w-[20rem] min-h-[15rem] max-h-[15rem] bg-black'>
                </video>
            </div>
        </>
    )
}