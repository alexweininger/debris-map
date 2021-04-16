import create from 'zustand';

export const useStore = create(set => ({
    typeFilter: [],
    dateFilter: [],
    points: [],
    setPoints: (points) => set(state => ({ points: [...state.points, ...points] })),
    setTypeFilter: (filter) => set(state => ({ typeFilter: filter })),
    setDateFilter: (filter) => set(state => ({ dateFilter: filter })),
    complete: [],
    removeComplete: (point) => set(state => {
        let newC = Array.from(state.complete);
        newC = newC.filter((p) => p !== point['Litter']);
        return { complete: newC };
    }),
    addComplete: (point) => set(state => {
        const newC = Array.from(state.complete);
        newC.push(point['Litter']);
        return { complete: newC };
    }),
    mapLoading: 'idle',
    setMapLoading: (value) => set(state => ({ mapLoading: value })),
    showPoints: false,
    setShowPoints: (val) => set(state => ({ showPoints: val }))
}))