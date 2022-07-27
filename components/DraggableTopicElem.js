import React from 'react'
import { useDraggable } from '@dnd-kit/core';
import { Draggable } from './Draggable';

export default function DraggableTopicElem({ topic, index, children }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: topic,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
        <div  ref={setNodeRef} style={style} {...listeners} {...attributes}
          className=' hover:cursor-pointer h-min p-2 bg-frenchskyblue m-1 
                rounded-lg'
        >
          {topic}
        </div>

  )
}
