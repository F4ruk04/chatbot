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

# Mapeamento de recursos por plano
PLAN_FEATURES: Dict[str, list[Feature]] = {
    SubscriptionPlan.FREE.value: [
        Feature.CHATBOT_TRAINING
    ],
    SubscriptionPlan.PRO.value: [
        Feature.CHATBOT_TRAINING,
        Feature.CUSTOM_BRANDING,
        Feature.ADVANCED_ANALYTICS,
        Feature.MULTI_LANGUAGE,
        Feature.FILE_ATTACHMENTS
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
        Feature.CUSTOM_INTEGRATION
    ]
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
