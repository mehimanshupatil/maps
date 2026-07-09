// Minimal cross-root store (the r3f Canvas is a separate React root, so
// regular context doesn't cross it). useSyncExternalStore keeps both sides
// in sync without adding a state library.

import { useSyncExternalStore } from 'react'
import type { LakeKey } from '../config/lakes'

export type Selectable = LakeKey | 'city'

interface SelectionState {
  selected: Selectable | null
  hovered: Selectable | null
  labelsVisible: boolean
  /** index into history for time-scrubbing; null = latest */
  dateIndex: number | null
}

let state: SelectionState = { selected: null, hovered: null, labelsVisible: true, dateIndex: null }
const listeners = new Set<() => void>()

function emit(next: SelectionState) {
  state = next
  listeners.forEach((l) => l())
}

export const setSelected = (key: Selectable | null) => emit({ ...state, selected: key })
export const setHovered = (key: Selectable | null) => emit({ ...state, hovered: key })
export const setLabelsVisible = (v: boolean) => emit({ ...state, labelsVisible: v })
export const setDateIndex = (i: number | null) => emit({ ...state, dateIndex: i })
/** non-reactive read, for intervals/callbacks */
export const getSelection = (): SelectionState => state

export function useSelection(): SelectionState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
  )
}
