<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mintoo Food Delivery Platform

This repository contains the full source code for the Mintoo Web and Mobile Android App.

## ⚠️ Security Notice & Secret Rotation Warning

> [!WARNING]
> **Git History Secret Rotation Warning**: All credentials, tokens, passwords, and secret keys have been moved to environment variables (`.env`). However, because prior commit history in Git may contain historical literal strings, **YOU MUST IMMEDIATELY ROTATE ALL PREVIOUSLY HARDCODED SECRETS** in their respective provider consoles before deploying to production:
> 1. **Telegram Bot Token**: Generate a new bot token via Telegram `@BotFather` (`/revoke`).
> 2. **Razorpay Key Secret**: Generate a new Secret Key in the Razorpay Dashboard (API Keys section).
> 3. **Admin Passwords**: Update server environment variable `ADMIN_PASSWORD` and `ADMIN_AUTH_TOKEN`.
> 4. **Firebase Service Account & API Keys**: Verify Firestore Rules and rotate Firebase credentials if necessary.

## 🚀 Environment Setup

1. Copy `.env.example` to `.env`:
   `cp .env.example .env`
2. Fill in all required environment variables in `.env`.
3. Install dependencies:
   `npm install`
4. Run the development server:
   `npm run dev`
