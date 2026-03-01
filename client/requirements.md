## Packages
date-fns | Formatting timestamps for the charts
framer-motion | Smooth entry animations for the dashboard cards
recharts | Rendering the health data charts

## Notes
The dashboard requires the GET /api/dashboard-data endpoint to return an array of health data.
The frontend uses useQuery with a 10-second refetchInterval as requested for auto-refresh.
