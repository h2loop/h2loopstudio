/* If you have some middlewares then replace 
StateCreator<MyState, [], [], MySlice> with 
StateCreator<MyState, Mutators, [], MySlice>.
For example, if you are using devtools then it will be 
StateCreator<MyState, [["zustand/devtools", never]], [], MySlice> 
*/
'use client'

import { AssetsSlice } from '@/types/assets'
import type { ChatsSlice, MessagesSlice } from '@/types/chats'
import { DatasheetSlice } from '@/types/datasheet'
import { DevicetreeSlice } from '@/types/devicetree'
import type { ProjectsSlice } from '@/types/projects'
import { AssetReviewSlice } from '@/types/review'
import { SocketSlice } from '@/types/socket'
import { UsersSlice } from '@/types/users'
import { create } from 'zustand'
import {
  createAssetsReviewSlice,
  createAssetsSlice,
  createChatsSlice,
  createDatasheetSlice,
  createDeviceTreeSlice,
  createMessagesSlice,
  createProjectsSlice,
  createSocketSlice,
  createUsersSlice,
} from './slices'

const useStore = create<
  ProjectsSlice &
    ChatsSlice &
    MessagesSlice &
    AssetsSlice &
    SocketSlice &
    UsersSlice &
    AssetReviewSlice &
    DatasheetSlice &
    DevicetreeSlice
>()((...a) => ({
  ...createProjectsSlice(...a),
  ...createChatsSlice(...a),
  ...createMessagesSlice(...a),
  ...createAssetsSlice(...a),
  ...createSocketSlice(...a),
  ...createUsersSlice(...a),
  ...createAssetsReviewSlice(...a),
  ...createDatasheetSlice(...a),
  ...createDeviceTreeSlice(...a),
}))

export default useStore
