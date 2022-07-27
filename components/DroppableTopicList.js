import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import DraggableTopicElem from './DraggableTopicElem'

export default function DroppableTopicList({ title, droppableId, topicsList }) {
    return (
        <>
            <p className='underline text-2xl'>{title}</p>
            <Droppable ignoreContainerClipping={true} direction='grid' droppableId={droppableId}>
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} 
                         className='min-h-[12rem] select-none overflow-x-clip overflow-y-auto max-h-[12rem]'>
                        <div
                            className='flex flex-wrap w-24 md:w-48 lg:w-64 xl:w-80 align-center justify-center'>
                            {topicsList.map((topic, index) =>
                                <DraggableTopicElem topic={topic} index={index} />)}
                        </div>
                    </div>
                )}
            </Droppable>
        </>
    )
}
