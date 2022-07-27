import React, {useState} from 'react'
import TopicElem from './TopicElem'
import { v4 as uuidv4 } from 'uuid'

const allTopics = ['Veganism', 'Abortion', 'Communism', 'weed', 'penis']

export default function TopicSelect({  }) {
  const [availableTopics, setAvailableTopics] = useState(allTopics)
  const [selectedTopics, setSelectedTopics] = useState([])
  
  function addTopic(topic)
  {
    setAvailableTopics(old => old.filter(elem => elem !== topic))
    setSelectedTopics(old => [...old, topic])
  }

  function removeTopic(topic)
  {
    setSelectedTopics(old => old.filter(elem => elem !== topic))
    setAvailableTopics(old => [...old, topic])
  }

  return (
    <>
    <div className='flex flex-col my-4 text-center'>
      <p className='underline text-2xl'>Topics</p>
      <div className='flex flex-wrap flex-row justify-center'>
        {availableTopics.map(topic => <TopicElem onClick={addTopic} key={topic} topic={topic} />)}
      </div>
    <div className='flex flex-col my-4 text-center'>
    <p className='underline text-2xl'>Selected Topics</p>
    <div className='flex flex-wrap flex-row justify-center'>
      {selectedTopics.map(topic => <TopicElem onClick={removeTopic} key={topic} topic={topic} />)}
    </div>
    </div>
    </div>
    </>

    
  )
}
