# Frontend API Usage Guide

This file explains how the frontend should use backend APIs.

---

# Authentication

## Login

Used in: Login Page

POST /auth/login

Expected response:
- token → stored in local storage
- user → used for profile display

---

# Workouts

## GET /workouts

Used in:
Workout Library Page

Used for:
- displaying workout cards
- filtering by difficulty
- showing duration

Difficulty mapping:
- beginner → green label
- intermediate → yellow label
- advanced → red label

---

# Meals

## GET /meals

Used in:
Meal Dashboard

Used for:
- showing meal list
- displaying calories and macros

---

# Rules

- Never assume extra fields beyond API contract
- Always handle missing/null values safely
- Always check difficulty enum values before rendering UI
