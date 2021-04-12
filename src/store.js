import create from 'zustand';

export const useStore = create(set => ({
    typeFilter: [],
    dateFilter: [],
    points: [],
    setPoints: (points) => set(state => ({ points })),
    setTypeFilter: (filter) => set(state => ({ typeFilter: filter })),
    setDateFilter: (filter) => set(state => ({ dateFilter: filter }))
}))