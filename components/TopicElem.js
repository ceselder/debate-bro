import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

export default function TopicElem({ onClick, topic }) {
  return (
    <div onClick={() => onClick(topic)} className='hover:cursor-pointer p-2 bg-frenchskyblue m-1 rounded-lg'>
        {topic} <FontAwesomeIcon icon={faXmark} />
    </div>
  )
}
