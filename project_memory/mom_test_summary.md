# The Mom Test — Comprehensive Summary

**Author:** Rob Fitzpatrick
**Purpose:** A practical guide to having customer conversations that yield truthful, actionable insights — instead of false positives, compliments, and fluff.

**Context for Software Engineers:** This book is essential reading for anyone involved in requirements gathering, product discovery, and validating whether a software product solves a real problem. Every principle maps directly to the challenge of extracting *real* requirements from stakeholders vs. building features nobody uses.

---

## Introduction (Pages 3–7)

**Main Concept:** Talking to customers is necessary but extremely easy to do wrong. Bad conversations are worse than no conversations because they produce false positives — convincing you that you're on the right track when you're not. The book is a practical handbook on how to ask good questions and extract real information.

**Key Metaphor:** Customer conversations are like excavating a delicate archaeological site. Too blunt (bulldozer) and you smash the truth. Too timid (toothbrush) and you never find anything. You need the right tools, wielded with care.

**No rules of thumb in this section.**

---

## Chapter 1: The Mom Test (Pages 8–23)

**Pages:** 8–23
**Title:** The Mom Test

**Main Concept:** You should never ask anyone if your business idea is good. Instead, ask about *their life*, *their problems*, and *their past behavior*. The Mom Test is a set of three rules for crafting questions that even your mom can't lie to you about — because you never reveal your idea.

### The Three Rules of The Mom Test:
1. **Talk about their life instead of your idea**
2. **Ask about specifics in the past instead of generics or opinions about the future**
3. **Talk less and listen more**

### Good Questions vs. Bad Questions (Pages 15–22):

| Question | Verdict | Why |
|---|---|---|
| "Do you think it's a good idea?" | **Bad** | Only the market can tell you. This invites opinions and false positives. |
| "Would you buy a product which did X?" | **Bad** | Hypothetical future promise from people who want to make you happy. |
| "How much would you pay for X?" | **Bad** | Same problem — the number makes it *feel* rigorous but it's still a lie. |
| "What would your dream product do?" | **Sort-of-okay** | Only useful if you follow up to understand *why* they want those features. |
| "Why do you bother?" | **Good** | Gets from the perceived problem to the real one. Reveals motivations. |
| "What are the implications of that?" | **Good** | Distinguishes "I-will-pay-to-solve-that" problems from minor annoyances. |
| "Talk me through the last time that happened." | **Good** | Show, not tell. Concrete past behavior is reliable data. |
| "Talk me through your workflow." | **Good** | Reveals tools, constraints, integrations, and how your product fits their day. |
| "What else have you tried?" | **Good** | Reveals if they care enough to have searched for solutions. |
| "Would you pay X for a product which did Y?" | **Bad** | Adding a number doesn't fix a hypothetical future-tense question. |
| "How are you dealing with it now?" | **Good** | Gives workflow info and a price anchor. |
| "Where does the money come from?" | **Good** | Critical for B2B — reveals budget owners and purchasing process. |
| "Who else should I talk to?" | **Good** | Multiplies leads via intros. End every conversation with this. |
| "Is there anything else I should have asked?" | **Good** | Lets them fix your line of questioning. A crutch you'll discard over time. |

### Rules of Thumb:
- **"Customer conversations are bad by default. It's your job to fix them."** (p. 13)
- **"Opinions are worthless."** (p. 16)
- **"Anything involving the future is an over-optimistic lie."** (p. 16)
- **"People will lie to you if they think it's what you want to hear."** (p. 17)
- **"People know what their problems are, but they don't know how to solve those problems."** (p. 17)
- **"You're shooting blind until you understand their goals."** (p. 17)
- **"Some problems don't actually matter."** (p. 18)
- **"Watching someone do a task will show you where the problems and inefficiencies really are, not where the customer thinks they are."** (p. 18)
- **"If they haven't looked for ways of solving it already, they're not going to look for (or buy) yours."** (p. 19)
- **"While it's rare for someone to tell you precisely what they'll pay you, they'll often show you what it's worth to them."** (p. 20)
- **"People want to help you, but will rarely do so unless you give them an excuse to do so."** (p. 22)

