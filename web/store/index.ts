/* If you have some middlewares then replace 
StateCreator<MyState, [], [], MySlice> with 
StateCreator<MyState, Mutators, [], MySlice>.
For example, if you are using devtools then it will be 
StateCreator<MyState, [["zustand/devtools", never]], [], MySlice> 
*/
'use client'

import { AssetsSlice } from '@/types/assets'
import type { ChatsSlice, MessagesSlice } from '@/types/chats'
import { KgsSlice } from '@/types/kgs'
import type { ProjectsSlice } from '@/types/projects'
import { SocketSlice } from '@/types/socket'
import { create } from 'zustand'
import {
  createAssetsSlice,
  createChatsSlice,
  createKgsSlice,
  createMessagesSlice,
  createProjectsSlice,
  createSocketSlice,
} from './slices'

const useStore = create<
  ProjectsSlice &
    ChatsSlice &
    MessagesSlice &
    KgsSlice &
    AssetsSlice &
    SocketSlice
>()((...a) => ({
  ...createProjectsSlice(...a),
  ...createChatsSlice(...a),
  ...createMessagesSlice(...a),
  ...createKgsSlice(...a),
  ...createAssetsSlice(...a),
  ...createSocketSlice(...a),
}))

export default useStore
