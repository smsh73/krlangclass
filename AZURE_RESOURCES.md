# Azure 리소스 정보

## 생성된 리소스

### 리소스 그룹
- **이름**: `krlangclass-rg`
- **위치**: `eastus`

### Azure Container Registry (ACR)
- **이름**: `krlangclassacr`
- **로그인 서버**: `krlangclassacr.azurecr.io`
- **사용자명**: `krlangclassacr`
- **비밀번호**: Azure Portal 또는 CLI에서 확인 가능

### PostgreSQL 데이터베이스
- **이름**: `krlangclass-db`
- **위치**: `koreacentral`
- **FQDN**: `krlangclass-db.postgres.database.azure.com`
- **관리자 사용자명**: `krlangadmin`
- **관리자 비밀번호**: `KrLang@2024!Secure`
- **데이터베이스 이름**: `postgres`
- **연결 문자열**: `postgresql://krlangadmin:KrLang@2024!Secure@krlangclass-db.postgres.database.azure.com/postgres?sslmode=require`

### App Service Plan
- **이름**: `krlangclass-plan`
- **위치**: `koreacentral`
- **SKU**: `B1` (Basic)

### App Service
- **이름**: `krlangclass-app`
- **URL**: `https://krlangclass-app.azurewebsites.net`
- **컨테이너 이미지**: `krlangclassacr.azurecr.io/krlangclass:latest`
- **Continuous Deployment**: 활성화됨

## 환경 변수

App Service에 설정된 환경 변수:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `SESSION_SECRET`: 세션 암호화 키
- `NODE_ENV`: `production`

## GitHub Secrets

다음 Secrets가 GitHub에 설정되어 있습니다:
- `ACR_LOGIN_SERVER`: `krlangclassacr.azurecr.io`
- `ACR_USERNAME`: `krlangclassacr`
- `ACR_PASSWORD`: (암호화되어 저장됨)
- `AZURE_APP_SERVICE_NAME`: `krlangclass-app`

## 다음 단계

1. **AI API 키 설정**: App Service 환경 변수에 추가
   ```bash
   az webapp config appsettings set \
     --name krlangclass-app \
     --resource-group krlangclass-rg \
     --settings \
       OPENAI_API_KEY="your-openai-key" \
       GOOGLE_GEMINI_API_KEY="your-gemini-key" \
       ANTHROPIC_API_KEY="your-claude-key"
   ```

2. **데이터베이스 마이그레이션 실행**: App Service에 연결하여 실행
   ```bash
   az webapp ssh --name krlangclass-app --resource-group krlangclass-rg
   # 또는
   az webapp log tail --name krlangclass-app --resource-group krlangclass-rg
   ```

3. **애플리케이션 접속**: https://krlangclass-app.azurewebsites.net

4. **관리자 계정 생성**: 로컬에서 실행
   ```bash
   npm run create-admin
   ```

## 리소스 관리

### 리소스 삭제
```bash
az group delete --name krlangclass-rg --yes --no-wait
```

### 비용 모니터링
Azure Portal에서 리소스 그룹의 비용을 확인할 수 있습니다.
