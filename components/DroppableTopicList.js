import React, { useState } from 'react'
import { Droppable } from 'react-beautiful-dnd'
import DraggableTopicElem from './DraggableTopicElem'

export default function DroppableTopicList({ isDragging, title, droppableId, topicsList }) {
    return (
        <>
            <p className='underline text-2xl'>{title}</p>
            <Droppable ignoreContainerClipping={true} direction='grid' droppableId={droppableId}>
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} 
                         className={`${isDragging ? 'border-frenchskyblue' : 'border-transparent'} rounded-xl 
                         border-2 border-dotted min-h-[12rem] max-h-[12rem] p-2 select-none 
                         overflow-x-clip overflow-y-auto `}>
                        <div
                            className='flex flex-wrap w-24 md:w-52 lg:w-72 xl:w-80 align-center justify-center'>
                            {topicsList.map((topic, index) =>
                                <DraggableTopicElem topic={topic} index={index} />)}
                        </div>
                    </div>
                )}
            </Droppable>
        </>
    )
}
