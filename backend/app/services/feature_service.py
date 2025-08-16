from enum import Enum
from typing import Dict, Optional
from ..models.subscription import SubscriptionPlan

class Feature(str, Enum):
    CUSTOM_BRANDING = "custom_branding"
    API_ACCESS = "api_access"
    PRIORITY_SUPPORT = "priority_support"
    ADVANCED_ANALYTICS = "advanced_analytics"
    CUSTOM_DOMAIN = "custom_domain"
    TEAM_MANAGEMENT = "team_management"
    CHATBOT_TRAINING = "chatbot_training"
    MULTI_LANGUAGE = "multi_language"
    CUSTOM_INTEGRATION = "custom_integration"
    FILE_ATTACHMENTS = "file_attachments"
    BASIC_DASHBOARD = "basic_dashboard"
    ADVANCED_DASHBOARD = "advanced_dashboard"
    REPORTS = "reports"

# Mapeamento de recursos por plano
PLAN_FEATURES: Dict[str, list[Feature]] = {
    SubscriptionPlan.FREE.value: [
        Feature.CHATBOT_TRAINING,
        Feature.BASIC_DASHBOARD
    ],
    SubscriptionPlan.PRO.value: [
        Feature.CHATBOT_TRAINING,
        Feature.CUSTOM_BRANDING,
        Feature.ADVANCED_ANALYTICS,
        Feature.MULTI_LANGUAGE,
        Feature.FILE_ATTACHMENTS,
        Feature.ADVANCED_DASHBOARD,
        Feature.REPORTS
    ],
    SubscriptionPlan.BUSINESS.value: [
        Feature.CHATBOT_TRAINING,
        Feature.CUSTOM_BRANDING,
        Feature.ADVANCED_ANALYTICS,
        Feature.MULTI_LANGUAGE,
        Feature.FILE_ATTACHMENTS,
        Feature.API_ACCESS,
        Feature.PRIORITY_SUPPORT,
        Feature.CUSTOM_DOMAIN,
        Feature.TEAM_MANAGEMENT,
        Feature.CUSTOM_INTEGRATION,
        Feature.ADVANCED_DASHBOARD,
        Feature.REPORTS
    ]
}

# Mapeamento de limites por plano (ex: mensagens, conexões WhatsApp)
PLAN_LIMITS: Dict[str, Dict[str, int]] = {
    SubscriptionPlan.FREE.value: {
        "messages_quota": 150,
        "whatsapp_connections": 1
    },
    SubscriptionPlan.PRO.value: {
        "messages_quota": 3000,
        "whatsapp_connections": 1
    },
    SubscriptionPlan.BUSINESS.value: {
        "messages_quota": 10000,
        "whatsapp_connections": 3
    }
}

class FeatureService:
    @staticmethod
    def has_feature(plan: Optional[str], feature: Feature) -> bool:
        """Verifica se um plano tem acesso a uma funcionalidade específica"""
        if not plan:
            return False
            
        plan_features = PLAN_FEATURES.get(plan, [])
        return feature in plan_features
    
    @staticmethod
    def get_plan_features(plan: str) -> list[Feature]:
        """Retorna todas as funcionalidades disponíveis para um plano"""
        return PLAN_FEATURES.get(plan, [])
