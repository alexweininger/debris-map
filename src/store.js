import create from 'zustand';

export const useStore = create(set => ({
    typeFilter: [],
    points: [],
    setPoints: (points) => set(state => ({ points })),
    setTypeFilter: (filter) => set(state => ({ typeFilter: filter }))
}))