import create from 'zustand';

export const useStore = create((set, get) => ({
    typeFilter: [],
    dateFilter: [],
    materialFilter: [],
    objectFilter: [],
    brandFilter: [],
    otherFilter: [],
    points: [],
    setPoints: (points) => set(state => ({ points: [...state.points, ...points] })),
    setMaterialFilter: (filter) => {
        console.log(filter);
        set(state => ({materialFilter: filter}));
    },
    setObjectFilter: (filter) => {
        console.log(filter);
        set(state => ({objectFilter: filter}));
    },
    setBrandFilter: (filter) => {
        console.log(filter);
        set(state => ({brandFilter: filter}));
    },
    setOtherFilter: (filter) => {
        console.log(filter);
        set(state => ({otherFilter: filter}));
    },
    addFilter: (tag) => {
        const newTypeFilter = get().typeFilter;
        newTypeFilter.push(tag);
        set(state => ({typeFilter: newTypeFilter}))
    },
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