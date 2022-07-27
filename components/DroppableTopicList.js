import React from 'react'
import DraggableTopicElem from './DraggableTopicElem'
import { useDroppable } from '@dnd-kit/core'
import { Draggable } from './Draggable'


export default function DroppableTopicList({ title, droppableId, topicsList }) {
    const {isOver, setNodeRef} = useDroppable({
        id: droppableId,
      });
    
    return (
        <>
            <p className='underline text-2xl'>{title}</p>
                    <div ref={setNodeRef}
                         className='min-h-[12rem] overflow-x-clip 
                         overflow-y-auto max-h-[12rem]'>
                        <div
                            className='flex flex-wrap w-80 align-center justify-center'>
                            {topicsList.map((topic, index) =>
                                <DraggableTopicElem topic={topic} index={index} />)}
                        </div>
                    </div>
        </>
    )
}
