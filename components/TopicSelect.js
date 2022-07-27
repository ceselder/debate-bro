import React, { useState } from 'react'
import DroppableTopicList from './DroppableTopicList'
import { DndContext }  from '@dnd-kit/core'


const allTopics = ['Veganism', 'Abortion', 'Communism', 
                   'Capitalism', 'Religion', 'Republicans',
                   'Social Democracy', 'Socialism', 'Racism'
                  , 'Immigration', 'CRT', 'BLM']

export default function TopicSelect({ }) {
  const [availableTopics, setAvailableTopics] = useState(allTopics)
  const [defendTopics, setDefendTopics] = useState([])
  const [attackTopics, setAttackTopics] = useState([])

  const droppableIdToArrayDict =
  {
    'attackTopics': [attackTopics, setAttackTopics],
    'defendTopics': [defendTopics, setDefendTopics],
    'availableTopics': [availableTopics, setAvailableTopics]
  }

  function handleDragEnd({ source, destination }) {
    if (!destination) {
      return;
    }
    console.log(source, destination)

    const [sourceArray, setSourceArray] = droppableIdToArrayDict[source.droppableId]
    const [destArray, setDestArray] = droppableIdToArrayDict[destination.droppableId]
    const elem = sourceArray[source.index]

    setSourceArray(oldArray => {
      const array = [...oldArray]
      array.splice(source.index, 1)
      return array
    })
    setDestArray(oldArray => {
      const array = [...oldArray]
      array.splice(destination.index, 0, elem)
      return array
    }
    )
  }

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        <div className='flex flex-row justify-between gap-10 my-4 text-center'>
          <div className='flex flex-col'>
            <DroppableTopicList title={'Defend Topics'} droppableId={'defendTopics'} topicsList={defendTopics} />
          </div>
          <div className='flex flex-col '>
            <DroppableTopicList title={'Available Topics'} droppableId={'availableTopics'} topicsList={availableTopics} />
          </div>

          <div className='flex flex-col'>
              <DroppableTopicList title={'Attack Topics'} droppableId={'attackTopics'} topicsList={attackTopics} />
          </div>
        </div>
      </DndContext>
    </>


  )
}
