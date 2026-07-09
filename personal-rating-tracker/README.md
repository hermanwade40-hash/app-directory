# Personal Rating Tracker

A private manual scoring dashboard for tracking appearance, grooming, and fitness progress over time.

## What it does

- Scores 8 weighted categories on a 1 to 10 scale
- Calculates a weighted overall score
- Saves snapshots in browser localStorage
- Shows strongest category and main improvement lever
- Exports saved history as JSON
- Runs locally with Vite and React

## Categories

| Category | Weight |
|---|---:|
| Facial harmony | 20% |
| Jaw and chin | 15% |
| Skin quality | 15% |
| Eye area | 10% |
| Nose balance | 10% |
| Hair and hairline | 10% |
| Leanness and body frame | 10% |
| Style and grooming | 10% |

## Run from terminal

```bash
git clone https://github.com/hermanwade40-hash/app-directory.git
cd app-directory/personal-rating-tracker
npm install
npm run dev
```

Then open the local Vite URL shown in your terminal.

## Notes

This app is meant for private self-tracking. It does not upload images, use face recognition, or claim to provide a scientific rating.
