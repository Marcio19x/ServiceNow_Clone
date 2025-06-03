## Supabase Credentials Setup

### Backend (.env)
```env
SUPABASE_URL=https://bvvvpppqomtwaddwtewi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dnZwcHBxb210d2FkZHd0ZXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODc3ODEwMCwiZXhwIjoyMDY0MzU0MTAwfQ.uWMZqY9bAGkS1jALohYZj02EHN8rgDBCJtouOFGWft8

JWT_SECRET=nvH+EnipFBdxolyyKm4rODa0cst7dPmj3nkvLKs1KZot3KneSaHdvxMARmmh8GDWhI8N2nA9wVyfNUFOGOYs1g==

```

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://bvvvpppqomtwaddwtewi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dnZwcHBxb210d2FkZHd0ZXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzgxMDAsImV4cCI6MjA2NDM1NDEwMH0.gwv21qjpg_PuLLrvnQGYJOCLLbhZK5YxucKKdqxwV_M 
```

### How to Get These Values

1. Go to your Supabase project dashboard
2. Click on "Project Settings" in the sidebar
3. Go to "API" section
4. You'll find:
   - Project URL (`SUPABASE_URL`)
   - `anon` public key (`VITE_SUPABASE_ANON_KEY`)
   - `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`)
5. For `JWT_SECRET`, you can generate a secure random string using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```