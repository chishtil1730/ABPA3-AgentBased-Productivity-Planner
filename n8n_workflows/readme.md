# 🔗 n8n Workflows Documentation

This directory contains **visual documentation of core n8n workflows** used in the project.  
Each workflow follows a **single-responsibility design** and uses LLMs only where reasoning is required.

All workflows are designed to be:
- Local-first where possible
- Tool-isolated
- Easily extensible

---

## 1️⃣ Mail Auto Categorize (Single Workflow)

![Mail Auto Categorize](mail_auto_catogorize.png)

### 🎯 Purpose
Automatically classify incoming Gmail messages and apply appropriate labels
without relying on brittle rule-based filters.

---

### 🔁 How It Works

1. **Gmail Trigger**
   - Activates when a new email is received.

2. **Text Classifier (LLM-powered)**
   - Uses a chat model to semantically analyze email content.
   - Outputs one of the predefined categories:
     - Newsletter
     - Promotions
     - Subscriptions
     - OTPs
     - Materials (starred)
     - Security alerts

3. **Category Routing**
   - Each category output is routed to its own Gmail action node.
   - The corresponding Gmail label is applied.

4. **Post-processing**
   - Email is marked as read after labeling.

---

### 🧠 Why This Design?
- LLM handles ambiguous email content better than regex
- Adding new categories requires **no logic rewrite**
- Keeps inbox clean with minimal maintenance

---

## ⚙️ Text Classifier Settings

![Text Classifier Settings](text_classifier_settings.png)

### Purpose
Defines the semantic meaning of each classification category.

### Key Details
- Each category has:
  - A name (e.g., OTPs, Security alerts)
  - A short natural-language description
- These descriptions guide the LLM’s decision-making

### Design Insight
> The classifier works because **the model is told what each label means**, not just what it’s called.

---

## 2️⃣ Auto Mail (Extractor + Writer Workflow)

![Auto Mail](auto_mail.png)

### 🎯 Purpose
Convert free-form chat messages into **structured, well-written emails**
and send them automatically.

---

### 🔁 How It Works

1. **Chat Trigger**
   - Fires when a user sends a message.

2. **Mail Extractor Agent**
   - Extracts structured fields:
     - Recipient
     - Subject
     - Intent
     - Key points

3. **Mail Writer Agent**
   - Generates a polished email body
   - Adapts tone based on context

4. **Merge Node**
   - Combines extracted data and generated content.

5. **Send Message (Gmail)**
   - Sends the final email.

---

### 🧠 Why This Design?
- Separates *understanding* from *writing*
- Improves reliability and debuggability
- Easier to swap models independently

---

## 3️⃣ Simple Chat Bot

![Simple Chat Bot](simple_chat_bot.png)

### 🎯 Purpose
A minimal conversational agent with memory.

---

### 🔁 How It Works

1. **Chat Trigger**
2. **AI Agent**
   - Uses an Ollama chat model
   - Maintains short-term memory

---

### 🧠 Why This Design?
- Baseline conversational agent
- Useful for testing prompts, memory, and latency
- Foundation for more complex agents

---

## 4️⃣ Task Extractor

![Task Extractor](task_extractor.png)

### 🎯 Purpose
Extract actionable tasks from natural language messages.

---

### 🔁 How It Works

1. **Chat Trigger**
2. **Task Extractor Agent**
   - Identifies:
     - Task title
     - Intent
     - Implied action
   - Outputs structured task data

---

### 🧠 Why This Design?
- Clean separation between chat and task logic
- Prevents accidental task creation
- Enables downstream validation

---

## 5️⃣ Task Scheduler (Single Workflow)

![Task Scheduler](task_scheduler.png)

### 🎯 Purpose
Convert user intent into **calendar-aware scheduled tasks**.

---

### 🔁 How It Works

1. **Chat Trigger**
2. **AI Agent**
   - Understands intent and timing
   - Decides whether scheduling is needed

3. **Get Availability**
   - Queries calendar for free slots

4. **Add Task**
   - Creates a calendar event

5. **Send Confirmation**
   - Confirms task creation via Gmail

---

### 🧠 Why This Design?
- Keeps scheduling logic centralized
- Avoids double-booking
- Makes time an explicit system constraint

---

## 🧩 Architectural Takeaways

- **LLMs reason, tools act**
- Split extraction from execution
- Prefer routing over branching logic
- Natural language descriptions outperform rigid rules

---

