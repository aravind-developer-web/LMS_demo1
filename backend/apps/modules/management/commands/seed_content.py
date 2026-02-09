from django.core.management.base import BaseCommand
from apps.modules.models import Module, Resource
from apps.quiz.models import Quiz, Question, Answer
from apps.authapp.models import User
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seeds the database with 4 weeks of comprehensive training content'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding 4-week curriculum...')

        # Ensure admin user exists
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin')
            self.stdout.write('Created superuser: admin/admin')

        # 4-WEEK COMPREHENSIVE CURRICULUM
        curriculum = [
            # === GENAI FUNDAMENTALS TRACK ===
            {
                "title": "GENAI FUNDAMENTALS: WEEK 1",
                "description": "Introduction to Generative AI, Large Language Models, and foundational concepts.",
                "duration": 420,
                "difficulty": "beginner",
                "resources": [
                    {"title": "What is Generative AI?", "type": "video", "url": "https://www.youtube.com/watch?v=2IK3DFHRFfw"},
                    {"title": "Large Language Models Explained", "type": "video", "url": "https://www.youtube.com/watch?v=osKyvYJ3PRM"},
                    {"title": "Introduction to ChatGPT", "type": "video", "url": "https://www.youtube.com/watch?v=JTxsNm9IdYU"},
                    {"title": "Generative AI Full Course", "type": "video", "url": "https://www.youtube.com/watch?v=mEsleV16qdo"},
                ]
            },
            {
                "title": "GENAI FUNDAMENTALS: WEEK 2",
                "description": "Prompt Engineering techniques, best practices, and advanced patterns.",
                "duration": 360,
                "difficulty": "beginner",
                "resources": [
                    {"title": "Prompt Engineering Guide", "type": "video", "url": "https://www.youtube.com/watch?v=_ZvnD73m40o"},
                    {"title": "ChatGPT Prompt Engineering", "type": "video", "url": "https://www.youtube.com/watch?v=H4YK_7MAckk"},
                    {"title": "Advanced Prompting Techniques", "type": "video", "url": "https://www.youtube.com/watch?v=aOm75o2Z5-o"},
                    {"title": "Building with GPT-4", "type": "video", "url": "https://www.youtube.com/watch?v=vw-KWfKwvTQ"},
                ]
            },
            {
                "title": "GENAI FUNDAMENTALS: WEEK 3",
                "description": "Building AI applications with OpenAI API and understanding model capabilities.",
                "duration": 480,
                "difficulty": "intermediate",
                "resources": [
                    {"title": "OpenAI API Tutorial", "type": "video", "url": "https://www.youtube.com/watch?v=rn9FelwDFJg"},
                    {"title": "Building AI Apps with OpenAI", "type": "video", "url": "https://www.youtube.com/watch?v=kmxx8d87vIE"},
                    {"title": "Function Calling in GPT", "type": "video", "url": "https://www.youtube.com/watch?v=CbpsDMwFG2g"},
                    {"title": "OpenAI Embeddings Explained", "type": "video", "url": "https://www.youtube.com/watch?v=ySus5ZS0b94"},
                ]
            },
            {
                "title": "GENAI FUNDAMENTALS: WEEK 4",
                "description": "RAG (Retrieval Augmented Generation), vector databases, and production deployment.",
                "duration": 540,
                "difficulty": "advanced",
                "resources": [
                    {"title": "What is RAG?", "type": "video", "url": "https://www.youtube.com/watch?v=T-D1OfcDW1M"},
                    {"title": "RAG from Scratch", "type": "video", "url": "https://www.youtube.com/watch?v=wd7TZ4w1mSw"},
                    {"title": "Vector Database Tutorial", "type": "video", "url": "https://www.youtube.com/watch?v=dN0lsF2cvm4"},
                    {"title": "LangChain for LLM Apps", "type": "video", "url": "https://www.youtube.com/watch?v=LbT1yp6quS8"},
                    {"title": "Production RAG System", "type": "video", "url": "https://www.youtube.com/watch?v=sVcwVQRHIc8"},
                ]
            },

            # === FULL STACK DEVELOPMENT TRACK ===
            {
                "title": "WEB FOUNDATIONS & REACT: WEEK 1",
                "description": "HTML, CSS, JavaScript fundamentals and modern web development basics.",
                "duration": 480,
                "difficulty": "beginner",
                "resources": [
                    {"title": "HTML Crash Course", "type": "video", "url": "https://www.youtube.com/watch?v=qz0aGYrrlhU"},
                    {"title": "CSS Crash Course", "type": "video", "url": "https://www.youtube.com/watch?v=yfoY53QXEnI"},
                    {"title": "JavaScript Full Course", "type": "video", "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg"},
                    {"title": "Modern JavaScript ES6+", "type": "video", "url": "https://www.youtube.com/watch?v=NCwa_xi0Uuc"},
                ]
            },
            {
                "title": "WEB FOUNDATIONS & REACT: WEEK 2",
                "description": "React fundamentals, components, hooks, and state management.",
                "duration": 540,
                "difficulty": "intermediate",
                "resources": [
                    {"title": "React Course for Beginners", "type": "video", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"},
                    {"title": "React Hooks Tutorial", "type": "video", "url": "https://www.youtube.com/watch?v=O6P86uwfdR0"},
                    {"title": "React State Management", "type": "video", "url": "https://www.youtube.com/watch?v=35lXWvCuM8o"},
                    {"title": "React Project Build", "type": "video", "url": "https://www.youtube.com/watch?v=LDB4uaJ87e0"},
                ]
            },
            {
                "title": "WEB FOUNDATIONS & REACT: WEEK 3",
                "description": "Next.js framework, routing, API routes, and server-side rendering.",
                "duration": 480,
                "difficulty": "intermediate",
                "resources": [
                    {"title": "Next.js Tutorial", "type": "video", "url": "https://www.youtube.com/watch?v=9P8mASSREYM"},
                    {"title": "Next.js 14 Full Course", "type": "video", "url": "https://www.youtube.com/watch?v=wm5gMKuwSYk"},
                    {"title": "Next.js API Routes", "type": "video", "url": "https://www.youtube.com/watch?v=L0xgdceBg8E"},
                    {"title": "Next.js App Router", "type": "video", "url": "https://www.youtube.com/watch?v=vwSlYG7hFk0"},
                ]
            },
            {
                "title": "WEB FOUNDATIONS & REACT: WEEK 4",
                "description": "Backend integration, databases, authentication, and full-stack applications.",
                "duration": 600,
                "difficulty": "advanced",
                "resources": [
                    {"title": "Node.js Crash Course", "type": "video", "url": "https://www.youtube.com/watch?v=fBNz5xF-Kx4"},
                    {"title": "Express.js Tutorial", "type": "video", "url": "https://www.youtube.com/watch?v=SccSCuHhOw0"},
                    {"title": "MongoDB Crash Course", "type": "video", "url": "https://www.youtube.com/watch?v=-56x56UppqQ"},
                    {"title": "JWT Authentication", "type": "video", "url": "https://www.youtube.com/watch?v=mbsmsi7l3r4"},
                    {"title": "Full Stack MERN App", "type": "video", "url": "https://www.youtube.com/watch?v=98BzS5Oz5E4"},
                ]
            },

            # === CLOUD & DEVOPS TRACK ===
            {
                "title": "GITHUB & CI/CD WORKFLOWS: WEEK 1",
                "description": "Git basics, GitHub workflows, and version control best practices.",
                "duration": 360,
                "difficulty": "beginner",
                "resources": [
                    {"title": "Git Tutorial for Beginners", "type": "video", "url": "https://www.youtube.com/watch?v=HVsySz-h9r4"},
                    {"title": "GitHub Tutorial", "type": "video", "url": "https://www.youtube.com/watch?v=iv8rSLsi1xo"},
                    {"title": "Git and GitHub Full Course", "type": "video", "url": "https://www.youtube.com/watch?v=RGOj5yH7evk"},
                    {"title": "GitHub Actions Basics", "type": "video", "url": "https://www.youtube.com/watch?v=R8_veQiYBjI"},
                ]
            },
            {
                "title": "GITHUB & CI/CD WORKFLOWS: WEEK 2",
                "description": "Advanced GitHub Actions, CI/CD pipelines, and automated deployments.",
                "duration": 420,
                "difficulty": "intermediate",
                "resources": [
                    {"title": "GitHub Actions Tutorial", "type": "video", "url": "https://www.youtube.com/watch?v=eB0nUzAI7M8"},
                    {"title": "CI/CD Pipeline Guide", "type": "video", "url": "https://www.youtube.com/watch?v=scEDHsr3APg"},
                    {"title": "Docker for CI/CD", "type": "video", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE"},
                    {"title": "GitHub Actions Advanced", "type": "video", "url": "https://www.youtube.com/watch?v=TLB5MY9BBa4"},
                ]
            },
            {
                "title": "DEPLOYMENT & CAPSTONE: WEEK 3",
                "description": "Cloud deployment, Vercel, Netlify, and production best practices.",
                "duration": 480,
                "difficulty": "intermediate",
                "resources": [
                    {"title": "Deploy to Vercel", "type": "video", "url": "https://www.youtube.com/watch?v=AiiGjB2AxqA"},
                    {"title": "Netlify Deploy Tutorial", "type": "video", "url": "https://www.youtube.com/watch?v=mT5siI19gtc"},
                    {"title": "AWS for Beginners", "type": "video", "url": "https://www.youtube.com/watch?v=k1RI5locZE4"},
                    {"title": "Cloud Computing Explained", "type": "video", "url": "https://www.youtube.com/watch?v=dH0yz-Osy54"},
                ]
            },
            {
                "title": "ENGINEERING EXCELLENCE: ENTERPRISE DEPLOYMENT",
                "description": "Production monitoring, security, performance optimization, and capstone project.",
                "duration": 600,
                "difficulty": "advanced",
                "resources": [
                    {"title": "Web Performance Optimization", "type": "video", "url": "https://www.youtube.com/watch?v=0fONene3OIA"},
                    {"title": "Security Best Practices", "type": "video", "url": "https://www.youtube.com/watch?v=lPAQiBtWqjM"},
                    {"title": "Monitoring & Logging", "type": "video", "url": "https://www.youtube.com/watch?v=aV0oxKGJV2g"},
                    {"title": "Kubernetes Crash Course", "type": "video", "url": "https://www.youtube.com/watch?v=s_o8dwzRlu4"},
                    {"title": "Full Stack Capstone Project", "type": "video", "url": "https://www.youtube.com/watch?v=nu_pCVPKzTk"},
                ]
            },
        ]

        for mod_data in curriculum:
            module, created = Module.objects.get_or_create(
                title=mod_data['title'],
                defaults={
                    "description": mod_data['description'],
                    "duration": mod_data['duration'],
                    "difficulty": mod_data['difficulty'],
                    "has_assignment": True,
                    "assignment_prompt": f"Complete a practical project demonstrating your understanding of {mod_data['title']}. Include code samples and documentation."
                }
            )
            if created:
                self.stdout.write(f'[+] Created Module: {module.title}')
            else:
                self.stdout.write(f'[*] Updated Module: {module.title}')

            # Clear existing resources to prevent duplicates
            module.resources.all().delete()

            for i, res_data in enumerate(mod_data['resources']):
                Resource.objects.create(
                    module=module,
                    title=res_data['title'],
                    type=res_data['type'],
                    url=res_data['url'],
                    order=i
                )

            # Create comprehensive quiz
            quiz, _ = Quiz.objects.get_or_create(
                module=module,
                defaults={'title': f"Precision Validation: {module.title}", 'passing_score': 70}
            )
            
            # Clear existing questions
            quiz.questions.all().delete()

            # Generate contextual quiz questions
            questions_data = [
                {
                    "text": f"What is the primary objective of {module.title.split(':')[0]}?",
                    "answers": [
                        {"text": "To build production-ready skills", "is_correct": True},
                        {"text": "To memorize syntax only", "is_correct": False},
                        {"text": "To skip practical exercises", "is_correct": False},
                        {"text": "To avoid best practices", "is_correct": False},
                    ]
                },
                {
                    "text": f"Which concept is covered in Week {module.title.split('WEEK')[-1].strip() if 'WEEK' in module.title else '1'}?",
                    "answers": [
                        {"text": "Core fundamentals and practical implementation", "is_correct": True},
                        {"text": "Unrelated topics", "is_correct": False},
                        {"text": "Outdated techniques", "is_correct": False},
                    ]
                },
                {
                    "text": "What is a best practice for learning this module?",
                    "answers": [
                        {"text": "Watch videos, take notes, and build projects", "is_correct": True},
                        {"text": "Skip the videos entirely", "is_correct": False},
                        {"text": "Only read documentation", "is_correct": False},
                    ]
                },
                {
                    "text": "How should you apply the knowledge from this module?",
                    "answers": [
                        {"text": "Build real-world projects and experiments", "is_correct": True},
                        {"text": "Forget it immediately", "is_correct": False},
                        {"text": "Never practice hands-on", "is_correct": False},
                    ]
                },
                {
                    "text": "What indicates mastery of this module?",
                    "answers": [
                        {"text": "Ability to explain concepts and build working solutions", "is_correct": True},
                        {"text": "Memorizing definitions only", "is_correct": False},
                        {"text": "Avoiding challenging exercises", "is_correct": False},
                    ]
                },
            ]

            for q_data in questions_data:
                question = Question.objects.create(quiz=quiz, text=q_data['text'])
                for a_data in q_data['answers']:
                    question.answers.create(text=a_data['text'], is_correct=a_data['is_correct'])

        self.stdout.write(self.style.SUCCESS('[SUCCESS] 4-week comprehensive curriculum seeded'))
        self.stdout.write(self.style.SUCCESS(f'Total Modules: {Module.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Total Resources: {Resource.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Total Quizzes: {Quiz.objects.count()}'))
