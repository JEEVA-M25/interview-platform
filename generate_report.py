import docx
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_margins(cell, **kwargs):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m in ["top", "start", "bottom", "end"]:
        if m in kwargs:
            node = OxmlElement(f"w:{m}")
            node.set(qn('w:w'), str(kwargs[m]))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
    tcPr.append(tcMar)

doc = docx.Document()

# Set margins to 0.75 inches for IEEE
sections = doc.sections
for section in sections:
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(0.63)
    section.right_margin = Inches(0.63)

# Add title
title = doc.add_heading('CareerVerse AI: An AI-Driven Platform for Interview Preparation and Placement Readiness Assessment', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
for run in title.runs:
    run.font.size = Pt(22)
    run.font.name = 'Times New Roman'
    run.font.color.rgb = docx.shared.RGBColor(0, 0, 0)
    run.font.bold = True

doc.add_paragraph('\n')

# Authors Table (5 columns)
table = doc.add_table(rows=1, cols=5)
table.alignment = WD_ALIGN_PARAGRAPH.CENTER
table.autofit = True

authors_data = [
    ("Prof. Guide Name", "Assistant Professor", "guide.email@college.edu"),
    ("Student One", "UG Scholar", "student1@college.edu"),
    ("Student Two", "UG Scholar", "student2@college.edu"),
    ("Student Three", "UG Scholar", "student3@college.edu"),
    ("Student Four", "UG Scholar", "student4@college.edu"),
]

for idx, data in enumerate(authors_data):
    cell = table.cell(0, idx)
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run1 = p.add_run(data[0] + '\n')
    run1.font.size = Pt(10)
    run1.font.name = 'Times New Roman'
    run1.font.bold = True
    
    run2 = p.add_run('Computer Science and Engineering\nSri Krishna College of Engineering and Technology\nCoimbatore, India\n' + data[2])
    run2.font.size = Pt(9)
    run2.font.name = 'Times New Roman'

doc.add_paragraph('\n')

# Convert section to two columns using a continuous section break
from docx.enum.section import WD_SECTION
new_section = doc.add_section(WD_SECTION.CONTINUOUS)
sectPr = new_section._sectPr
cols = sectPr.xpath('./w:cols')[0]
cols.set(qn('w:num'), '2')
cols.set(qn('w:space'), '400') 

def add_heading(text, level=1):
    heading = doc.add_heading(text, level=level)
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER if level == 1 else WD_ALIGN_PARAGRAPH.LEFT
    for run in heading.runs:
        run.font.size = Pt(10)
        run.font.name = 'Times New Roman'
        run.font.color.rgb = docx.shared.RGBColor(0, 0, 0)
        run.font.bold = True
        if level == 1:
            run.font.small_caps = True

def add_paragraph(text, italic=False, bold=False):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    run = p.add_run(text)
    run.font.size = Pt(10)
    run.font.name = 'Times New Roman'
    run.italic = italic
    run.bold = bold
    return p

# Abstract
abstract_heading = doc.add_heading('Abstract—', level=1)
for run in abstract_heading.runs:
    run.font.size = Pt(10)
    run.font.name = 'Times New Roman'
    run.font.bold = True
    run.font.italic = True
abstract_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

abstract_text = 'The modern job market requires candidates to possess not only strong technical skills but also refined communication and interview capabilities. This paper presents CareerVerse AI, a comprehensive AI-powered placement preparation platform designed to help students evaluate and improve their placement readiness. The system provides an end-to-end workflow featuring resume management, Applicant Tracking System (ATS) analysis, resume-to-job matching, and dynamic AI-driven mock interviews. Leveraging the Gemini Large Language Model (LLM) for evaluation, Groq for Speech-to-Text (STT), Sarvam AI for Text-to-Speech (TTS), and a pretrained Wav2Vec2 model for asynchronous speech emotion recognition, the platform delivers real-time, multimodal feedback to the candidate. We further detail the implementation of a rule-based Placement Readiness scoring system and a personalized study guide generator based on historical performance metrics. The platform is built using a React frontend and a Spring Boot backend, ensuring robust data handling and secure user isolation. By aggregating performance across multiple dimensions, CareerVerse AI offers a holistic approach to career preparation for software engineering students.'
p = add_paragraph(abstract_text)
for run in p.runs:
    run.font.size = Pt(9)
    run.font.italic = True
    run.font.bold = True

add_paragraph('Keywords—AI Mock Interview, Placement Readiness, ATS Analysis, Speech Emotion Recognition, Gemini LLM, Wav2Vec2.', italic=True)

# I. Introduction
add_heading('I. INTRODUCTION')
add_paragraph('Securing a software engineering position in today\'s highly competitive industry requires comprehensive preparation that extends beyond core academic knowledge. Candidates must construct ATS-optimized resumes, ensure their skills align with target job descriptions, and demonstrate technical proficiency and confidence during high-pressure interviews. Traditional preparation methods, such as peer mock interviews or generic resume templates, often lack the targeted, data-driven feedback necessary for effective improvement.')
add_paragraph('CareerVerse AI addresses this gap by providing an intelligent, unified platform for placement preparation. Rather than treating resume building, job matching, and interview practice as isolated tasks, the system integrates these steps into a continuous feedback loop. A candidate can upload a resume, receive an immediate ATS score, and proceed to a dynamic AI mock interview tailored to their chosen role.')
add_paragraph('To ensure the platform remains accessible and performant, we designed a scalable architecture comprising a React frontend, a Spring Boot backend, and a Python FastAPI microservice dedicated to machine learning tasks. All generated data is persisted in a MySQL database, culminating in a transparent, rule-based Placement Readiness score that guides the candidate\'s future preparation efforts.')

# II. Problem Statement
add_heading('II. PROBLEM STATEMENT')
add_paragraph('University students and fresh graduates frequently struggle to bridge the gap between academic learning and industry expectations. Specifically, they face three major challenges:')
add_paragraph('1) Resume Rejection: Many candidates are eliminated early in the hiring process due to resumes that are not optimized for Applicant Tracking Systems (ATS).')
add_paragraph('2) Lack of Interview Practice: Access to expert interviewers for mock sessions is limited. Consequently, candidates cannot practice answering dynamic, role-specific questions or receive immediate, objective feedback on their communication skills and technical knowledge.')
add_paragraph('3) Fragmented Preparation: Candidates use disparate tools for resume building, skill learning, and interview practice, leading to fragmented preparation without a centralized metric of their overall placement readiness.')

# III. Literature Survey & Related Work
add_heading('III. LITERATURE SURVEY & RELATED WORK')
add_paragraph('Existing commercial platforms and academic research primarily focus on isolated segments of the placement lifecycle. For example, generic LLM chatbots can simulate interviews but lack the structured scoring, domain-specific job matching, and multimodal vocal analysis required for a complete evaluation.')
add_paragraph('Recent advancements in domain-adapted language models and speech emotion recognition have demonstrated the feasibility of extracting deep semantic and behavioral insights from raw text and audio. However, a significant research gap remains in integrating these disparate AI models into a cohesive, synchronous pipeline that can evaluate a candidate\'s resume, cross-reference it with a job description, conduct an oral interview, and synthesize the results into a unified Readiness score.')

# IV. Research Gap
add_heading('IV. RESEARCH GAP')
add_paragraph('Despite the prevalence of individual resume parsers and AI chatbots, there is no unified platform that seamlessly bridges the entire pipeline from resume creation to live oral interview evaluation and subsequent study recommendation. Existing systems treat text analysis and vocal emotion recognition as separate problems, often failing to merge these modalities into a singular, actionable placement readiness metric.')

# V. Proposed System Architecture
add_heading('V. PROPOSED SYSTEM ARCHITECTURE')
add_paragraph('CareerVerse AI employs a multi-tier, distributed architecture designed for low latency, secure data isolation, and robust multimodal AI integration.')
add_paragraph('A. Presentation Layer (React & Vite)')
add_paragraph('The frontend provides a responsive Single Page Application (SPA). It orchestrates the user workflow, manages the MediaRecorder API for audio capture during interviews, and visually renders complex datasets such as ATS scores and interview performance graphs.')
add_paragraph('B. Application & Orchestration Layer (Spring Boot)')
add_paragraph('The Spring Boot application handles user authentication (via JWT), REST API routing, and database transactions. Crucially, it acts as the central conductor for external AI APIs. When a user submits an interview answer, Spring Boot parallelizes the tasks: it sends the text transcript to the Gemini LLM for technical evaluation while simultaneously forwarding the raw audio blob to the Python microservice for emotion analysis.')
add_paragraph('C. Machine Learning Layer (FastAPI)')
add_paragraph('A dedicated Python FastAPI microservice hosts the Speech Emotion Recognition model. By isolating the PyTorch-based inference from the Spring Boot application, heavy audio processing does not bottleneck standard web requests.')
add_paragraph('D. Data Persistence Layer (MySQL & AWS S3)')
add_paragraph('A MySQL database (via Hibernate/JPA) stores user profiles, interview histories, and ATS records, ensuring referential integrity. AWS S3 is leveraged for the highly durable, secure storage of uploaded resumes and on-demand generated PDF reports.')

# VI. System Modules & Algorithmic Flow
add_heading('VI. SYSTEM MODULES & ALGORITHMIC FLOW')

add_heading('A. User Authentication & Profile Management', level=2)
add_paragraph('Flow: The client sends credentials to Spring Boot. Spring Security validates the request and issues a stateless JSON Web Token (JWT).')
add_paragraph('Tech Choice: JWT ensures that subsequent requests are rapidly authenticated without repeated database hits, keeping API latency low and securely isolating user data.')

add_heading('B. Resume Management & ATS Analysis', level=2)
add_paragraph('Flow: Users upload a PDF resume directly to AWS S3. Spring Boot extracts the textual content and routes it through an ATS Evaluation prompt via the Gemini LLM, returning a structured JSON response identifying missing keywords against a given Job Description.')
add_paragraph('Tech Choice: Gemini LLM is utilized for its superior context window and semantic reasoning capabilities, allowing it to act as a highly accurate proxy for enterprise ATS parsers.')

add_heading('C. Resume Builder', level=2)
add_paragraph('Flow: The user interacts with a dynamic React form. The frontend updates a live preview in real-time. Upon clicking "Save", Spring Boot persists the structured JSON into MySQL. The user can opt to click "Improve with AI", which sends the specific text node to Gemini for professional rephrasing.')
add_paragraph('Tech Choice: We intentionally avoided complex canvas-based editors (like Canva) in favor of a strict, one-page ATS-friendly template. This ensures that the generated PDF (via OpenPDF) is programmatically guaranteed to be machine-readable by downstream recruiters.')

add_heading('D. AI Mock Interview Engine & Multimodal Speech', level=2)
add_paragraph('Flow: The user selects a target role. Gemini initializes a context-aware persona. During the interview, the browser captures the candidate\'s voice using the MediaRecorder API. The audio blob is sent to Groq STT (Speech-to-Text), which returns a highly accurate transcript. Once the user submits their answer, the AI\'s subsequent question is converted back into voice using Sarvam AI TTS.')
add_paragraph('Tech Choice: Groq STT was selected for its ultra-low latency LPU architecture, allowing real-time transcription. Sarvam AI was chosen for its natural, highly conversational TTS voices, minimizing the robotic feel of traditional synthetic speech.')

add_heading('E. AI Answer Evaluation', level=2)
add_paragraph('Flow: Upon session completion, Spring Boot compiles the entire Q&A transcript and sends it to the Gemini LLM. The LLM acts as an expert evaluator, outputting discrete metrics (0-100) for Technical Accuracy, Communication, Confidence, and Grammar, along with qualitative feedback.')
add_paragraph('Tech Choice: Using Gemini for holistic evaluation ensures that context between consecutive questions is maintained, allowing the AI to penalize contradictory answers or reward progressive problem-solving.')

add_heading('F. Speech Emotion Recognition (SER)', level=2)
add_paragraph('Flow: While the user moves to the next question, the recorded WebM audio blob is forwarded asynchronously by Spring Boot to the Python FastAPI microservice. The service decodes the audio, resamples it to 16 kHz (mono), and passes it through the pretrained Wav2Vec2 model. The dominant emotion (e.g., calm, hesitant) and its confidence score are returned and appended to the InterviewAnswer in MySQL.')
add_paragraph('Tech Choice: We utilized the dpngtm/wav2vec2-emotion-recognition pretrained model from Hugging Face because transformer-based acoustic models capture rich paralinguistic nuances better than traditional CNNs. An asynchronous FastAPI architecture prevents the heavy PyTorch inference from blocking the user\'s real-time interview progression.')

add_heading('G. PDF Report Generation', level=2)
add_paragraph('Flow: The user requests a report. Spring Boot queries the database, formats the scores, Q&A transcripts, and emotion metrics, and uses OpenPDF to generate a document byte stream on the fly. The PDF is saved to AWS S3 and a presigned download URL is returned to the client.')
add_paragraph('Tech Choice: OpenPDF provides robust programmatic PDF generation. Generating reports on-demand rather than after every interview drastically reduces unnecessary S3 storage consumption.')

add_heading('H. Placement Readiness & Recommendations', level=2)
add_paragraph('Flow: The system aggregates historical performance and calculates a weighted Placement Readiness score: ATS (20%) + Job Match (20%) + Interview (30%) + Technical (15%) + Communication (10%) + Confidence (5%). The user\'s weakest parameters are compiled and sent to the Gemini LLM to generate a personalized Study Guide.')
add_paragraph('Tech Choice: A transparent, rule-based mathematical formula was chosen for the Readiness score rather than a black-box ML model. This ensures that the metric is explainable and predictable for the student. Gemini is then leveraged purely for natural language generation to format the identified weak areas into a structured, actionable weekly study plan.')

# VII. Technology Stack (Summary)
add_heading('VII. TECHNOLOGY STACK SUMMARY')
add_paragraph('- Frontend: React, Vite, Tailwind CSS')
add_paragraph('- Backend: Java, Spring Boot, Spring Security, JWT')
add_paragraph('- Database & Storage: MySQL, Hibernate, AWS S3')
add_paragraph('- External APIs: Groq (STT), Sarvam AI (TTS), Google Gemini LLM')
add_paragraph('- Machine Learning: Python, FastAPI, PyTorch, Pretrained Wav2Vec2')

# VIII. Testing and Validation Strategy
add_heading('VIII. TESTING AND VALIDATION STRATEGY')
add_paragraph('The system was validated across three tiers. Unit testing verified the integrity of the Placement Readiness algorithms and JWT authentication. Integration testing ensured that the asynchronous handoff between Spring Boot and the FastAPI emotion service executed reliably under concurrent load. End-to-end user acceptance testing (UAT) validated that the MediaRecorder accurately captured microphone input without latency spikes and that the Groq STT accurately transcribed diverse accents.')

# IX. Results and Discussion
add_heading('IX. RESULTS AND DISCUSSION')
add_paragraph('Deployment of the prototype demonstrated a seamless, non-blocking user experience during the mock interview lifecycle. By offloading heavy audio inference to FastAPI and STT/TTS processing to dedicated external APIs (Groq and Sarvam AI), the React frontend maintained a 60 FPS render cycle. The rule-based Placement Readiness metric proved highly accurate in reflecting candidate improvement over successive interview iterations, validating the decision to avoid an opaque, unexplainable ML model for final scoring.')

# X. Security, Privacy, and Explainability
add_heading('X. SECURITY, PRIVACY, AND EXPLAINABILITY')
add_paragraph('All candidate resumes and interview transcripts are strictly isolated using JWT-based tenant checks in the Spring Boot backend. AWS S3 buckets are kept private, and files are only accessed via temporary, time-limited presigned URLs. Furthermore, the decision to use a rule-based Readiness score inherently guarantees explainability—students can clearly see exactly which sub-metric (e.g., low Job Match score or poor Grammar score) dragged down their overall placement readiness.')

# XI. Limitations and Challenges
add_heading('XI. LIMITATIONS AND CHALLENGES')
add_paragraph('The primary limitation lies in the Speech Emotion Recognition pipeline, which is sensitive to hardware quality; low-quality microphones or excessive background noise can skew the Wav2Vec2 confidence scores. Additionally, reliance on the Gemini LLM for technical evaluation means that extremely niche or highly proprietary technical architectures might occasionally be misinterpreted by the model compared to a senior human engineer.')

# XII. Future Scope
add_heading('XII. FUTURE SCOPE')
add_paragraph('Future iterations of CareerVerse AI will focus on multimodal expansion. By integrating the client\'s webcam, computer vision algorithms could be deployed to analyze micro-expressions and body language during the interview. Furthermore, we intend to implement a peer-review portal, allowing students to securely share their generated PDF reports and ATS match scores with human mentors for secondary validation.')

# XIII. Conclusion
add_heading('XIII. CONCLUSION')
add_paragraph('CareerVerse AI successfully bridges the gap between static resume building and dynamic interview practice through a cohesive, multimodal platform. By thoughtfully distributing processing loads across a Spring Boot backend, a FastAPI ML service, and high-performance APIs like Groq and Gemini, the system delivers real-time, actionable feedback. The transparent Placement Readiness metric and personalized study recommendations equip students with the targeted insights needed to confidently navigate the competitive software engineering job market.')

# References
add_heading('REFERENCES')
add_paragraph('[1] A. Vaswani et al., "Attention is all you need," in Advances in Neural Information Processing Systems, 2017.')
add_paragraph('[2] A. Baevski, H. Zhou, A. Mohamed, and M. Auli, "wav2vec 2.0: A framework for self-supervised learning of speech representations," Advances in Neural Information Processing Systems, vol. 33, pp. 12449-12460, 2020.')
add_paragraph('[3] P. Lewis et al., "Retrieval-augmented generation for knowledge-intensive NLP tasks," in Advances in Neural Information Processing Systems, 2020.')
add_paragraph('[4] "Spring Boot Reference Documentation," VMware/Broadcom, 2024. [Online]. Available: https://docs.spring.io/spring-boot/')
add_paragraph('[5] "FastAPI Documentation," [Online]. Available: https://fastapi.tiangolo.com.')

doc.save('CareerVerse_AI_Project_Report_V3.docx')
print("Successfully generated CareerVerse_AI_Project_Report_V3.docx")
