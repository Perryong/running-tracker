export const yearStats = import.meta.glob('./year_*.svg', { query: '?url', import: 'default' })
export const totalStat = import.meta.glob(['./github.svg', './grid.svg', './mol.svg'], { query: '?url', import: 'default' })
