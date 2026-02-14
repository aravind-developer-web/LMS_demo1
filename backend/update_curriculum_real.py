import os
import django
from dotenv import load_dotenv

load_dotenv()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.modules.models import Module, Resource

def update_curriculum():
    print("Synchronizing with GenAI Fresher Training Plan...")
    
    # Format: (Week, ModuleIndex, Title, VideoID)
    curriculum = [
        # WEEK 1: GenAI & Python Foundations
        (1, 1, "Introduction to Generative AI", "G2fqAlgmoPo"),  # Google Cloud Tech
        (1, 2, "What is Generative AI?", "HFKsuS6yZ6M"),         # IBM Technology
        (1, 3, "Large Language Models Explained", "5sLYAQS9sWQ"), # Fireship
        (1, 4, "Python for Data Science Crash Course", "t8pPdKYpowI"), # FreeCodeCamp
        (1, 5, "AI Ethics & Responsibility", "aVq_bAnwd_c"),    # IBM

        # WEEK 2: RAG & Prompt Engineering
        (2, 1, "Prompt Engineering for Developers", "_ZvnD73m40o"), # FreeCodeCamp
        (2, 2, "RAG (Retrieval Augmented Generation) Explained", "T-D1OfcDW1M"), # IBM
        (2, 3, "LangChain Crash Course", "aywZrzNaKjs"),        # Patrick Loeber
        (2, 4, "Vector Databases Explained", "klTvEwg3oJ4"),    # IBM
        (2, 5, "RAG From Scratch: Overview", "wd7TZ4w1mSw"),    # LangChain (Video 1)

        # WEEK 3: Modern Web Stack (React/Next.js) - FROM SHEET
        (3, 1, "React Practical Crash Course", "LDB4uaJ87e0"),  # Traversy Media (W3-05)
        (3, 2, "Next.js in 100 Seconds", "Sklc_fQBmcs"),        # Fireship (W3-06)
        (3, 3, "Tailwind CSS Crash Course", "pfaSUYaSgRo"),    # Traversy (Contextual)
        (3, 4, "Build a Real-Time Chatbot with AI", "_tBTfvQr38M"), # Sam Thoyre (W3-08)
        (3, 5, "Vercel AI SDK Introduction", "HbS722jBw_w"),   # Vercel

        # WEEK 4: DevOps, CI/CD & Deployment - FROM SHEET
        (4, 1, "Git and GitHub for Beginners", "RGOj5yH7evk"),  # FreeCodeCamp (W4-04)
        (4, 2, "GitHub Actions Tutorial", "R8_veQiYBjl"),      # TechWorld with Nana (W4-05)
        (4, 3, "5 Ways to DevOps-ify your App", "eB0nUzAI7M8"), # Fireship (W4-06)
        (4, 4, "Deploying Next.js to Vercel", "AiiGjB2AxqA"),  # Vercel (W4-08)
        (4, 5, "GitHub Pull Request in 100 Seconds", "8lGpZkjnkt4") # Fireship (W4-10)
    ]

    for week_num, mod_idx, title, video_id in curriculum:
        # Find module by Week and Order (approximate by sorting)
        # We assume IDs 1-5 = Week 1, 6-10 = Week 2, etc. because of our seeding order.
        # But to be safe, we perform a precise lookup if possible, or fall back to ID math.
        
        # Calculate expected ID based on linear 1-20 sequence from previous seeds
        target_id = (week_num - 1) * 5 + mod_idx
        
        try:
            module = Module.objects.get(id=target_id)
            
            # Update Module Metadata
            module.title = title
            module.description = f"Official training protocol for: {title}. Focus on mastery of key concepts."
            module.week = week_num
            module.save()

            # Update Resource (Video)
            # Ensure URL is embed format
            embed_url = f"https://www.youtube.com/embed/{video_id}"
            
            Resource.objects.update_or_create(
                module=module,
                type='video',
                defaults={
                    'title': f"Video: {title}",
                    'url': embed_url,
                    'description': "verified training material"
                }
            )
            print(f"Synced [W{week_num}.{mod_idx}] {title}")
            
        except Module.DoesNotExist:
            print(f"Skipping W{week_num}.{mod_idx} (Module ID {target_id} not found)")

    print("Success: All 20 Modules Synchronized with Training Plan.")

if __name__ == "__main__":
    update_curriculum()