### Software Engineering Lens:
This chapter is the foundation of **requirements elicitation**. The anti-patterns here are *exactly* what happens in bad stakeholder interviews: you pitch the solution, they nod, you build it, nobody uses it. The fix is the same: ask about their current workflow, past behavior, and real problems — not whether they like your proposed feature.

---

## Chapter 2: Avoiding Bad Data (Pages 24–40)

**Pages:** 24–40
**Title:** Avoiding Bad Data

**Main Concept:** There are three types of bad data that poison your learning: **Compliments**, **Fluff** (generics, hypotheticals, the future), and **Ideas** (feature requests). Even when you ask good questions, conversations can go off track. The fix: deflect compliments, anchor fluff to specifics, and dig beneath ideas to find root motivations.

### Three Types of Bad Data:
1. **Compliments** — "That's cool, I love it!" (worthless; they're being polite or protecting your feelings)
2. **Fluff** — Generic claims ("I usually..."), future-tense promises ("I would..."), hypothetical maybes ("I might...")
3. **Ideas** — Feature requests and suggestions (understand the motivation, don't just obey)

### Deflecting Compliments (Pages 24–28):
- Compliments are pervasive and sneak into almost every response.
- The best defense is to never mention your idea. If compliments happen anyway, deflect and redirect to facts and commitments.
- **Symptoms in meetings:** "Thanks!" / "I'm glad you like it."
- **Symptoms back at the office:** "That meeting went really well." / "We're getting a lot of positive feedback." / "Everybody I've talked to loves the idea."

### Anchoring Fluff (Pages 28–33):
- Fluff comes in three shapes: Generic claims ("I always"), Future-tense promises ("I would"), Hypothetical maybes ("I might").
- **"The world's most deadly fluff is: 'I would definitely buy that.'"**
- Fluff-inducing questions: "Do you ever…", "Would you ever…", "What do you usually…", "Do you think you…", "Might you…", "Could you see yourself…"
- Fix: Use The Mom Test to bring them back to specifics. "When's the last time that happened?" anchors fluff to reality.

### Digging Beneath Ideas (Pages 33–37):
- When someone gives you a feature request, don't add it to your todo list. Dig into the *motivation* behind it.
- **Questions to dig into feature requests:**
  - "Why do you want that?"
  - "What would that let you do?"
  - "How are you coping without it?"
  - "Do you think we should push back the launch to add that feature, or is it something we could add later?"
  - "How would that fit into your day?"
- **Questions to dig into emotional signals:**
  - "Tell me more about that."
  - "That seems to really bug you — I bet there's a story here."
  - "What makes it so awful?"
  - "Why haven't you been able to fix this already?"
  - "You seem pretty excited about that — it's a big deal?"
  - "Why so happy?"
  - "Go on."

### Stop Seeking Approval (Pages 37–38):
- **Fishing for compliments (intentional):** "Do you think it will work?" / "Do you like it?"
- **The Pathos Problem (accidental):** Exposing your ego leads people to protect your feelings. "So here's that top-secret project I quit my job for... what do you think?"

### Rules of Thumb:
- **"Compliments are the fool's gold of customer learning: shiny, distracting, and entirely worthless."** (p. 28)
- **"Ideas and feature requests should be understood, but not obeyed."** (p. 37)
- **"If you've mentioned your idea, people will try to protect your feelings."** (p. 38)
- **"Anyone will say your idea is great if you're annoying enough about it."** (p. 39)
- **"The more you're talking, the worse you're doing."** (p. 40)

### Software Engineering Lens:
This is the chapter about **requirements contamination**. In software, this maps to: stakeholders giving you compliments on your architecture ("looks great!") without real buy-in, product owners making fluffy future promises ("we'd definitely use that integration"), and users requesting features that mask the real underlying need (the MTV analytics story on pages 34–36 is a *perfect* example of building the wrong feature because you accepted a request at face value instead of understanding the "job to be done").

---

## Chapter 3: Asking Important Questions (Pages 41–55)

**Pages:** 41–55
**Title:** Asking Important Questions

**Main Concept:** It's not enough to ask unbiased questions — you must ask *important* ones. Run thought experiments to find the scary, world-rocking questions you're avoiding. Distinguish between product risk (can I build it?) and market risk (do they want it?). Don't zoom in on details before confirming the big picture matters.

### Key Frameworks:

**Love Bad News (Pages 42–44):**
- Bad news is solid learning. A lukewarm "meh" response is more reliable than an excited "Wow!"
- If you learn your idea is wrong early, that's a *win* — you saved time and money.
- The classic error: responding to lukewarm signals by "upping your game" and pitching harder. Unless they're holding a check, convincing them only produces false positives.

**Look Before You Zoom (Pages 44–50):**
- Don't zoom in on a specific problem before confirming the whole problem *area* matters to them.
- Premature zoom leads to data that *seems* like validation but is worthless (false positives).
- Start broad ("What are your big goals right now?") before zooming in ("What's your biggest problem with X?").
- **"Does-this-problem-matter" questions:**
  - "How seriously do you take your [area]?"
  - "Do you make money from it?"
  - "Have you tried making more money from it?"
  - "How much time do you spend on it each week?"
  - "Do you have any major aspirations for your [area]?"
  - "Which tools and services do you use for it?"
  - "What are you already doing to improve this?"
  - "What are the 3 big things you're trying to fix or improve right now?"

**Look at the Elephant (Pages 50–54):**
- Don't ignore critical risks just because they're uncomfortable. Startups depend on multiple failure points — if any one doesn't hold, the idea breaks.
- **Product risk** — Can I build it? Can I grow it? Will they keep using it?
- **Market risk** — Do they want it? Will they pay? Are there enough of them?
- If you have heavy product risk, conversations alone won't validate the business. You'll need to start building earlier.

**Prepare Your List of 3 (Page 55):**
- Always pre-plan the 3 most important things you want to learn from any given type of person.
- Have different lists for different types of customers/partners.
- Knowing your list allows you to take advantage of serendipitous encounters.

### Rules of Thumb:
- **"You should be terrified of at least one of the questions you're asking in every conversation."** (p. 41)
- **"There's more reliable information in a 'meh' than a 'Wow!' You can't build a business on a lukewarm response."** (p. 44)
- **"Start broad and don't zoom in until you've found a strong signal, both with your whole business and with every conversation."** (p. 50)
- **"You always need a list of your 3 big questions."** (p. 55)

### Software Engineering Lens:
This chapter maps to **risk-driven requirements prioritization**. In software projects, we often obsess over low-risk details (UI polish, nice-to-have features) while ignoring the "elephant" — the fundamental question of whether the architecture can scale, whether the integration is technically feasible, or whether the business model works. The product risk vs. market risk framework is critical: some software projects fail because nobody wants the product (market risk), others fail because the technology can't deliver on the promise (product risk). Your requirements gathering approach should be calibrated to which risk dominates.

---

## Chapter 4: Keeping It Casual (Pages 56–62)

**Pages:** 56–62
**Title:** Keeping It Casual

**Main Concept:** Early customer learning works better as quick, casual chats than long, formal meetings. Formal meetings waste time, set wrong expectations, and introduce bias. Strip the formality and just have conversations — at events, in line at a cafe, wherever you encounter your target customers.

### The Meeting Anti-Pattern (Pages 57–59):
- The tendency to relegate every customer conversation into a calendar block.
- Formal meetings waste time (a 1-hour meeting costs ~4 hours with prep, commute, and review).
- They set expectations that you'll show a product.
- They cause you to miss serendipitous learning opportunities.

### Key Principle:
- Early conversations can take as little as 5 minutes to learn whether a problem exists.
- 10–15 minutes is usually enough to get core learning.
- Industry deep-dives take an hour or more.
- Give as little information as possible about your idea while nudging the discussion in a useful direction.

### Symptoms of Formality:
- "So, first off, thanks for agreeing to this interview. I just have a few questions for you..."
- "On a scale of 1 to 5, how much would you say you..."

### Rules of Thumb:
- **"Learning about a customer and their problems works better as a quick and casual chat than a long, formal meeting."** (p. 57)
- **"If it feels like they're doing you a favour by talking to you, it's probably too formal."** (p. 59)
- **"Give as little information as possible about your idea while still nudging the discussion in a useful direction."** (p. 62)

### Software Engineering Lens:
This maps to how engineers should approach **informal stakeholder discovery**. Instead of scheduling formal "requirements gathering sessions" (which prime people to give you formal, sanitized answers), observe users in context, ask quick questions during standups or hallway conversations, and pay attention to the complaints people make naturally. The best requirements often surface from casual observation, not structured interviews.

---

## Chapter 5: Commitment and Advancement (Pages 63–74)

**Pages:** 63–74
**Title:** Commitment and Advancement

**Main Concept:** Once you start showing product, cut through false positives by asking for **commitments** (something of value they give up: time, reputation, money) and pushing for **advancement** (moving to the next step in your funnel). Meetings without commitment or advancement are failures — they produce "zombie leads."

### Definitions:
- **Commitment:** They show they're serious by giving up something they value (time, reputation, or money).
- **Advancement:** They move to the next step of your real-world funnel, getting closer to a sale.

### Currencies of Conversation (Pages 65–66):
- **Time commitments:** Clear next meeting with known goals, sitting down to give feedback on wireframes, using a trial for a non-trivial period.
- **Reputation risk commitments:** Intro to peers or team, intro to a decision maker, giving a public testimonial or case study.
- **Financial commitments:** Letter of intent, pre-order, deposit.

### Good Meeting / Bad Meeting Evaluations (Pages 67–71):

| What They Say | Verdict | Why / Fix |
|---|---|---|
| "That's so cool. I love it!" | **Bad** | Pure compliment, zero data. Deflect and get back to business. |
| "Looks great. Let me know when it launches." | **Bad** | Compliment + stalling tactic. Classic polite rejection. Ask for a commitment today. |
| "There are a couple people I can intro you to when you're ready." | **Bad (nearly good)** | Too generic to be useful. Convert into something specific: who, when, and why not now? |
| "What are the next steps?" | **Good** | Classic good meeting conclusion. Advances to the next step. |
| "I would definitely buy that." | **Bad** | Extreme false positive danger. Shift from fuzzy future promises to concrete current commitments. |
| "When can we start the trial?" | **Maybe good** | Depends on how much it costs them to try. Think in terms of currency. |
| "Can I buy the prototype?" | **Great** | The best possible meeting conclusion. |
| "When can you come back to talk to the rest of the team?" | **Good** | Strong advancement signal in enterprise sales. |

### Crazy Customers / Earlyvangelists (Pages 72–73):
- First customers are "crazy" — they want what you're making so badly they'll try it first.
- In enterprise, earlyvangelists: have the problem, know they have it, have the budget, and have already cobbled together a makeshift solution.
- Keep people who show deep emotion close — they're your path to the first sale.

### Rules of Thumb:
- **"'Customers' who keep being friendly but aren't ever going to buy are a particularly dangerous source of mixed signals."** (p. 64)
- **"If you don't know what happens next after a product or sales meeting, the meeting was pointless."** (p. 65)
- **"The more they're giving up, the more seriously you can take their kind words."** (p. 66)
- **"It's not a real lead until you've given them a concrete chance to reject you."** (p. 72)
- **"In early stage sales, the real goal is learning. Revenue is just a side-effect."** (p. 74)

### Software Engineering Lens:
This is about **validating requirements through action, not words**. In software, the equivalent of "commitment" is: Will they actually use the beta? Will they migrate their data? Will they assign an engineer to integrate with your API? Will they sign the contract? A stakeholder saying "we'd love that feature" is worthless — a stakeholder allocating sprint time to test your integration is gold. Zombie leads in software are stakeholders who keep attending demos and saying "looks great" but never champion adoption internally.

---

## Chapter 6: Finding Conversations (Pages 75–88)

**Pages:** 75–88
**Title:** Finding Conversations

**Main Concept:** Practical tactics for finding people to talk to. Start with cold outreach if you must, but convert to warm intros as fast as possible. Better yet, bring customers to you through organizing events, teaching, blogging, and leveraging your network.

### Going to Them (Pages 76–78):
- **Cold calls:** The rejection rate is irrelevant — you only need a few conversations to start.
- **Seizing serendipity:** Be ready to have conversations anywhere. If it's not a formal meeting, you don't need excuses.
- **Landing pages:** Great for collecting emails of qualified leads to start conversations with.

### Bringing Them to You (Pages 78–80):
- **Organise meetups:** Instantly bootstraps credibility. "The most unfair trick I know for rapid customer learning."
- **Speaking & teaching:** Refines your message, puts you in front of potential customers who take you seriously.
- **Industry blogging:** Even without an audience, a blog gives you credibility for cold outreach.

### Creating Warm Intros (Pages 80–82):
- **7 degrees of bacon:** Everyone knows someone. Just ask.
- **Industry advisors:** ~0.5% equity each, one meeting per month, fresh batch of intros weekly.
- **Universities:** Professors are a goldmine for intros to industry folks.
- **Investors:** Great for B2B intros beyond their own portfolio.
- **Cash in favours:** Circle back to people who said "let me know how I can help."

### Framing the Meeting (Pages 82–86):
The **5-element framing format** (mnemonic: "Very Few Wizards Properly Ask"):
1. **Vision** — You're solving horrible problem X or ushering in wonderful vision Y. Don't mention your idea.
2. **Framing** — What stage you're at. Mention you don't have anything to sell (if true).
3. **Weakness** — Your specific problem you need answers on. Shows you're not a time waster.
4. **Pedestal** — How they, in particular, can help.
5. **Ask** — Ask for help.

### The Advisory Flip (Page 88):
- Don't go looking for customers — go looking for advisors. This changes the power dynamic and makes the conversation naturally about learning.

### Rules of Thumb:
- **"If it's not a formal meeting, you don't need to make excuses about why you're there or even mention that you're starting a business. Just have a good conversation."** (p. 77)
- **"If it's a topic you both care about, find an excuse to talk about it. Your idea never needs to enter the equation."** (p. 77)
- **"Kevin Bacon's 7 degrees of separation applies to customer conversations. You can find anyone you need if you ask for it a couple times."** (p. 81)

### Software Engineering Lens:
For engineers, this chapter is about **building your discovery network**. If you're a technical founder or lead engineer, you need to get out of the codebase and into conversations. The "advisory flip" is particularly useful: instead of awkwardly interviewing potential users, position yourself as seeking guidance from domain experts. The framing format (Vision/Framing/Weakness/Pedestal/Ask) is directly applicable to cold-emailing potential design partners for a new API, SDK, or developer tool.

---

## Chapter 7: Choosing Your Customers (Pages 90–98)

**Pages:** 90–98
**Title:** Choosing Your Customers

**Main Concept:** Startups drown from too many options, not too few. Without a focused customer segment, your feedback will be hopelessly inconsistent and you can neither prove nor disprove your idea. Good segments are a **who-where pair**: you know exactly who they are and where to find them.

### Problems of Fuzzy Segmentation:
1. You get overwhelmed by options and don't know where to start
2. You aren't moving forward but can't prove yourself wrong
3. You receive incredibly mixed feedback and can't make sense of it

### Customer Slicing (Pages 94–97):
A process for drilling down to a specific, findable customer segment:
1. Within this group, which type of person would want it most?
2. Would everyone in this group buy/use it, or only some?
3. Why do they want it? (problem or goal)
4. Does everyone in the group have that motivation or only some?
5. What additional motivations are there?
6. Which other types of people have these motivations?
7. What are these people already doing to achieve their goal or survive their problem?
8. Where can we find our demographic groups?
9. Where can we find people doing the workaround behaviors?

Then choose based on who is most: **profitable**, **easy to reach**, and **rewarding to build a business around**.

### Talking to the Wrong People (Pages 97–98):
Three ways this happens:
1. Too-broad segment — talking to everyone
2. Multiple customer segments — missed some of them
3. Complicated B2B buying process — overlooked some stakeholders

### Rules of Thumb:
- **"If you aren't finding consistent problems and goals, you don't yet have a specific enough customer segment."** (p. 94)
- **"Good customer segments are a who-where pair. If you don't know where to go to find your customers, keep slicing your segment into smaller pieces until you do."** (p. 97)

### Software Engineering Lens:
This is about **user persona specificity** in product development. "Students" is not a useful persona — "non-native speaking PhD students preparing for conference talks" is. The customer slicing process directly applies to defining user stories: instead of "As a user, I want...", you need "As a [very specific person with specific context and motivation], I want...". Mixed, contradictory feedback from users almost always means your user segment is too broad, and you're effectively running multiple product experiments simultaneously.

---

## Chapter 8: Running the Process (Pages 99–111)

**Pages:** 99–111
**Title:** Running the Process

**Main Concept:** Even perfect questions fail without the right process. Avoid creating a "learning bottleneck" where one person holds all customer knowledge. Prep before conversations, review with your team after, and take good notes.

### Learning Bottleneck (Pages 99–100):
- When all customer learning is stuck in one person's head, you've created a de-facto dictator.
- **Symptoms:**
  - "You just worry about the product. I'll learn what we need to know."
  - "Because the customers told me so!"
  - "I don't have time to talk to people — I need to be coding!"

### Prepping (Pages 100–102):
- Know your 3 big questions. Face the scary ones.
- Know what commitment/next steps you'll push for.
- Spend up to an hour writing down best guesses about what the person cares about.
- Do desk research first — don't waste conversation time on things Google can answer.
- **Prep questions to unearth hidden risks:**
  - "If this company were to fail, why would it have happened?"
  - "What would have to be true for this to be a huge success?"

### Reviewing (Page 103):
- Review notes with your team after conversations.
- Update beliefs and 3 big questions.
- Discuss meta-level: which questions worked, which didn't, what to improve.

### Who Should Show Up (Pages 103–104):
- Two people is ideal: one talks, one takes notes.
- Everyone making big decisions (including tech) should attend *some* meetings.
- Don't outsource customer learning — founders must be in the room.

### Note-Taking System (Pages 105–108):
**12 Signal Symbols:**

| Symbol | Meaning |
|---|---|
| :) | Excited |
| :( | Angry |
| :\| | Embarrassed |
| ☇ | Pain or problem |
| ⚽ | Goal or job-to-be-done |
| ☐ | Obstacle |
| ⤴ | Workaround |
| ^ | Background or context |
| ☑ | Feature request or purchasing criteria |
| ＄ | Money or budgets or purchasing process |
| ♀ | Mentioned a specific person or company |
| ☆ | Follow-up task |

**Note-taking requirements:** sortable, combinable with team notes, permanent & retrievable, not mixed with other noise.

**Recommended media:** Google Docs spreadsheets, Evernote, index cards, or dedicated notebook.

### The Full Process (Pages 109–110):

**Before a batch of conversations:**
1. Choose a focused, findable segment
2. With your team, decide your big 3 learning goals
3. If relevant, decide on ideal next steps and commitments
4. Figure out who to talk to
5. Create best guesses about what the person cares about
6. Do desk research first for any answerable questions

**During the conversation:**
1. Frame the conversation
2. Keep it casual
3. Ask good questions which pass The Mom Test
4. Deflect compliments, anchor fluff, and dig beneath signals
5. Take good notes
6. If relevant, press for commitment and next steps

**After a batch of conversations:**
1. With your team, review notes and key customer quotes
2. Transfer notes into permanent storage
3. Update your beliefs and plans
4. Decide on the next 3 big questions

### Signs You're Just Going Through the Motions (Page 109):
- You're talking more than they are
- They are complimenting you or your idea
- You told them about your idea and don't know what's happening next
- You don't have notes
- You haven't looked through your notes with your team
- You got an unexpected answer and it didn't change your idea
- You weren't scared of any of the questions you asked
- You aren't sure which big question you're trying to answer

### Rules of Thumb:
- **"If you don't know what you're trying to learn, you shouldn't bother having the conversation."** (p. 102)
- **"Notes are useless if you don't look at them."** (p. 108)
- **"Go build your dang company already."** (p. 111)

### Software Engineering Lens:
This chapter is about **institutionalizing customer learning as a team discipline**. For engineering teams, the anti-pattern is having one "product person" who attends all user interviews and then dictates priorities. Instead, engineers should participate in discovery, notes should be shared artifacts (in Notion, Confluence, etc.), and the team should collectively update their understanding of user needs. The prep questions ("If this company were to fail, why?" / "What would have to be true for this to be a huge success?") are excellent for sprint retrospectives and product strategy sessions. The note-taking symbols provide a lightweight taxonomy for tagging user research findings.

---

## Conclusion & Cheatsheet (Pages 112–119)

**Pages:** 112–119

**Main Concept:** You'll still make mistakes — that's okay. Review with your team, improve as a team, and don't beat yourself up. Sometimes you can skip the process entirely and just "hack through the knot" — like the personal trainer who just called the police station instead of agonizing over interview methodology.

### Final Rule of Thumb:
- **"It's going to be okay."** (p. 112)

---

## Master Reference: All Rules of Thumb

| # | Rule of Thumb | Chapter | Page |
|---|---|---|---|
| 1 | Customer conversations are bad by default. It's your job to fix them. | 1 | 13 |
| 2 | Opinions are worthless. | 1 | 16 |
| 3 | Anything involving the future is an over-optimistic lie. | 1 | 16 |
| 4 | People will lie to you if they think it's what you want to hear. | 1 | 17 |
| 5 | People know what their problems are, but they don't know how to solve those problems. | 1 | 17 |
| 6 | You're shooting blind until you understand their goals. | 1 | 17 |
| 7 | Some problems don't actually matter. | 1 | 18 |
| 8 | Watching someone do a task will show you where the problems and inefficiencies really are, not where the customer thinks they are. | 1 | 18 |
| 9 | If they haven't looked for ways of solving it already, they're not going to look for (or buy) yours. | 1 | 19 |
| 10 | While it's rare for someone to tell you precisely what they'll pay you, they'll often show you what it's worth to them. | 1 | 20 |
| 11 | People want to help you, but will rarely do so unless you give them an excuse to do so. | 1 | 22 |
| 12 | Compliments are the fool's gold of customer learning: shiny, distracting, and entirely worthless. | 2 | 28 |
| 13 | Ideas and feature requests should be understood, but not obeyed. | 2 | 37 |
| 14 | If you've mentioned your idea, people will try to protect your feelings. | 2 | 38 |
| 15 | Anyone will say your idea is great if you're annoying enough about it. | 2 | 39 |
| 16 | The more you're talking, the worse you're doing. | 2 | 40 |
| 17 | You should be terrified of at least one of the questions you're asking in every conversation. | 3 | 41 |
| 18 | There's more reliable information in a "meh" than a "Wow!" You can't build a business on a lukewarm response. | 3 | 44 |
| 19 | Start broad and don't zoom in until you've found a strong signal, both with your whole business and with every conversation. | 3 | 50 |
| 20 | You always need a list of your 3 big questions. | 3 | 55 |
| 21 | Learning about a customer and their problems works better as a quick and casual chat than a long, formal meeting. | 4 | 57 |
| 22 | If it feels like they're doing you a favour by talking to you, it's probably too formal. | 4 | 59 |
| 23 | Give as little information as possible about your idea while still nudging the discussion in a useful direction. | 4 | 62 |
| 24 | "Customers" who keep being friendly but aren't ever going to buy are a particularly dangerous source of mixed signals. | 5 | 64 |
| 25 | If you don't know what happens next after a product or sales meeting, the meeting was pointless. | 5 | 65 |
| 26 | The more they're giving up, the more seriously you can take their kind words. | 5 | 66 |
| 27 | It's not a real lead until you've given them a concrete chance to reject you. | 5 | 72 |
| 28 | In early stage sales, the real goal is learning. Revenue is just a side-effect. | 5 | 74 |
| 29 | If it's not a formal meeting, you don't need to make excuses about why you're there or even mention that you're starting a business. Just have a good conversation. | 6 | 77 |
| 30 | If it's a topic you both care about, find an excuse to talk about it. Your idea never needs to enter the equation. | 6 | 77 |
| 31 | Kevin Bacon's 7 degrees of separation applies to customer conversations. You can find anyone you need if you ask for it a couple times. | 6 | 81 |
| 32 | If you aren't finding consistent problems and goals, you don't yet have a specific enough customer segment. | 7 | 94 |
| 33 | Good customer segments are a who-where pair. If you don't know where to go to find your customers, keep slicing your segment into smaller pieces until you do. | 7 | 97 |
| 34 | If you don't know what you're trying to learn, you shouldn't bother having the conversation. | 8 | 102 |
| 35 | Notes are useless if you don't look at them. | 8 | 108 |
| 36 | Go build your dang company already. | 8 | 111 |
| 37 | It's going to be okay. | Conclusion | 112 |
| 38 | Keep having conversations until you stop hearing new stuff. | 6 | 89 |

---

## Software Engineering Application: Quick Reference

| Mom Test Concept | Software Engineering Equivalent |
|---|---|
| Talk about their life, not your idea | Observe current workflows before proposing solutions |
| Ask about specifics in the past | "Show me the last time this bug/issue happened" |
| Compliments are worthless | "Looks great in the demo" ≠ will actually adopt |
| Anchor fluff to specifics | "We'd love an API" → "When did you last need one? What did you do instead?" |
| Dig beneath feature requests | Understand the job-to-be-done, not the stated requirement |
| Product risk vs. market risk | Technical feasibility vs. user demand — validate both |
| Commitment = real signal | Design partners who allocate engineering time > those who "love the roadmap" |
| Customer slicing | Specific user personas with findable, reachable populations |
| Premature zoom | Don't spec out microservices before validating the core value proposition |
| The learning bottleneck | Share discovery findings across the whole team, not just product |
| Prepare your 3 big questions | Before every user interview, know what assumptions you're testing |
| "Would you buy this?" is a bad question | "How do you solve this today?" is a good one |

---

*This summary was prepared for use as an LLM context document. It covers all 8 chapters, the introduction, and conclusion of The Mom Test by Rob Fitzpatrick, with every rule of thumb catalogued by chapter and page number, and each chapter analyzed through the lens of software engineering and requirements discovery.*