from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings
from apps.modules.models import Module, ModuleProgress
from apps.assignments.models import Assignment
from apps.quiz.models import QuizAttempt
import openai
import os
import random
import re

class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        user_message = request.data.get('message', '').strip()
        history = request.data.get('history', [])

        if not user_message:
            return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)

        # Context Injection
        context = f"""
        User Context:
        Username: {user.username}
        Role: {user.role}
        Current Focus: Learning Full Stack Development & AI
        """

        system_prompt = {
            "role": "system",
            "content": f"""You are the Neural Oracle, a highly advanced, friendly, and encouraging AI tutor integrated into the Nimmu LMS Enterprise platform.
            
            Your Persona:
            - Friendly, supportive, and enthusiastic (like a knowledgeable friend).
            - Use tech-savvy, futuristic terminology occasionally (e.g., "neural pathways", "uploading knowledge", "synaptic check"), but keep it accessible.
            - ALWAYS be positive and encouraging.
            - If the user is stuck, guide them step-by-step.
            - Keep responses concise (under 3-4 sentences) unless a detailed explanation is requested.
            
            Context about the User:
            {context}
            
            Your Goal:
            - Answer learner doubts clearly.
            - Motivate them to continue their courses.
            - Provide code snippets if asked.
            """
        }

        try:
            # Check for API Key
            api_key = getattr(settings, 'OPENAI_API_KEY', None) or os.getenv('OPENAI_API_KEY')
            
            if api_key:
                # Online Mode (OpenAI)
                messages = [system_prompt]
                for msg in history[-5:]:
                    messages.append({"role": msg['role'], "content": msg['text']})
                messages.append({"role": "user", "content": user_message})

                client = openai.OpenAI(api_key=api_key)
                completion = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=300
                )
                ai_response = completion.choices[0].message.content
                return Response({'response': ai_response})
            else:
                # Local Neural Core Mode (Fallback)
                local_response = self.generate_local_response(user, user_message)
                return Response({'response': local_response, 'offline': True})

        except Exception as e:
            print(f"AI Error: {str(e)}")
            # Fallback to local even on API error
            local_response = self.generate_local_response(user, user_message)
            return Response({'response': local_response, 'offline': True})

    def generate_local_response(self, user, message):
        """
        Advanced Rule-Based Logic to mimic AI when offline.
        Includes a hardcoded 'Knowledge Base' for common curriculum doubts.
        """
        msg = message.lower()
        
        # --- 0. SMALL TALK & CLARIFICATION ---
        if len(msg.split()) < 2 and msg not in ['hi', 'hello', 'help', 'status']:
            return "Could you be a bit more specific? I'm ready to help, but I need a little more context! 🤖"

        if any(w in msg for w in ['why', 'what', 'how']) and len(msg) < 10:
             return "That's a deep question! Could you clarify what specific topic or error you're curious about? (e.g., 'Why use React hooks?')"

        # --- 1. TECHNICAL KNOWLEDGE BASE (Curriculum "Training Data") ---
        KNOWLEDGE_BASE = {
            # FRONTEND (React)
            'react': "React is a JavaScript library for building user interfaces. It uses a 'Virtual DOM' to optimize updates. We use it for the frontend of this LMS!",
            'hook': "Hooks let you use state and other React features without writing a class. Common ones are `useState` (for data) and `useEffect` (for side effects).",
            'usestate': "`useState` is a Hook that lets you add React state to function components. Example: `const [count, setCount] = useState(0);`",
            'useeffect': "`useEffect` lets you perform side effects in components, like fetching data. It acts like `componentDidMount` and `componentDidUpdate` combined.",
            'prop': "Props (properties) are how you pass data from a parent component to a child component. They are read-only!",
            'component': "Components are the building blocks of React. They can be small (like a Button) or large (like a Dashboard).",
            'jsx': "JSX is a syntax extension for JavaScript. It looks like HTML but works inside JS. Browsers can't read it directly, so we use build tools like Vite/Babel.",
            
            # BACKEND (Django)
            'django': "Django is a high-level Python web framework. It follows the MVT (Model-View-Template) pattern and includes batteries-included features like an Admin panel and ORM.",
            'model': "In Django, a Model is the single, definitive source of information about your data. It contains the essential fields and behaviors of the data you’re storing.",
            'view': "A View in Django is a Python function or class that takes a Web request and returns a Web response. In this LMS, we use 'APIViews' from DRF.",
            'serializer': "Serializers allow complex data such as querysets and model instances to be converted to native Python datatypes (like JSON) that can then be easily rendered into content types.",
            'admin': "Django's automatic admin interface reads metadata from your models to provide a quick, model-centric interface where trusted users can manage content.",
            'migration': "Migrations are Django's way of propagating changes you make to your models (adding a field, deleting a model, etc.) into your database schema.",

            # PYTHON
            'python': "Python is an interpreted, high-level, general-purpose programming language. We love it for its readability and massive ecosystem of libraries (like Django and Pandas).",
            'list': "A list in Python is a mutable, ordered sequence of elements. Example: `my_list = [1, 2, 3]`. You can add to it using `.append()`.",
            'dict': "A dictionary in Python stores data values in key:value pairs. It is a collection which is ordered, changeable and does not allow duplicates.",
            
            # AI / ML
            'ai': "Artificial Intelligence (AI) is the simulation of human intelligence processes by machines. In this course, we focus on GenAI and LLMs.",
            'llm': "Large Language Models (LLMs) like GPT-4 are trained on massive datasets to understand and generate human-like text. They predict the next likely word in a sequence.",
            'rag': "RAG (Retrieval-Augmented Generation) is a technique where we fetch relevant data (context) from a database and send it to the AI to get accurate answers (like this local bot!).",
            'vector': "Vector databases store data as high-dimensional vectors (numbers). This allows us to search for 'meaning' rather than just matching keywords.",
        }

        # Check Knowledge Base
        for key, answer in KNOWLEDGE_BASE.items():
            if key in msg:
                return f"🧠 **Database Match found for '{key}':**\n\n{answer}\n\n*Need a code example? Just ask!*"

        # --- 2. GREETINGS & PERSONA ---
        if any(w in msg for w in ['hi', 'hello', 'hey', 'greetings', 'yo']):
            return f"Neural Interface Active! Hey {user.username}, great to see you online. I'm connected to your local learning node. How can I help you crush some goals today?"

        # --- 3. LMS SPECIFIC (Status / Progress) ---
        if any(w in msg for w in ['status', 'progress', 'how am i', 'doing', 'stats']):
            completed = ModuleProgress.objects.filter(user=user, status='completed').count()
            in_progress = ModuleProgress.objects.filter(user=user, status='in_progress').count()
            return f"Scanning your neural matrix... 🔍\n\nYou've completed {completed} modules and have {in_progress} currently in progress. Your velocity is solid! Want to dive back into a specific topic?"

        # --- 4. ASSIGNMENTS ---
        if any(w in msg for w in ['assignment', 'homework', 'task', 'work']):
            pending = Assignment.objects.filter(user=user, status='pending').count()
            if pending > 0:
                next_task = Assignment.objects.filter(user=user, status='pending').first()
                return f"You have {pending} pending directives. Your next priority is '{next_task.module.title}'. You got this! tackle it now?"
            else:
                return "All practical directives are cleared! You are a machine! 🚀 ready for more?"

        # --- 5. QUIZZES ---
        if any(w in msg for w in ['quiz', 'test', 'exam', 'score']):
            attempts = QuizAttempt.objects.filter(user=user).order_by('-attempted_at')[:3]
            if attempts:
                recent_scores = ", ".join([f"{a.quiz.title} ({a.score}%)" for a in attempts])
                return f"Recent validation data loaded: {recent_scores}. Keep pushing for that 100% precision!"
            else:
                return "No recent quiz data found in the archive. Why not take a 'Knowledge Check' to validate your skills?"

        # --- 6. HELP / STUCK ---
        if any(w in msg for w in ['help', 'stuck', 'hard', 'confused', 'fail']):
            return "Don't panic! Even the most advanced networks need retraining. Try breaking the problem down, or verify the 'Resources' tab in your current module for guides. I'm here rooting for you!"

        # --- 7. AFFIRMATION ---
        if any(w in msg for w in ['thanks', 'thank', 'cool', 'awesome', 'good']):
            return "You're welcome, unit! High-fives all around. 🙌 Let's keep this momentum going!"

        # --- 8. SMART FALLBACK ---
        return (
            "I'm scanning my local knowledge banks but couldn't find a precise match. "
            "Try asking about course topics like **'React'**, **'Django'**, **'Serializers'**, or **'Assignments'**. "
            "I'm here to help you debug your learning path!"
        )
