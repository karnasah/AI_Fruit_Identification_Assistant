"""
Response Generator
Generates appropriate responses based on intent and context
"""

from typing import Dict, Any, Optional, List
from app.utils.logger import logger


class ResponseGenerator:
    """Generate chatbot responses based on intent"""
    
    def __init__(self):
        self._init_response_templates()
    
    def _init_response_templates(self):
        """Initialize response templates for different intents"""
        self.responses = {
            "greeting": [
                "Hello! How can I help you with fruits today? 🍎",
                "Hi there! I'm your Fruit AI Assistant. Ask me anything about fruits! 🍌",
                "Welcome! Ready to explore the world of fruits? Ask away! 🍊",
                "Hey! Need help identifying a fruit or learning about nutrition? I'm here! 🥭",
            ],
            "goodbye": [
                "Goodbye! Come back if you have more fruit questions! 👋",
                "See you later! Happy fruit exploring! 🍎",
                "Take care! Remember to eat your fruits daily! 🍌",
            ],
            "fruit_identification": [
                "I can help identify fruits! Just upload a photo or use your camera in the Identify section. 📸",
                "To identify a fruit, go to the Identify page and upload an image. I'll tell you what fruit it is! 🍎",
                "You can identify fruits by uploading an image or using live camera. The AI will analyze it instantly! 🎯",
            ],
            "nutrition_info": [
                "I can provide detailed nutritional information! Which fruit are you interested in? 🥗",
                "Nutrition info includes calories, vitamins, minerals, and health benefits. Tell me the fruit name! 📊",
                "Fruits are packed with nutrients! Ask me about a specific fruit for detailed nutrition facts. 💪",
            ],
            "seasonal_info": [
                "Seasonal fruits vary by region and time of year. Which fruit or season are you curious about? 📅",
                "Fruits taste best when they're in season! Tell me a fruit name to learn its peak season. 🌸",
                "Summer fruits include mangoes and watermelons. Winter brings oranges and pomegranates! What would you like to know? 🍂",
            ],
            "storage_tips": [
                "Proper storage keeps fruits fresh longer! Which fruit do you need storage tips for? 📦",
                "Some fruits ripen at room temperature, others need refrigeration. Ask me about specific fruits! 🧊",
                "Store bananas separate from other fruits - they release ethylene gas that speeds ripening! 🍌",
            ],
            "recipe_suggestion": [
                "I love sharing recipes! Which fruit would you like to cook with? 🍳",
                "Smoothies, salads, desserts - so many options! Tell me your favorite fruit for recipe ideas! 👩‍🍳",
                "From fruit salads to baked desserts, I've got recipes. What fruit are you using? 🥗",
            ],
            "farming_tips": [
                "Growing fruits requires proper soil, water, and care. Which fruit are you planning to grow? 🌱",
                "I can provide farming tips for various fruits. Let me know which fruit you're interested in! 🚜",
                "Proper pruning, irrigation, and pest control are key for fruit farming. Need specific advice? 🌾",
            ],
            "price_info": [
                "Fruit prices vary by season and location. Which fruit's price are you curious about? 💰",
                "I can provide average market prices. Tell me the fruit name and your location! 🏪",
                "Prices fluctuate with season - fruits are usually cheaper when in season! 📈",
            ],
            "thanks": [
                "You're welcome! Happy to help! 🍎",
                "My pleasure! Anything else I can assist with? 😊",
                "Glad I could help! Feel free to ask more questions! 🌟",
            ],
            "help": [
                "I can help you identify fruits, provide nutritional info, suggest recipes, give storage tips, and more! 🍎",
                "Try asking: 'What fruits are in season?' or 'Tell me about apple nutrition' or 'How to identify a ripe mango?' 🤖",
                "Features: Fruit identification, nutrition database, seasonal info, recipe suggestions, and farming tips! 📚",
            ],
            "unknown": [
                "I'm not sure I understand. Could you rephrase your question? 🤔",
                "I can help with fruit identification, nutrition, recipes, and seasonal info. What would you like to know? 🍎",
                "Try asking about a specific fruit or using the Identify feature to upload an image! 📸",
            ],
        }
        
        self.fruit_specific_responses = {
            "nutrition": "🍎 {fruit} is nutritious! It contains approximately {calories} calories per 100g, with {carbs}g carbs, {fiber}g fiber, and is rich in {vitamins}. Would you like more details?",
            "season": "🌱 {fruit} is typically in season during {season}. The peak months are {months}. This is when they taste best and are most affordable!",
            "storage": "📦 To store {fruit}: {tips}. This will help keep them fresh longer!",
            "recipe": "🍳 Here's a simple {fruit} recipe: {recipe}. Would you like more recipe ideas?",
            "ripeness": "🥭 A ripe {fruit} typically has {indicators}. {fruit} is ready to eat when {ripeness_tip}!",
            "benefits": "💪 {fruit} offers great health benefits: {benefits}. Would you like to know more about any specific benefit?",
        }
    
    async def generate_response(
        self,
        intent: str,
        entities: Dict,
        context: Optional[Dict] = None,
        user_message: Optional[str] = None,
    ) -> str:
        """
        Generate response based on intent and entities
        
        Args:
            intent: Classified intent
            entities: Extracted entities (like fruit name)
            context: Conversation context
            user_message: Original user message
        
        Returns:
            Generated response string
        """
        fruit_name = entities.get("fruit_name")
        
        # Check if we can provide fruit-specific response
        if fruit_name and intent in self.fruit_specific_responses:
            return await self._generate_fruit_specific_response(intent, fruit_name)
        
        # Use general response template
        responses = self.responses.get(intent, self.responses["unknown"])
        import random
        return random.choice(responses)
    
    async def _generate_fruit_specific_response(self, intent: str, fruit_name: str) -> str:
        """Generate fruit-specific response"""
        template = self.fruit_specific_responses.get(intent, "")
        
        if not template:
            return f"I can help you with information about {fruit_name}! What would you like to know - nutrition, season, storage, or recipes?"
        
        # Get fruit data (simplified - would fetch from database)
        fruit_data = await self._get_fruit_data(fruit_name)
        
        if intent == "nutrition":
            return template.format(
                fruit=fruit_name.capitalize(),
                calories=fruit_data.get("calories", 52),
                carbs=fruit_data.get("carbs", 14),
                fiber=fruit_data.get("fiber", 2.4),
                vitamins="Vitamin C and antioxidants",
            )
        elif intent == "season":
            return template.format(
                fruit=fruit_name.capitalize(),
                season=fruit_data.get("season", "Summer"),
                months=fruit_data.get("peak_months", "July to September"),
            )
        elif intent == "storage":
            return template.format(
                fruit=fruit_name.capitalize(),
                tips=fruit_data.get("storage_tips", "store in a cool, dry place"),
            )
        elif intent == "recipe":
            return template.format(
                fruit=fruit_name.capitalize(),
                recipe=fruit_data.get("recipe", f"fresh {fruit_name} salad or smoothie"),
            )
        elif intent == "benefits":
            return template.format(
                fruit=fruit_name.capitalize(),
                benefits=fruit_data.get("benefits", "supports heart health and immunity"),
            )
        
        return f"Tell me more about what you'd like to know regarding {fruit_name}!"
    
    async def _get_fruit_data(self, fruit_name: str) -> Dict:
        """Get fruit data (simplified - would query database)"""
        # Placeholder fruit data
        fruit_data = {
            "apple": {
                "calories": 52,
                "carbs": 14,
                "fiber": 2.4,
                "season": "Fall",
                "peak_months": "September to November",
                "storage_tips": "store in refrigerator for longer freshness",
                "benefits": "heart health, digestion, immune support",
            },
            "banana": {
                "calories": 89,
                "carbs": 23,
                "fiber": 2.6,
                "season": "Year-round",
                "peak_months": "All year",
                "storage_tips": "store at room temperature, refrigerate when ripe",
                "benefits": "potassium, energy, digestive health",
            },
            "mango": {
                "calories": 60,
                "carbs": 15,
                "fiber": 1.6,
                "season": "Summer",
                "peak_months": "May to August",
                "storage_tips": "ripen at room temperature, then refrigerate",
                "benefits": "vitamin A, C, immunity boost",
            },
        }
        
        return fruit_data.get(fruit_name.lower(), {
            "calories": "varying",
            "carbs": "varying",
            "fiber": "varying",
            "season": "varies by variety",
            "peak_months": "check local availability",
            "storage_tips": "consult specific fruit guidelines",
            "benefits": "nutritious fruit with various health benefits",
        })