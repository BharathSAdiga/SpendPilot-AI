# User Interview Summaries

*Note: Conducted with classmates and student developers to validate the core problem of AI software sprawl.*

## Interview 1: "The Coding Assistant Overlap"
- **Name:** Atharv
- **Role:** CS Student & Full-stack Developer
- **Context:** Individual Student Project

**Direct Quotes:**
- *"I'm currently paying for GitHub Copilot because it's standard, but I also bought a month of Cursor to try out their composer features."*
- *"I definitely don't need both, but I keep forgetting to cancel Copilot because it's tied to my GitHub account."*
- *"As a student, $20/month is basically four meals. I need to know which one I'm actually using more."*

**Surprising Insight:**
Student developers often experiment with multiple "Coding Assistants" (Copilot vs. Cursor vs. Supermaven) at once and end up paying for overlapping capabilities without a clear winner.

**Product Changes Made:**
Refined the `overlapping-tools` rule to specifically flag multiple Coding Assistants. The engine now prioritizes recommending a single "Best in Class" tool to prevent redundant $20/mo subscriptions.

---

## Interview 2: "The Forgotten Subscription"
- **Name:** Chiranthan
- **Role:** Student & Tech Enthusiast
- **Context:** Project-based Learning

**Direct Quotes:**
- *"I used ChatGPT Plus for a month when I was working on my final year project, but the project is over now and I'm still being charged."*
- *"I wish there was a way to see all my AI spend in one place because it's scattered across different emails and cards."*
- *"I didn't realize that switching to a Free plan for some of these tools would still give me 90% of what I need for basic study."*

**Surprising Insight:**
Many users don't realize how much utility they can get from "Free Tiers" of premium AI tools once their peak project intensity subsides.

**Product Changes Made:**
Added the `downgrade-to-free` recommendation logic. The engine now checks if the user's current spend on a specific tool is justifiable for their current "Team Size" and use case, or if a $0/mo plan is a more efficient choice.
