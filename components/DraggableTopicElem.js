import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

export default function DraggableTopicElem({ topic, index }) {
  return (
    (<Draggable key={topic} draggableId={topic} index={index}>
      {(provided) => (
        <div {...provided.draggableProps}
             {...provided.dragHandleProps} 
             ref={provided.innerRef}
          className=' hover:cursor-pointer h-min p-2 bg-frenchskyblue m-1 
                rounded-lg'
        >
          {topic}
        </div>
      )}
    </Draggable>)
  )
}
