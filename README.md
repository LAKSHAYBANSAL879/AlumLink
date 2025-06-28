# 🌐 Alum Link

**Alum Link** is a full-stack alumni engagement platform built on the **MERN stack**, designed to foster collaboration, learning, job opportunities, and meaningful connections within alumni communities. It features intelligent tools like **smart resume parsing**, **blog recommendation systems**, and **real-time messaging**, creating a complete ecosystem for students and  alumni.
---

## 🚀 Live Deployment

- 🌍 **Frontend (Vercel):** [alumlink.vercel.app](https://alum-link-beige.vercel.app/)
- ⚙️ **Backend (Render):** Hosted with autoscaling APIs and socket server
- ✅ Ready for **CI/CD integration**

---

## ✨ Key Features

### 🧳 Job Portal
> Empowering alumni with relevant job opportunities

- Employers can **post jobs** with detailed criteria.
- Candidates can **apply** and check **skill-match** score.
- Resume Parsing using **Python NLP** extracts skills, education, experience.
- **Skill Score Evaluation** ensures only suitable applicants proceed.
- Employer Dashboard shows:
  - Total applicants
  - Skill-match score list
  - Resume view/download
- Student Dashboard shows:
  - Status of recent Job application
  - Saved jobs for future
  - Upcoming interview schedule
    

### ✍️ Blog Portal
> Share knowledge, learn and discover

- Alumni and students can **create blogs** with Markdown support.
- Blogs feature likes, comments, tags, and reading time.
- Real time dashboard to track performance of self posted blogs
- Interactive dashboard with other features also
- Integrated **Python-powered Recommendation System**:
  - Based on TF-IDF / NLP
  - Personalized suggestions based on likes and on individual blog also
  - User interest learning over time

### 💬 Chat/Connect Portal
> 1-to-1 Real-Time Communication

- Powered by **Socket.IO** for low-latency communication.
- Features include:
  - 😄 Emoji support
  - 📁 File sharing (PDF, DOC, etc.)
  - 🎤 Audio messages
  - 🎥 Short video clips
- Encrypted one-to-one chat with typing indicators and message receipts.

### 💖 Donation Portal
> Give back to the community

- Integrated with **Stripe** for secure payments.
- User can contribute to various schemes by fellow user
- Real time staus update by admin if donation request is real or not
- User can also check request based on provided supported documents 
- Real-time updates on donation goals and progress dashboards.
- Full **transaction history** for users and admin.


### 📊 Interactive Dashboards
> Tailored views based on role

- **Admin Dashboard**:
  - User statistics
  - Donations overview
  - Blog & job moderation
- **Alumni/Student Dashboard**:
  - Personalized blog feed
  - Saved jobs, skill score
  - Chat shortcuts
- **Employer Dashboard**:
  - Job posting analytics
  - Applicant ranking table
  - Resume viewer

### 🧠 Smart Systems

#### 📄 Resume Parser & Skill Score (Python + NLP)
- Extracts skills and experience.
- Matches with job JD using cosine similarity.
- Outputs a resume compatibility score.

#### 🧾 Blog Recommendation Engine
- TF-IDF and NLP-based similarity models.
- Personalized based on liking history.

---

## 🔐 Authentication & Authorization

- 🔒 **JWT** for secure route access
- 🌐 **Google OAuth** login enabled
- 🎓 **Enrollment Verification System**:
  - Validates users against existing records
  - Ensures authenticity before registration

---

## 🔔 Real-Time Notification System

Get notified when:

- You receive a message
- Someone interacts with your blog
- Your donation is processed
- Job applications are updated
- 
> Notifications delivered via toast pop-ups and persistent dashboard alerts.

---

## 💳 Stripe Test Credentials
Card number: 4000 0035 6000 0008

## Some enrollment numbers in record needed for new signup

- ENR7459,ENR41111,ENR36210,ENR42759,ENR64427
- Just mail admin if want to register new record to database

---

## ⚙️ Technologies Used

| Layer           | Stack                                                   |
|----------------|----------------------------------------------------------|
| **Frontend**    | React.js, Material UI, Tailwind CSS, Lucide Icons       |
| **Backend**     | Node.js, Express.js, MongoDB                            |
| **Auth**        | JWT, Google OAuth2                                      |
| **Storage**     | Cloudinary (images, files, media)                       |
| **Payment**     | Stripe                                                  |
| **Real-time**   | Socket.IO                                               |
| **ML/NLP**      | Python (Spacy, NLTK, Scikit-learn)                      |
| **Hosting**     | Vercel (Frontend), Render (Backend & Socket.IO)         |

---

## 🧑‍💻 Developer Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/alum-link.git
cd alum-link
```

### 2. Install Client & Server Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Python ML Scripts

```bash
cd ../python-scripts
pip install -r requirements.txt
```

### 4. Environment Variables

Create `.env` files in both `/client` and `/server` folders:


### 5. Run Dev Mode

```bash
concurrently "npm run dev --prefix server" "npm start --prefix client"
```

---


## 🙌 Contribution Guidelines

- Fork the repo.
- Create a new branch (`feature/your-feature`).
- Commit your changes and open a PR.

---


## 🧩 Future Improvements

- Admin analytics via chart libraries
- AI-based job suggestions
- Email notifications
- Chatbot assistant for alumni support
- Imrovement in job interview scheduling with automatic scheduler and inbuilt video call feature also

---
## Feel free to share your valuable suggestions and changes
