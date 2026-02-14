from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_role(self, value):
        """Validate role is either learner or manager"""
        if value not in ['learner', 'manager', 'admin']:
            raise serializers.ValidationError("Role must be 'learner', 'manager', or 'admin'")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'learner')
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            import os
            from django.conf import settings
            with open('db_check.log', 'a') as f:
                f.write(f"DB Path: {settings.DATABASES['default']['NAME']}\n")
        except:
            pass
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token
