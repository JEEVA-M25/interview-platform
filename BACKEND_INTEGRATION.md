# CareerVerse AI Frontend Backend Integration Guide

This document describes the backend contract expected by the redesigned frontend.

## General principles

- Do not display fabricated data.
- Until the backend is available, the UI should show 0, 0%, or "No data available".
- All dashboard sections should be able to render loading, empty, success, and error states gracefully.

## Shared response conventions

### Success response

```json
{
  "success": true,
  "data": {}
}
```

### Error response

```json
{
  "success": false,
  "message": "Unable to load data"
}
```

### Loading state

The frontend should show a loading indicator while the request is pending.

---

## Student Dashboard

### Purpose

Provide the student overview screen with empty-state friendly metrics and next actions.

### Required endpoint

- GET /dashboard/overview

### HTTP method

- GET

### Request

No body.

### Response JSON

```json
{
  "atsScore": 0,
  "resumeCount": 0,
  "applicationCount": 0,
  "profileCompletion": 0
}
```

### Fields required

- atsScore: number
- resumeCount: number
- applicationCount: number
- profileCompletion: number

### Error responses

```json
{
  "success": false,
  "message": "Unable to load dashboard overview"
}
```

### Loading state

Show skeleton or disabled cards while the request is pending.

---

## Student Dashboard Activity

### Purpose

Render recent activity for the student workspace.

### Required endpoint

- GET /dashboard/activity

### HTTP method

- GET

### Request

No body.

### Response JSON

```json
[]
```

### Example response

```json
[
  {
    "id": 1,
    "title": "Resume uploaded",
    "createdAt": "2026-07-05T10:00:00Z"
  }
]
```

### Fields required

- id: number
- title: string
- createdAt: string

---

## Student Dashboard Recommendations

### Purpose

Render helpful recommendations for the student.

### Required endpoint

- GET /dashboard/recommendations

### HTTP method

- GET

### Request

No body.

### Response JSON

```json
[]
```

### Example response

```json
[
  {
    "id": 1,
    "title": "Complete your profile",
    "description": "Add your experience and education"
  }
]
```

---

## Student Profile

### Purpose

Load and update the student profile form.

### Required endpoint

- GET /dashboard/profile
- PUT /dashboard/profile

### HTTP method

- GET / PUT

### Request

```json
{
  "fullName": "",
  "phone": "",
  "college": "",
  "degree": "",
  "graduationYear": "",
  "portfolioUrl": "",
  "linkedinUrl": "",
  "careerGoal": ""
}
```

### Response JSON

```json
{
  "name": "",
  "email": "",
  "avatar": "",
  "completion": 0
}
```

### Fields required

- name: string
- email: string
- avatar: string
- completion: number

---

## Admin Dashboard

### Purpose

Provide the admin overview and summary metrics.

### Required endpoint

- GET /admin/dashboard

### HTTP method

- GET

### Request

No body.

### Response JSON

```json
{
  "studentCount": 0,
  "analysisCount": 0,
  "jobMatchCount": 0
}
```

### Fields required

- studentCount: number
- analysisCount: number
- jobMatchCount: number

---

## Student List

### Purpose

Display the list of registered students to an admin.

### Required endpoint

- GET /admin/students

### HTTP method

- GET

### Request

No body.

### Response JSON

```json
[]
```

### Example response

```json
[
  {
    "id": 1,
    "fullName": "Asha Rao",
    "email": "asha@example.com",
    "college": "ABC College",
    "degree": "B.Tech",
    "graduationYear": 2026
  }
]
```

---

## ATS Module

### Purpose

Analyze an uploaded resume and return ATS-related insights.

### Required endpoint

- POST /ai/ats-score

### HTTP method

- POST

### Request

Multipart form data containing:

- resume: file

### Response JSON

```json
{
  "score": 0,
  "summary": "",
  "strengths": [],
  "improvements": [],
  "keywords": []
}
```

### Fields required

- score: number
- summary: string
- strengths: array of strings
- improvements: array of strings
- keywords: array of strings

### Error responses

```json
{
  "success": false,
  "message": "Resume analysis failed"
}
```

---

## JD Matching

### Purpose

Compare a resume against a job description and return a skill-gap report.

### Required endpoint

- POST /ai/skill-gap

### HTTP method

- POST

### Request

Multipart form data containing:

- resume: file
- jobDescription: string

### Response JSON

```json
{
  "matchScore": 0,
  "summary": "",
  "matchedSkills": [],
  "missingSkills": [],
  "actionPlan": []
}
```

### Fields required

- matchScore: number
- summary: string
- matchedSkills: array of strings
- missingSkills: array of strings
- actionPlan: array of strings

---

## Applications

### Purpose

Show the student’s application pipeline.

### Required endpoint

- GET /applications

### HTTP method

- GET

### Response JSON

```json
[]
```

### Example response

```json
[
  {
    "id": 1,
    "company": "Google",
    "role": "Software Engineer",
    "status": "Applied"
  }
]
```

---

## Settings

### Purpose

Render account preferences and profile-related settings.

### Required endpoint

- GET /settings

### HTTP method

- GET

### Response JSON

```json
{
  "profileVisibility": "private",
  "remindersEnabled": false
}
```

### Fields required

- profileVisibility: string
- remindersEnabled: boolean

---

## Resume Analysis

### Purpose

Display the latest resume analysis record.

### Required endpoint

- GET /resumes/analysis

### HTTP method

- GET

### Response JSON

```json
{
  "resumeId": 0,
  "atsScore": 0,
  "updatedAt": ""
}
```

### Fields required

- resumeId: number
- atsScore: number
- updatedAt: string

---

## UI readiness notes

- The frontend is ready to consume real data from each endpoint.
- Empty state messages should remain visible until valid data is returned.
- All cards, sections, and tables should support loading and empty states without layout breakage.
