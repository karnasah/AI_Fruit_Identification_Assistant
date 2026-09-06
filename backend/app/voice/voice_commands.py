"""
Voice Commands Module
Processes voice commands and executes corresponding actions
"""

import re
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum

from app.utils.logger import logger


class CommandAction(str, Enum):
    """Available voice command actions"""
    IDENTIFY = "identify"
    CAPTURE = "capture"
    DASHBOARD = "dashboard"
    ENCYCLOPEDIA = "encyclopedia"
    CHATBOT = "chatbot"
    PROFILE = "profile"
    SETTINGS = "settings"
    HISTORY = "history"
    FAVORITES = "favorites"
    HELP = "help"
    SEARCH = "search"
    BACK = "back"
    HOME = "home"
    LOGOUT = "logout"
    UNKNOWN = "unknown"


@dataclass
class CommandResult:
    """Voice command result"""
    action: CommandAction
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


class VoiceCommandProcessor:
    """Process voice commands and map to actions"""
    
    def __init__(self):
        self._init_command_patterns()
    
    def _init_command_patterns(self):
        """Initialize command patterns and keywords"""
        self.commands = {
            CommandAction.IDENTIFY: {
                "patterns": [
                    r"identify", r"recognize", r"what is this",
                    r"tell me what fruit", r"name this fruit"
                ],
                "keywords": ["identify", "recognize", "what fruit"],
            },
            CommandAction.CAPTURE: {
                "patterns": [
                    r"capture", r"take photo", r"snap", r"picture",
                    r"take a picture", r"click photo"
                ],
                "keywords": ["capture", "photo", "picture", "snap"],
            },
            CommandAction.DASHBOARD: {
                "patterns": [
                    r"dashboard", r"stats", r"statistics",
                    r"my stats", r"show dashboard"
                ],
                "keywords": ["dashboard", "stats", "statistics"],
            },
            CommandAction.ENCYCLOPEDIA: {
                "patterns": [
                    r"encyclopedia", r"database", r"fruit list",
                    r"fruit database", r"show fruits"
                ],
                "keywords": ["encyclopedia", "database", "fruits"],
            },
            CommandAction.CHATBOT: {
                "patterns": [
                    r"chatbot", r"assistant", r"help me",
                    r"talk to assistant", r"open chat"
                ],
                "keywords": ["chatbot", "assistant", "chat"],
            },
            CommandAction.PROFILE: {
                "patterns": [
                    r"profile", r"my account", r"account",
                    r"view profile", r"my profile"
                ],
                "keywords": ["profile", "account"],
            },
            CommandAction.SETTINGS: {
                "patterns": [
                    r"settings", r"preferences", r"options",
                    r"app settings", r"change settings"
                ],
                "keywords": ["settings", "preferences", "options"],
            },
            CommandAction.HISTORY: {
                "patterns": [
                    r"history", r"past identifications",
                    r"my history", r"view history"
                ],
                "keywords": ["history", "past", "previous"],
            },
            CommandAction.FAVORITES: {
                "patterns": [
                    r"favorites", r"saved fruits", r"my favorites",
                    r"favourite", r"bookmarks"
                ],
                "keywords": ["favorites", "saved", "bookmarks"],
            },
            CommandAction.SEARCH: {
                "patterns": [
                    r"search for", r"find", r"look up",
                    r"search fruit"
                ],
                "keywords": ["search", "find", "look"],
            },
            CommandAction.HELP: {
                "patterns": [
                    r"help", r"what can I do", r"commands",
                    r"show commands", r"voice commands"
                ],
                "keywords": ["help", "commands", "what can"],
            },
            CommandAction.BACK: {
                "patterns": [
                    r"back", r"go back", r"previous",
                    r"return"
                ],
                "keywords": ["back", "previous", "return"],
            },
            CommandAction.HOME: {
                "patterns": [
                    r"home", r"go home", r"main menu",
                    r"home page"
                ],
                "keywords": ["home", "main"],
            },
            CommandAction.LOGOUT: {
                "patterns": [
                    r"logout", r"sign out", r"exit",
                    r"log out"
                ],
                "keywords": ["logout", "sign out", "exit"],
            },
        }
    
    async def process(self, command: str) -> CommandResult:
        """
        Process voice command and determine action
        
        Args:
            command: Voice command text
        
        Returns:
            CommandResult with action and details
        """
        command_lower = command.lower().strip()
        
        # Check each command pattern
        for action, config in self.commands.items():
            for pattern in config["patterns"]:
                if re.search(pattern, command_lower, re.IGNORECASE):
                    # Extract additional data (e.g., fruit name for search)
                    data = await self._extract_command_data(command_lower, action)
                    return CommandResult(
                        action=action,
                        success=True,
                        message=f"Executing {action.value} command",
                        data=data,
                    )
        
        return CommandResult(
            action=CommandAction.UNKNOWN,
            success=False,
            message="Command not recognized. Say 'help' for available commands.",
            data=None,
        )
    
    async def _extract_command_data(self, command: str, action: CommandAction) -> Optional[Dict[str, Any]]:
        """Extract additional data from command"""
        data = {}
        
        if action == CommandAction.IDENTIFY:
            # Extract fruit name if present
            fruit_patterns = [
                r"identify\s+([a-z\s]+)$",
                r"what is\s+([a-z\s]+)$",
                r"recognize\s+([a-z\s]+)$",
            ]
            for pattern in fruit_patterns:
                match = re.search(pattern, command)
                if match:
                    data["fruit_name"] = match.group(1).strip()
                    break
        
        elif action == CommandAction.SEARCH:
            # Extract search query
            search_patterns = [
                r"search for\s+(.+)$",
                r"find\s+(.+)$",
                r"look up\s+(.+)$",
            ]
            for pattern in search_patterns:
                match = re.search(pattern, command)
                if match:
                    data["query"] = match.group(1).strip()
                    break
        
        return data if data else None
    
    def get_available_commands(self, context: Optional[str] = None) -> List[Dict[str, str]]:
        """
        Get list of available voice commands
        
        Args:
            context: Optional context to filter commands
        
        Returns:
            List of command descriptions
        """
        commands = [
            {"command": "identify [fruit]", "action": "identify", "description": "Identify a fruit"},
            {"command": "capture", "action": "capture", "description": "Take a photo"},
            {"command": "dashboard", "action": "dashboard", "description": "Go to dashboard"},
            {"command": "encyclopedia", "action": "encyclopedia", "description": "Open fruit encyclopedia"},
            {"command": "chatbot", "action": "chatbot", "description": "Open chatbot assistant"},
            {"command": "profile", "action": "profile", "description": "View your profile"},
            {"command": "settings", "action": "settings", "description": "Open settings"},
            {"command": "history", "action": "history", "description": "View identification history"},
            {"command": "favorites", "action": "favorites", "description": "View favorite fruits"},
            {"command": "search for [fruit]", "action": "search", "description": "Search for a fruit"},
            {"command": "help", "action": "help", "description": "Show voice commands"},
            {"command": "back", "action": "back", "description": "Go back"},
            {"command": "home", "action": "home", "description": "Go to home page"},
            {"command": "logout", "action": "logout", "description": "Sign out"},
        ]
        
        return commands
    
    def get_help_text(self) -> str:
        """Get help text for voice commands"""
        commands = self.get_available_commands()
        help_lines = ["Available voice commands:"]
        
        for cmd in commands:
            help_lines.append(f"  • {cmd['command']} - {cmd['description']}")
        
        help_lines.append("\nTry saying: 'identify apple' or 'capture' or 'help'")
        
        return "\n".join(help_lines)