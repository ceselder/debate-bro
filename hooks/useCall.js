import { useRef, useEffect } from "react"
import io from 'socket.io-client'

export default function useCall(uuid, socket)
{
    const ourUuid = uuid
    const ourStream = useRef()
    const ourStreamRef = useRef()
    const theirStreamRef = useRef()
    const peerRef = useRef()
    const otherUser = useRef()

    useEffect(() => {
        if (socket != null)
        {
            console.log('call connection established')

            if (navigator === undefined || navigator.mediaDevices === undefined)
            {
                //setEvents(events => [...events, 'media devices undefined!'])
                //setMediaDevicesSupported(true)
            }
            else
            {
                navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                }).then(stream => {
                    //setMediaDevicesSupported(true)
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
        
                    socket.on("offer", (incoming) => {console.log('offerrr'); handleRecieveCall(incoming); })
        
                    socket.on("answer", handleAnswer)
        
                    socket.on("ice-candidate", handleNewICECandidateMsg)
    
                });
            }
        }
        }, [socket])

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
                {
                    url: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=udp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    url: 'turn:turn.bistri.com:80',
                    credential: 'homeo',
                    username: 'homeo'
                 },
                 {
                    url: 'turn:turn.anyfirewall.com:443?transport=tcp',
                    credential: 'webrtc',
                    username: 'webrtc'
                }
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
                caller: socket.id,
                sdp: peerRef.current.localDescription
            };
            console.log("offer emitted")
            socket.emit("offer", payload);
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
                caller: socket.id,
                sdp: peerRef.current.localDescription
            }
            socket.emit("answer", payload);
        })
    }

    function handleAnswer(message) {
        console.log("handling answer")
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            console.log('sending ice candidate...')
            const payload = {
                target: otherUser.current,
                candidate: e.candidate,
            }
            socket.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        console.log('recieving ice candidate')
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log('error', e));
    }

    function handleTrackEvent(e) {
        console.log(e.streams)
        theirStreamRef.current.srcObject = e.streams[0];
    };

    return [ourStreamRef, theirStreamRef]
}