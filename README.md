<div align="center">

# JobZ

**A job board for Nigeria.** Job seekers search, apply with their CV and track every application.
Employers post jobs and move candidates from review to interview, with every update emailed automatically.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/DRF-3.16+-A30000)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)

![JobZ home page](docs/screenshots/home.jpg)

</div>

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running the tests](#running-the-tests)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Author](#author)

## Features

### For job seekers
- **Search and filter** by keyword, city, category, work setup (on-site, hybrid, remote), job type, experience level and salary. Sort by newest or highest pay.
- **Shareable searches.** Every filter is kept in the URL, so a search can be bookmarked or sent to a friend.
- **Apply in a minute** with a CV upload (PDF or Word, up to 5 MB) or a link to one. No account required.
- **Save jobs** for later with one click.
- **Track applications** on a dashboard that shows each one's progress: submitted, in review, shortlisted, interview, offer.
- **Email confirmations** when you apply and whenever your status changes.

### For employers
- **Free sign-up** with a company profile (name, logo, website, description).
- **Post jobs** with a salary range, requirements, benefits and an optional closing date. Jobs close automatically after the deadline.
- **Edit, close or reopen** any job from the dashboard.
- **Review applicants** for each job: download CVs, read cover letters, keep private notes, and filter by status.
- **Move candidates through the pipeline.** Changing a status emails the candidate for you.
- **See how each job performs** with applicant and view counts.

### Under the hood
- CVs are private. They are stored with unguessable names and can only be downloaded by the hiring employer through an authenticated endpoint.
- Rate limits on sign-in, applications and the contact form, plus a spam trap on the contact form.
- Google for Jobs structured data on every job page, plus a sitemap and robots.txt.
- A Django admin for managing jobs, companies, applications, users and contact messages.
- Responsive down to small phones, keyboard accessible, and respects reduced-motion settings.

## Screenshots

| Browse and filter jobs | Job details |
| --- | --- |
| ![Jobs page with filters](docs/screenshots/jobs.jpg) | ![Job detail page](docs/screenshots/job-detail.jpg) |
| **Apply with a CV** | **Seeker dashboard** |
| ![Application form](docs/screenshots/apply.jpg) | ![Job seeker dashboard](docs/screenshots/seeker-dashboard.jpg) |
| **Employer dashboard** | **Review applicants** |
| ![Employer dashboard](docs/screenshots/employer-dashboard.jpg) | ![Applicants page](docs/screenshots/applicants.jpg) |

<details>
<summary>Mobile</summary>
<br>
<img src="docs/screenshots/mobile-home.jpg" alt="JobZ home page on a phone" width="320">
</details>

## Tech stack

| Part | Built with |
| --- | --- |
| Frontend | [Next.js 15](https://nextjs.org) (App Router), React 19, [Tailwind CSS 4](https://tailwindcss.com), [lucide-react](https://lucide.dev) icons |
| Backend | [Django 5.2](https://www.djangoproject.com), [Django REST Framework](https://www.django-rest-framework.org), [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io), django-cors-headers |
| Database | SQLite for local development, PostgreSQL in production |
| Serving | Gunicorn + WhiteNoise for the API |

The frontend and backend are separate apps that talk over a JSON API. The Next.js pages are rendered on the server for fast loading and good SEO; signed-in features (dashboards, saving jobs, applying) call the API from the browser using JWT tokens.

## Getting started

### Prerequisites

- **Python 3.11** or newer
- **Node.js 20** or newer
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Andirell/capstone-project.git
cd capstone-project
```

### 2. Start the API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py seed_jobs --demo
python manage.py createsuperuser  # optional: an account for the admin site
python manage.py runserver
```

The API is now running at **http://localhost:8000/api/** and the admin at **http://localhost:8000/admin/**.

`seed_jobs` loads 6 categories and 62 sample jobs. The `--demo` flag also creates two accounts you can sign in with:

| Role | Email | Password |
| --- | --- | --- |
| Employer (owns TechNova) | `employer@jobz.demo` | `JobZdemo2026!` |
| Job seeker | `seeker@jobz.demo` | `JobZdemo2026!` |

> [!WARNING]
> Don't run `seed_jobs --demo` on a public site. The demo password is published here.

Until you configure an email server, emails (application confirmations, status updates) are printed in the terminal running the API.

### 3. Start the website

In a second terminal, from the project root:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000**.

## Environment variables

Both apps work locally without changing anything. For production, set these.

### Website (`.env.local`)

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.jobz.ng/api` | Where the browser reaches the API |
| `NEXT_PUBLIC_SITE_URL` | `https://jobz.ng` | The site's own address, for SEO links and the sitemap |

### API (`backend/.env`)

| Variable | Required in production | Purpose |
| --- | --- | --- |
| `DJANGO_DEBUG` | yes (`False`) | Turns off debug mode and turns on security settings |
| `DJANGO_SECRET_KEY` | yes | Generate one with `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DJANGO_ALLOWED_HOSTS` | yes | The API's domain, e.g. `api.jobz.ng` |
| `DATABASE_URL` | yes | e.g. `postgres://user:password@host:5432/jobz`. Leave empty for SQLite |
| `FRONTEND_URL` | yes | The website's address. Used for CORS and links in emails |
| `CORS_ALLOWED_ORIGINS` | no | Extra allowed website origins, comma-separated |
| `DJANGO_MEDIA_ROOT` | recommended | Folder for uploaded CVs. Must be on a persistent disk |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` | for email | Your SMTP provider's settings |
| `DEFAULT_FROM_EMAIL` | for email | e.g. `JobZ <no-reply@jobz.ng>` |
| `SITE_ADMIN_EMAIL` | no | Receives contact-form messages |

Templates for both files are in [`.env.example`](.env.example) and [`backend/.env.example`](backend/.env.example).

## Running the tests

```bash
cd backend
python manage.py test
```

The test suite covers searching and filtering, applying (including file-type and size checks and duplicate applications), sign-up and sign-in, employer permissions, the applicant pipeline and its emails, private CV downloads, saved jobs and the contact form.

## API reference

All endpoints live under `/api/`. Signed-in requests send the header `Authorization: Bearer <access token>`, which you get from `/api/auth/login/` or `/api/auth/register/`.

<details>
<summary><strong>Jobs and lookups</strong></summary>

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/jobs/` | Public | List open jobs (paginated, 12 per page) |
| `GET` | `/jobs/<slug>/` | Public | One job |
| `GET` | `/jobs/<slug>/related/` | Public | Up to 4 similar jobs |
| `GET` | `/jobs/locations/` | Public | Cities with open jobs, with counts |
| `GET` | `/categories/` | Public | Categories with open-job counts |
| `GET` | `/companies/`, `/companies/<slug>/` | Public | Companies and their open-job counts |
| `GET` | `/stats/` | Public | Totals shown on the home page |

**Filters for `GET /jobs/`:**

| Parameter | Example | Notes |
| --- | --- | --- |
| `q` | `react developer` | Matches title, company, description, requirements, location and category |
| `category` | `technology-and-it` | Category slug |
| `company` | `technova` | Company slug |
| `location` | `lagos` | Partial match |
| `work_mode` | `remote,hybrid` | `onsite`, `hybrid`, `remote` |
| `job_type` | `full_time` | `full_time`, `part_time`, `contract`, `internship` |
| `experience_level` | `mid,senior` | `entry`, `mid`, `senior`, `lead` |
| `salary_min` | `5000` | Jobs whose range reaches at least this amount |
| `featured` | `true` | Featured jobs only |
| `posted_within` | `7` | Posted in the last N days |
| `ordering` | `-created_at` | Also `-salary_max`, `salary_min`, `title` |
| `page`, `page_size` | `2`, `24` | `page_size` up to 50 |

</details>

<details>
<summary><strong>Applying and saving</strong></summary>

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/jobs/<slug>/apply/` | Public | Multipart form: `full_name`, `email`, `phone`, `resume` (file) **or** `resume_link`, `portfolio_link`, `cover_letter`. Signed-in seekers can skip name and email |
| `POST` | `/jobs/<slug>/save/` | Job seeker | Save a job |
| `DELETE` | `/jobs/<slug>/save/` | Job seeker | Unsave it |
| `GET` | `/me/applications/` | Job seeker | Your applications and their status |
| `GET` | `/me/saved-jobs/` | Job seeker | Your saved jobs |

</details>

<details>
<summary><strong>Accounts</strong></summary>

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register/` | Public | `full_name`, `email`, `password`, `role` (`seeker` or `employer`), `company_name` (employers) |
| `POST` | `/auth/login/` | Public | `email`, `password`. Returns `access`, `refresh` and `user` |
| `POST` | `/auth/refresh/` | Public | `refresh`. Returns a new `access` token |
| `GET`, `PATCH` | `/auth/me/` | Signed in | Your profile |
| `GET`, `PATCH` | `/auth/me/company/` | Employer | Your company profile |
| `POST` | `/auth/change-password/` | Signed in | `current_password`, `new_password` |

</details>

<details>
<summary><strong>Employers</strong></summary>

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/jobs/` | Employer | Post a job |
| `PATCH` | `/jobs/<slug>/` | Job's owner | Edit it, or close it with `{"is_active": false}` |
| `DELETE` | `/jobs/<slug>/` | Job's owner | Delete it |
| `GET` | `/employer/jobs/` | Employer | Your jobs, including closed ones, with applicant counts |
| `GET` | `/employer/applications/?job=<slug>&status=<status>` | Employer | Applicants for your jobs |
| `PATCH` | `/employer/applications/<id>/` | Employer | Update `status` and `employer_notes` |
| `GET` | `/employer/applications/<id>/resume/` | Employer | Download the applicant's CV |

Application statuses: `submitted`, `reviewing`, `shortlisted`, `interview`, `offered`, `hired`, `rejected`.

</details>

<details>
<summary><strong>Other</strong></summary>

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/contact/` | Public | `name`, `email`, `subject`, `message` |
| `GET` | `/health/` | Public | Returns `{"status": "ok"}` for uptime checks |

</details>

## Project structure

```
capstone-project/
├── backend/                     Django API
│   ├── config/                  Settings and URL routing
│   ├── accounts/                Users (email sign-in, seeker or employer), JWT auth
│   ├── jobs/                    Categories, companies, jobs, applications, saved jobs
│   │   ├── views.py             All the job endpoints
│   │   ├── emails.py            Emails sent to applicants and employers
│   │   ├── tests.py             API tests
│   │   ├── data/seed_jobs.json  Sample data loaded by `seed_jobs`
│   │   └── management/          The `seed_jobs` command
│   ├── contact/                 Contact-form messages
│   ├── requirements.txt
│   ├── build.sh                 Build script for hosting platforms
│   └── Procfile
├── src/                         Next.js website
│   ├── app/                     Pages: home, jobs, job detail, companies, about,
│   │                            contact, log in / sign up, dashboards
│   ├── components/              Reusable parts: navbar, job card, filters, forms, dashboards
│   └── lib/
│       ├── api.js               Functions for calling the Django API
│       ├── auth.js              Keeps the login token and adds it to requests
│       ├── format.js            Formats salaries and dates
│       └── constants.js         Lists used in dropdowns and filters
├── docs/screenshots/            Images used in this README
└── package.json
```

## Deployment

The two apps deploy separately.

**API** on [Render](https://render.com), [Railway](https://railway.app) or similar:

1. Create a PostgreSQL database and a Python web service pointing at the `backend` folder.
2. Set the [environment variables](#api-backendenv) above.
3. Build command: `./build.sh` (installs packages, collects static files, runs migrations and loads the starter jobs).
4. Start command: `gunicorn config.wsgi`.
5. Attach a persistent disk and point `DJANGO_MEDIA_ROOT` at it, so uploaded CVs survive restarts.
6. Create an admin account with `python manage.py createsuperuser` from the service's shell.

**Website** on [Vercel](https://vercel.com):

1. Import the repository. Vercel detects Next.js automatically.
2. Set `NEXT_PUBLIC_API_URL` to your API's `/api` address and `NEXT_PUBLIC_SITE_URL` to the site's own address.
3. Deploy, then add the site's address to the API's `FRONTEND_URL`.

## Author

Built by **DevAndi** ([@Andirell](https://github.com/Andirell)).

Questions or feedback: open an [issue](https://github.com/Andirell/capstone-project/issues).
