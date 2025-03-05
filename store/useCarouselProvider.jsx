const useCarouselStore = create((set) => ({
    activeIndex: 0,
    setActiveIndex: (index) => set({ activeIndex: index }),
  }));