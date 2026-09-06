"""
NLP Processor Service
Handles natural language processing for chatbot
"""

from typing import Dict, Any, List, Optional, Tuple
import random
from app.utils.logger import logger


class NLPProcessor:
    """Natural Language Processing for chatbot"""
    
    def __init__(self):
        self.intents = {
            "greeting": ["hello", "hi", "hey", "good morning", "good evening"],
            "goodbye": ["bye", "goodbye", "see you", "take care"],
            "fruit_identification": ["identify", "what fruit", "recognize", "name this"],
            "nutrition_info": ["nutrition", "calories", "vitamin", "healthy", "benefits"],
            "seasonal_info": ["season", "available", "peak", "harvest", "in season"],
            "storage_tips": ["store", "storage", "keep", "preserve", "shelf life"],
            "recipe_suggestion": ["recipe", "cook", "make", "prepare", "smoothie"],
            "help": ["help", "what can you do", "how to use", "features"],
            "thanks": ["thank", "thanks", "appreciate"],
        }
        
        self.responses = {
            "greeting": [
                "Hello! How can I help you with fruits today? 🍎",
                "Hi there! Ask me anything about fruits! 🍌",
                "Welcome! Ready to explore fruits? Ask away! 🍊"
            ],
            "goodbye": [
                "Goodbye! Come back if you have more questions! 👋",
                "See you later! Happy fruit exploring! 🍎"
            ],
            "fruit_identification": [
                "Upload a photo in the Identify section! I'll tell you what fruit it is! 📸",
                "Go to Identify page and upload an image. I'll analyze it instantly! 🎯"
            ],
            "nutrition_info": [
                "I can provide nutrition info! Which fruit are you interested in? 🥗",
                "Tell me the fruit name for detailed nutrition facts! 📊"
            ],
            "seasonal_info": [
                "Seasonal fruits vary by time of year. Which fruit are you curious about? 📅",
                "Fruits taste best when in season! Tell me a fruit name! 🌸"
            ],
            "storage_tips": [
                "Proper storage keeps fruits fresh! Which fruit do you need tips for? 📦",
                "Ask me about specific fruits for storage guidance! 🧊"
            ],
            "recipe_suggestion": [
                "I love sharing recipes! Which fruit would you like to cook with? 🍳",
                "Tell me your favorite fruit for recipe ideas! 👩‍🍳"
            ],
            "help": [
                "I can help identify fruits, provide nutrition info, suggest recipes, and more! 🍎",
                "Try: 'What fruits are in season?' or 'Tell me about apple nutrition' 🤖"
            ],
            "thanks": [
                "You're welcome! Happy to help! 🍎",
                "My pleasure! Anything else I can assist with? 😊"
            ],
            "unknown": [
                "I'm not sure I understand. Could you rephrase? 🤔",
                "I can help with fruit identification, nutrition, recipes, and more! 🍎"
            ]
        }
    
    async def process_message(
        self,
        message: str,
        context: Optional[Dict] = None,
        last_fruit: Optional[str] = None,
    ) -> Tuple[str, str, float, List[str]]:
        message_lower = message.lower().strip()
        intent, confidence = self._detect_intent(message_lower)
        response = self._generate_response(intent, last_fruit)
        suggestions = self._generate_suggestions(intent, last_fruit)
        return response, intent, confidence, suggestions
    
    def _detect_intent(self, message: str) -> Tuple[str, float]:
        scores = {}
        for intent, keywords in self.intents.items():
            score = 0
            for keyword in keywords:
                if keyword in message:
                    score += 1
            if score > 0:
                scores[intent] = min(score / len(keywords), 0.95)
        if scores:
            best_intent = max(scores, key=scores.get)
            return best_intent, scores[best_intent]
        return "unknown", 0.5
    
    def _generate_response(self, intent: str, last_fruit: Optional[str] = None) -> str:
        responses = self.responses.get(intent, self.responses["unknown"])
        response = random.choice(responses)
        if last_fruit and intent in ["nutrition_info", "seasonal_info", "storage_tips", "recipe_suggestion"]:
            response = f"For {last_fruit}, " + response.lower()
        return response
    
    def _generate_suggestions(self, intent: str, last_fruit: Optional[str] = None) -> List[str]:
        suggestions = {
            "nutrition_info": ["What are the health benefits?", "How many calories?", "Tell me about vitamins"],
            "seasonal_info": ["When is the best time to buy?", "What other fruits are in season?", "How to store this fruit?"],
            "fruit_identification": ["How to take a good photo?", "What fruits can you identify?", "Try identifying a fruit"],
            "recipe_suggestion": ["Show me easy recipes", "Healthy alternatives?", "Breakfast ideas"],
            "default": ["What fruits are in season?", "How to identify a ripe mango?", "Tell me about apple nutrition", "Best fruits for weight loss"]
        }
        suggestions_list = suggestions.get(intent, suggestions["default"])
        if last_fruit:
            suggestions_list.insert(0, f"Tell me more about {last_fruit}")
        return suggestions_list[:4]
    
    async def get_suggestions(self, context: Optional[str] = None) -> List[Dict]:
        return [{"text": "What fruits are in season?", "icon": "🌱", "confidence": 0.95},
                {"text": "How to identify a ripe mango?", "icon": "🥭", "confidence": 0.92},
                {"text": "Tell me about apple nutrition", "icon": "🍎", "confidence": 0.90},
                {"text": "Best fruits for weight loss", "icon": "⚖️", "confidence": 0.88},
                {"text": "How to store berries?", "icon": "🫐", "confidence": 0.85},
                {"text": "Fruits good for diabetes", "icon": "🩺", "confidence": 0.82}]
    
    async def get_all_intents(self) -> List[Dict]:
        return [{"name": k, "keywords": v} for k, v in self.intents.items()]
    
    async def add_intent(self, intent_data: dict) -> Dict:
        name = intent_data.get("name")
        keywords = intent_data.get("keywords", [])
        if name and keywords:
            self.intents[name] = keywords
        return intent_data
    
    async def update_intent(self, intent_id: str, intent_data: dict) -> Dict:
        if intent_id in self.intents:
            self.intents[intent_id] = intent_data.get("keywords", self.intents[intent_id])
        return intent_data
    
    async def delete_intent(self, intent_id: str) -> bool:
        if intent_id in self.intents:
            del self.intents[intent_id]
            return True
        return False
    
    async def train_model(self) -> None:
        logger.info("Chatbot model training started (mock)")
