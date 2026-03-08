# Starla: Ideal Customer Persona + Product Alignment

## Context
Starla is an AI interview coach. The GTM is B2C-first (students find Starla directly), with B2B career center sales as a follow-on.

---

## The Ideal Customer: "Alex the Anxious Junior"

**Who they are:**
- College junior/senior or recent grad (20-23 years old)
- Any major -- CS, business, liberal arts, engineering, nursing, etc.
- Applying for internships or their first full-time role
- 0-2 years of real work experience (mostly part-time, campus jobs, or clubs)

**Where they are in their journey:**
- Career fair season or active application cycle
- Have a resume (probably rough) but no real interview experience
- May have gotten a first-round interview and panicked
- Googling "how to answer behavioral interview questions"

**Their pain points:**
1. **Interview anxiety** -- they've never done a real interview, or bombed one and lost confidence
2. **Don't know what to expect** -- what questions will they ask? What's the STAR method? How long should answers be?
3. **No feedback loop** -- they practice with friends or ChatGPT but nobody tells them *specifically* what was weak
4. **Alternatives are too expensive** -- mock interview coaches cost $100+/hr, career center appointments are booked weeks out

**What they value:**
- Speed -- they want to practice *tonight* before tomorrow's interview
- Specificity -- "your answer lacked a concrete metric" > "try to be more specific"
- Low commitment -- don't want to sign up for a 10-session package, just want to try it NOW
- Social validation -- sharing progress with friends, comparing scores

**Aha moment:** They answer their first question, see a score + specific strengths/improvements, and think "this actually helps more than practicing in front of a mirror."

**Conversion trigger:** They have an interview coming up in the next 1-7 days. Urgency drives upgrade.

---

## Buyer Segments

| Segment | Who | Plan | Motivation |
|---------|-----|------|------------|
| Individual (casual) | Student exploring, no urgency | Free | Curiosity, low stakes |
| Individual (serious) | Interview in < 7 days | Pro ($12/mo) | Urgency, needs unlimited practice |
| Career Center | University career services | Custom | Serve all students at scale |

---

## Product Alignment (Implemented)

### 1. Experience Level Dropdown
**Old:** Entry Level, Mid Level, Senior, Staff/Principal, Executive
**New:** Student (Freshman/Sophomore), Student (Junior/Senior), Recent Graduate (0-1 year), Early Career (1-3 years), Mid Career+ (3+ years)

Files: `src/components/profile-setup.tsx`, `src/components/profile-editor.tsx`, `src/app/api/profile/route.ts`

### 2. Landing Page Copy
- Hero subtitle speaks to first-time interviewers
- Testimonial: student who landed an internship (not a senior engineer)
- Social proof: "Trusted by students everywhere"
- CTA: "Join thousands of students"

File: `src/app/page.tsx`

### 3. Pricing Copy
- Free: "Try it out -- no commitment" / "Start practicing"
- Pro: "For interview season"

File: `src/app/page.tsx`

### 4. General Mode Student Questions
Added 4 student-appropriate behavioral questions:
- Group project with differing opinions
- Balancing academics and extracurriculars
- Internship/campus job challenges
- Taking initiative in clubs/classes/volunteer roles

File: `src/lib/behavioral-context.ts`

### 5. FAQ Updates
- Added: "I've never had a real interview -- is Starla right for me?"
- Renamed "University plan" to "Career Center plan"

File: `src/app/page.tsx`

---

## Future Opportunities (Not Yet Implemented)

### Shareable Feedback Card
Add a "Share your score" button on the feedback card that generates a shareable image or copies a text snippet. This drives word-of-mouth among students.

File: `src/components/interview.tsx` (feedback section)

### Semester Pricing
Consider $30/semester option for Pro -- aligns with student budgets and academic cycles. Business decision TBD.

### Campus Stats
When data supports it, add "Used by students at 50+ schools" to social proof section.
