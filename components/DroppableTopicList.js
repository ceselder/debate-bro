import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import DraggableTopicElem from './DraggableTopicElem'

export default function DroppableTopicList({ title, droppableId, topicsList }) {
    return (
        <>
            <p className='underline text-2xl'>{title}</p>
            <Droppable direction='horizontal' droppableId={droppableId}>
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}
                        className='flex flex-row shrink-0 w-64 pb-16 h-min flex-wrap 
                                   justify-center'>
                        {topicsList.map((topic, index) =>
                            <DraggableTopicElem topic={topic} index={index} />)}
                    </div>
                )}
            </Droppable>
        </>
    )
}
