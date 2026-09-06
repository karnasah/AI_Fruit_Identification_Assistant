"""
Intent Classifier
Classifies user messages into predefined intents for the chatbot
"""

import re
from typing import Dict, Any, List, Optional, Tuple
from app.utils.logger import logger


class IntentClassifier:
    """Intent classification for chatbot messages"""
    
    def __init__(self):
        self._init_intent_patterns()
    
    def _init_intent_patterns(self):
        """Initialize intent patterns and keywords"""
        self.intents = {
            "greeting": {
                "patterns": [
                    r"hello", r"hi\b", r"hey", r"good morning", r"good afternoon",
                    r"good evening", r"namaste", r"howdy", r"greetings"
                ],
                "keywords": ["hello", "hi", "hey", "morning", "evening"],
                "priority": 1,
            },
            "goodbye": {
                "patterns": [
                    r"bye", r"goodbye", r"see you", r"take care", r"exit",
                    r"quit", r"end", r"thanks? bye"
                ],
                "keywords": ["bye", "goodbye", "exit", "quit"],
                "priority": 1,
            },
            "fruit_identification": {
                "patterns": [
                    r"identify", r"what fruit is this", r"recognize", r"tell me what fruit",
                    r"name this fruit", r"what.*fruit", r"is this a"
                ],
                "keywords": ["identify", "recognize", "what fruit", "name this"],
                "priority": 2,
            },
            "nutrition_info": {
                "patterns": [
                    r"nutrition", r"calories", r"vitamin", r"mineral",
                    r"health benefit", r"is.*healthy", r"good for", r"benefits of"
                ],
                "keywords": ["nutrition", "calories", "vitamin", "benefits", "healthy"],
                "priority": 2,
            },
            "seasonal_info": {
                "patterns": [
                    r"season", r"when.*available", r"peak season", r"best time",
                    r"in season", r"available in", r"harvest"
                ],
                "keywords": ["season", "available", "peak", "harvest"],
                "priority": 2,
            },
            "storage_tips": {
                "patterns": [
                    r"store", r"storage", r"keep", r"preserve", r"shelf life",
                    r"how to store", r"keep fresh", r"refrigerate"
                ],
                "keywords": ["store", "storage", "keep", "preserve", "shelf"],
                "priority": 2,
            },
            "recipe_suggestion": {
                "patterns": [
                    r"recipe", r"cook", r"make", r"prepare", r"dish",
                    r"smoothie", r"salad", r"dessert", r"juice"
                ],
                "keywords": ["recipe", "cook", "make", "prepare", "smoothie"],
                "priority": 2,
            },
            "farming_tips": {
                "patterns": [
                    r"grow", r"plant", r"cultivate", r"farming", r"harvest",
                    r"farmer", r"orchard", r"soil", r"fertilizer"
                ],
                "keywords": ["grow", "plant", "farming", "farmer", "cultivate"],
                "priority": 2,
            },
            "price_info": {
                "patterns": [
                    r"price", r"cost", r"rate", r"expensive", r"cheap",
                    r"how much", r"market price", r"buy"
                ],
                "keywords": ["price", "cost", "rate", "market"],
                "priority": 2,
            },
            "help": {
                "patterns": [
                    r"help", r"support", r"how to", r"what can you do",
                    r"capabilities", r"features", r"guide", r"tutorial"
                ],
                "keywords": ["help", "support", "guide", "tutorial", "how to"],
                "priority": 1,
            },
            "thanks": {
                "patterns": [
                    r"thank", r"thanks", r"appreciate", r"grateful"
                ],
                "keywords": ["thank", "thanks", "appreciate"],
                "priority": 1,
            },
        }
    
    async def classify(
        self,
        message: str,
        context: Optional[Dict] = None,
    ) -> Tuple[str, float, Dict]:
        """
        Classify user message intent
        
        Args:
            message: User message text
            context: Optional conversation context
        
        Returns:
            Tuple of (intent, confidence, entities)
        """
        message_lower = message.lower().strip()
        entities = {}
        
        # Extract fruit name if present
        fruit_name = self._extract_fruit_name(message_lower)
        if fruit_name:
            entities["fruit_name"] = fruit_name
        
        # Calculate scores for each intent
        scores = {}
        for intent, config in self.intents.items():
            score = self._calculate_score(message_lower, config)
            if score > 0:
                scores[intent] = score
        
        # Get best intent
        if scores:
            best_intent = max(scores, key=scores.get)
            confidence = min(scores[best_intent] / 100, 0.95)
            
            # Use context to adjust confidence
            if context and context.get("last_intent") == best_intent:
                confidence = min(confidence * 1.1, 0.95)
            
            return best_intent, confidence, entities
        
        return "unknown", 0.5, entities
    
    def _calculate_score(self, message: str, intent_config: Dict) -> float:
        """Calculate match score for an intent"""
        score = 0
        patterns = intent_config.get("patterns", [])
        keywords = intent_config.get("keywords", [])
        
        # Check patterns (regex)
        for pattern in patterns:
            if re.search(pattern, message, re.IGNORECASE):
                score += 40
                break
        
        # Check keywords
        for keyword in keywords:
            if keyword in message:
                score += 15
        
        # Priority adjustment
        priority = intent_config.get("priority", 1)
        score = score * priority
        
        return min(score, 100)
    
    def _extract_fruit_name(self, message: str) -> Optional[str]:
        """Extract fruit name from message"""
        # Common fruit names
        fruits = [
            "apple", "banana", "orange", "mango", "grape", "strawberry",
            "watermelon", "pineapple", "peach", "pear", "kiwi", "lemon",
            "lime", "coconut", "avocado", "blueberry", "raspberry", "cherry",
            "plum", "apricot", "fig", "date", "pomegranate", "papaya",
            "guava", "lychee", "dragon fruit", "passion fruit", "melon",
        ]
        
        # Patterns like "about apple", "tell me about mango"
        patterns = [
            r"(?:about|of|for|on)\s+([a-z\s]+)$",
            r"(?:is|are)\s+([a-z\s]+)\s+(?:good|healthy|ripe)",
            r"tell me about\s+([a-z\s]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message)
            if match:
                candidate = match.group(1).strip()
                for fruit in fruits:
                    if fruit in candidate:
                        return fruit
        
        # Direct mention
        for fruit in fruits:
            if fruit in message:
                return fruit
        
        return None