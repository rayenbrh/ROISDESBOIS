# 🚀 QUICK START - Les Rois des Bois Frontend

## ⚡ Fast Setup (3 steps)

### 1️⃣ Install Dependencies
```bash
cd /home/user/ROISDESBOIS/frontend
npm install
```

### 2️⃣ Start Backend (in another terminal)
```bash
cd /home/user/ROISDESBOIS/backend
npm run dev
```

### 3️⃣ Start Frontend
```bash
cd /home/user/ROISDESBOIS/frontend
npm run dev
```

## 🌐 Access

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🔐 Login

Use backend admin credentials (check backend .env or create admin user)

## ✅ That's it!

The complete admin dashboard is now running.

## 📚 More Info

- See `frontend/README.md` for full documentation
- See `FRONTEND_COMPLETE.md` for implementation details
- See `frontend/IMPLEMENTATION_SUMMARY.md` for technical specs

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -ti:5173 | xargs kill -9
```

**Dependencies not installing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Can't connect to backend?**
- Check backend is running on port 5000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`
