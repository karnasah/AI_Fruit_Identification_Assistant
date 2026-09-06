"""
Chatbot Model
Main chatbot NLP model for processing user messages
"""

import re
from typing import Dict, Any, List, Optional, Tuple
from app.nlp.intent_classifier import IntentClassifier
from app.nlp.response_generator import ResponseGenerator
from app.utils.logger import logger


class ChatbotModel:
    """Main chatbot NLP model"""
    
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.response_generator = ResponseGenerator()
        self.context_store: Dict[str, Dict] = {}
    
    async def process_message(
        self,
        message: str,
        session_id: str,
        context: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Process user message and generate response
        
        Args:
            message: User message text
            session_id: Chat session ID
            context: Optional conversation context
        
        Returns:
            Dictionary with response, intent, confidence, and suggestions
        """
        # Get session context
        session_context = self.context_store.get(session_id, {})
        if context:
            session_context.update(context)
        
        # Classify intent
        intent, confidence, entities = await self.intent_classifier.classify(message, session_context)
        
        # Generate response
        response = await self.response_generator.generate_response(
            intent=intent,
            entities=entities,
            context=session_context,
            user_message=message,
        )
        
        # Update context with conversation history
        session_context["last_intent"] = intent
        session_context["last_message"] = message
        session_context["last_response"] = response
        self.context_store[session_id] = session_context
        
        # Generate follow-up suggestions
        suggestions = await self._get_suggestions(intent, entities)
        
        return {
            "reply": response,
            "intent": intent,
            "confidence": confidence,
            "entities": entities,
            "suggestions": suggestions,
        }
    
    async def _get_suggestions(self, intent: str, entities: Dict) -> List[str]:
        """Get follow-up question suggestions based on intent"""
        suggestions_map = {
            "greeting": [
                "What fruits are in season?",
                "How do I identify a fruit?",
                "Tell me about fruit nutrition",
            ],
            "fruit_identification": [
                "How accurate is the identification?",
                "What fruits can you identify?",
                "Show me similar fruits",
            ],
            "nutrition_info": [
                "What are the health benefits?",
                "How many calories?",
                "Any side effects?",
            ],
            "seasonal_info": [
                "When is the best time to buy?",
                "How to store this fruit?",
                "Tell me about other seasonal fruits",
            ],
            "recipe_suggestion": [
                "Show me more recipes",
                "What are easy recipes?",
                "Healthy alternatives?",
            ],
            "help": [
                "How to use the identification feature?",
                "What does the chatbot do?",
                "Contact support",
            ],
            "default": [
                "What fruits are in season?",
                "How to identify a ripe mango?",
                "Tell me about apple nutrition",
                "Best fruits for weight loss",
            ],
        }
        
        return suggestions_map.get(intent, suggestions_map["default"])
    
    def clear_context(self, session_id: str) -> None:
        """Clear session context"""
        if session_id in self.context_store:
            del self.context_store[session_id]