# Fix Plan - Frontend Issues

## Issue 1: Dashboard Loading (White Screen / Infinite Loading)
- [ ] Fix `fruitService.getIdentificationStats()` to return stats directly
- [ ] Fix `fruitSlice.js` `getIdentificationStats` to unwrap response properly
- [ ] Fix `fruitSlice.js` `getIdentificationHistory` to stop overwriting `identificationStats`
- [ ] Fix `DashboardPage.jsx` error handling

## Issue 2: Encyclopedia Page Not Showing Fruits
- [ ] Fix `fruitService.js` `getAllFruits` to map sort values to backend format
- [ ] Fix `EncyclopediaPage.jsx` to use `useCallback` for load functions

## Issue 3: Confidence Score Shows 0%
- [ ] Fix `IdentificationResult.jsx` confidence percentage calculation

