# Bfest Website Points — Implementation Specification

## 1. Home (`/`)
- [ ] **Header Background**: Change the dark header/hero background to a light/white background (suitable clean contrast).
- [ ] **Header Order & Size**: Reduce the size of the header/hero section and include only:
  1. **Business Fest 2027** title on top
  2. Description below it
  3. Navigation bar *(keep the existing design, just update the order)*
- [ ] **Countdown Banner**: Move the **BFest Countdown** below the header (separated from the header) and make it slightly smaller.
- [ ] **Main Content Split (70% / 30%)**:
  - Give **70%** of the width to the **Top Ranked Startups** section.
  - Give **30%** on the right to an **About Us** section.
- [ ] **Footer**:
  - Reduce the size of the footer (make it narrower/more compact).
  - Remove the **Official Jury Panel** completely.
  - Rename **"Student Affairs (Rate Access)"** to **"Official's Panel"**.

---

## 2. Startups Page (`/startups`)
- [ ] Remove the **EXHIBITOR DIRECTORY** badge/title.
- [ ] Change the page description to something simple and appealing.
- [ ] Remove **Booth location** from startup cards/details.
- [ ] Rename **"Student Affairs Rating"** -> **"Progress Rating"**.
- [ ] Rename **"View Pitch and Rate"** -> **"View Details"**.

---

## 3. Leaderboard (`/leaderboard`)
- [ ] Remove the page description below the title.
- [ ] Remove the **Auto-sync** toggle button and text from the UI *(keep auto-sync working silently in the background)*.
- [ ] Remove **Jury (50%)**, **Investors (30%)**, and **Student Affairs (20%)** columns/mentions *(keep only the points given by Student Affairs without mentioning Student Affairs)*.
- [ ] Add a **Progress Percentage** field (updated by Student Affairs / Bfest's Officials to show how much progress has been made by each startup).

---

## 4. Register Startup (`/register`)
- [ ] Change page title from **"Register Startup"** to **"Register"**.
- [ ] Remove the description below the title.
- [ ] Create **2 side-by-side registration frames** containing links:
  1. **Students Paid Stall**: *"Students of IMSciences non-ITB students who wants to register their stalls."*
  2. **Vendors**: *"Food, Retail, Art, Corporate, NGOs may register here."*
- [ ] Remove the **"Are you part of registration..."** frame completely.

---

## 5. Login & Role Access (`/login`, `/register` / Registration Team)
- [ ] Replace **Student Team**, **Jury/Judge**, **Student Affairs**, and **Investors** completely with **Bfest's Officials** *(used to rate startups and update progress, since only officials/student affairs will be evaluating)*.
- [ ] **Registration Team**: Grant ability to **add and remove startups** (used to manage startup data).

---

## 6. Legacy Board / Campus TV Display (`/leaderboard/stage`)
- [ ] Make the **Top 3** podium slightly smaller and shift it slightly higher to make room for the sponsor footer.
- [ ] Remove **Booth location** from all cards/rows.
- [ ] Add a **Sponsors Footer** titled **"Our Proud Sponsors"** displaying **sponsor logos only** moving dynamically in a continuous marquee/carousel.
  - Only **Organizer / Admin** can add or manage sponsor logos in the footer.
- [ ] Remove **"LIVE • Xs"** (`Live secs`) badge completely.
- [ ] Remove **"Scoring Formula"** from the bottom bar.
- [ ] Display startups ranked **#4 through #15** below the podium in a **rotating/animated style** with smooth transitions.
- [ ] Add a **cool animation when the Top 3 rankings change**.

