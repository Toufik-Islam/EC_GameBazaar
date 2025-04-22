// Game events service for real-time updates between components
export const gameEvents = {
  listeners: new Set<() => void>(),
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  emit() {
    this.listeners.forEach(listener => listener());
  }
};