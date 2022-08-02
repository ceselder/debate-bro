import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { topicContext } from '../pages';

function getStyle(style, snapshot) {
  if (!snapshot.isDropAnimating) {
    return style;
  }
  return {
    ...style,
    // cannot be 0, but make it super tiny
    transitionDuration: `0.001s`,
  };
}

export default function DraggableTopicElem({ topic, index }) {
  const [connectionState, isSearching] = useContext(topicContext)

  return (
    (<Draggable isDragDisabled={(connectionState !== 'disconnected' || isSearching)} draggableId={topic.name} index={index}>
      {(provided, snapshot) => (
        <div {...provided.draggableProps}
             {...provided.dragHandleProps} 
             ref={provided.innerRef}
             style={getStyle(provided.draggableProps.style, snapshot)}
          className='select-none hover:cursor-pointer h-min p-2 bg-frenchskyblue m-1 
                rounded-lg'
        >
          {topic.name}
        </div>
      )}
    </Draggable>)
  )
}
