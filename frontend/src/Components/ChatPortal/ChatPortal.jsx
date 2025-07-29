import React from 'react'
import UserList from './UserList'
import ChatWindow from './ChatWindow'
import UserDetail from './UserDetail'

const ChatPortal = () => {
  return (
    <div className='flex  h-screen overflow-y-auto'>
<UserList/>
<ChatWindow/>
<UserDetail/>

    </div>
  )
}

export default ChatPortal;