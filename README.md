# 🧩 Special Learning Games — React Native App

An inclusive educational app built with **React Native + Expo**, designed especially for **slow learners and students with special needs**.  
The goal of this app is to help children understand fundamental math and time concepts through **interactive visual games**, adaptive hints, and rewarding feedback.

---

## 🚀 How to Run the App

### ▶️ Option 1: Run using Expo Go (Recommended for Testing)
1. Install **Expo Go** on your Android/iOS device from Play Store or App Store.
2. Clone this repository:
   ```bash
   git clone https://github.com/<your-username>/SpecialLearningGames.git
   cd SpecialLearningGames
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npx expo start
   ```
5. Scan the QR code displayed in your terminal or browser using **Expo Go** to launch the app.

### 📱 Option 2: Install the APK (Direct Play)
- [Download Latest APK Here](#) <!-- 🔗 Replace this link when APK is uploaded -->
- Install it on your Android device.
- Launch and start playing the educational games immediately!

---

## 🎯 App Overview

This app contains **five interactive games**, designed to strengthen different real-world learning concepts through play-based reinforcement.

Each game includes:
- Progressive **levels** with increasing complexity.
- Built-in **hints** and **solution animations** for guidance.
- A **celebration** animation for correct answers and feedback for wrong ones.
- Accessibility-friendly design — large buttons, visual cues, and minimal text.

---

## 🧠 Game Summaries

### 1️⃣ Digit Tracing Game ✍️
Teaches students to **trace numbers (0–9)** correctly.
- Students use a **freeform drawing board**.
- A **digit path** ensures correct tracing.
- **Submit** button validates accuracy.
- **Hints and solution animations** demonstrate the correct tracing.

<!-- 📸 Add screenshot of Digit Tracing Game here -->

---

### 2️⃣ Bubble Counting Game 🫧
Helps children understand **counting concepts** through bubble popping.
- A target number appears (e.g., “Pop 6 bubbles”).
- Each popped bubble increases the counter.
- **Submit** validates if the correct count is reached.
- Includes celebrate/incorrect feedback animations.

<!-- 📸 Add screenshot of Bubble Counting Game here -->

---

### 3️⃣ Addition & Subtraction with Bubbles ➕➖
Simulates a **calculator interface** for basic arithmetic.
- Separate **addition and subtraction levels**.
- Numbers 0–9 arranged in a **calculator-style grid**.
- Students tap numbers and operators to reach a **target sum**.
- Encourages recognition of basic math functions rather than mental computation.

<!-- 📸 Add screenshot of Add/Sub Bubble Game here -->

---

### 4️⃣ Money Concept Game 💰
Teaches children **Indian currency recognition and usage**.
- Levels progress from **coin recognition** to **real-life shopping** (milk, bread, etc.).
- Students combine notes and coins to match the total amount.
- Includes adaptive hints and visual reinforcement.

<!-- 📸 Add screenshot of Money Concept Game here -->

---

### 5️⃣ Time Concept (Clock) Game 🕓
Interactive analog clock where students learn **how to tell time**.
- Levels progress from **hour-hand only** to **real-life scenarios**.
- Users **tap** the clock to set the correct time.
- Includes hints (highlight correct hands) and solution animations.
- Adaptive scoring and feedback encourage independent problem-solving.

<!-- 📸 Add screenshot of Clock Game here -->

---

## 🧩 App Flow

### 🔐 1. Login / Signup Screen
- Users create a new account or log in.
- Credentials stored locally or via Firebase (optional).

<!-- 📸 Add Login/Signup screenshot -->

### 🏠 2. Dashboard Screen
- Displays all 5 games as **menu cards**.
- Each game card shows completion progress and level.
- Pixelated retro theme with game icons.

<!-- 📸 Add Dashboard screenshot -->

### 👤 3. Profile Screen
- Displays user’s overall performance data:
  - Levels completed per game
  - Correct vs incorrect attempts
  - Hints and solutions used
  - Total score / stars earned

<!-- 📸 Add Profile screenshot -->

### ⚙️ 4. Settings Screen
- Toggle background music and sound effects.
- Adjust UI accessibility (font size, contrast).
- Reset progress if needed.

<!-- 📸 Add Settings screenshot -->

### 🎮 5. Individual Games Screens
- Each game launches in full-screen immersive mode.
- Large, accessible buttons.
- Consistent controls: **Hint**, **Solution**, **Submit**, **Reset**.

<!-- 📸 Add sequence of each game’s screenshots -->

---

## 📊 Technical Highlights

- **Framework:** React Native + Expo  
- **Languages:** TypeScript  
- **UI Library:** shadcn/ui + Tailwind CSS styling  
- **Animation:** React Native Animated API  
- **Sound:** Expo Audio Player (with SFX toggles)  
- **Storage:** AsyncStorage / Local persistence for profile stats  
- **Platform:** Android + iOS support  

---

## 💡 Accessibility & Pedagogical Focus

Each mini-game is built for inclusivity:
- Clear, colorful, and minimalistic UI.
- Supports **students with cognitive or motor challenges**.
- Feedback-driven reinforcement model (Independent → Partial → Dependent).
- Builds confidence through repeated success.

---

## 🧱 Directory Structure

```
src/
├── games/
│   ├── DigitTracingGame.tsx
│   ├── BubbleCountingGame.tsx
│   ├── AddSubBubblesGame.tsx
│   ├── MoneyConceptGame.tsx
│   └── ClockTimeGame.tsx
├── components/
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   └── GameFlowManager.ts
└── assets/
    ├── ui/
    ├── icons/
    ├── clockgame/
    ├── sound/
```

---

## 🧩 Future Improvements

- Add **voice instructions** for every level.  
- Integrate **progress tracking for teachers/parents**.  
- Include **multilingual support (Hindi + English)**.  
- Cloud sync for student profiles.

---

## 🪪 Credits

Developed by **Om Sable, Rhea Patel, Anindya Zarbade**, B.Tech Computer Engineering (4th Year).  
Focused on creating accessible digital learning tools for children with special needs.

---

## 📬 Contact / Contributions

Contributions are welcome!  
- Fork the repo  
- Submit pull requests for improvements  
- Report issues or feature ideas in the GitHub Issues tab.

📧 **Email:** [omsable8@gmail.com]  
🌐 **GitHub:** [https://github.com/omsable8](https://github.com/omsable8)
