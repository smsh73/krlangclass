# Azure 배포 가이드

## GitHub Actions를 통한 자동 배포

GitHub에 코드를 푸시하면 자동으로 Azure ACR에 이미지가 빌드되고 배포됩니다.

### 필요한 GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 Secrets를 추가해야 합니다:

1. `ACR_LOGIN_SERVER` - Azure Container Registry 로그인 서버 (예: `myregistry.azurecr.io`)
2. `ACR_USERNAME` - ACR 사용자명
3. `ACR_PASSWORD` - ACR 비밀번호
4. `AZURE_APP_SERVICE_NAME` - Azure App Service 이름

### Secrets 설정 방법

1. GitHub 저장소로 이동: https://github.com/smsh73/krlangclass
2. Settings > Secrets and variables > Actions 클릭
3. "New repository secret" 클릭
4. 위의 4개 Secrets를 각각 추가

### 자동 배포 확인

1. GitHub 저장소의 "Actions" 탭에서 워크플로우 실행 상태 확인
2. main 브랜치에 푸시하면 자동으로 배포가 시작됩니다

## 수동 배포 (로컬에서)

로컬에서 직접 Azure ACR에 배포하려면:

### 1. Azure CLI 로그인

```bash
az login
```

### 2. ACR 정보 확인

```bash
az acr list --query "[].{Name:name,LoginServer:loginServer}" --output table
```

### 3. ACR 자격 증명 가져오기

```bash
ACR_NAME="your-acr-name"
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)
```

### 4. 배포 스크립트 실행

```bash
./scripts/deploy-to-acr.sh $ACR_LOGIN_SERVER $ACR_USERNAME $ACR_PASSWORD
```

또는 직접 Docker 명령어 사용:

```bash
# ACR 로그인
echo $ACR_PASSWORD | docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME --password-stdin

# 이미지 빌드
docker build -t $ACR_LOGIN_SERVER/krlangclass:latest .

# 이미지 푸시
docker push $ACR_LOGIN_SERVER/krlangclass:latest
```

## Azure App Service 설정

### 1. App Service 생성

```bash
az webapp create \
  --resource-group <resource-group-name> \
  --plan <app-service-plan-name> \
  --name <app-service-name> \
  --deployment-container-image-name <acr-login-server>/krlangclass:latest
```

### 2. ACR 연결 설정

```bash
az webapp config container set \
  --name <app-service-name> \
  --resource-group <resource-group-name> \
  --docker-custom-image-name <acr-login-server>/krlangclass:latest \
  --docker-registry-server-url https://<acr-login-server> \
  --docker-registry-server-user <acr-username> \
  --docker-registry-server-password <acr-password>
```

### 3. 환경 변수 설정

```bash
az webapp config appsettings set \
  --name <app-service-name> \
  --resource-group <resource-group-name> \
  --settings \
    DATABASE_URL="<postgresql-connection-string>" \
    SESSION_SECRET="<session-secret>" \
    OPENAI_API_KEY="<openai-key>" \
    GOOGLE_GEMINI_API_KEY="<gemini-key>" \
    ANTHROPIC_API_KEY="<claude-key>" \
    NODE_ENV="production"
```

### 4. Continuous Deployment 활성화

App Service가 ACR의 새 이미지를 자동으로 가져오도록 설정:

```bash
az webapp deployment container config \
  --name <app-service-name> \
  --resource-group <resource-group-name> \
  --enable-cd true
```

## 배포 확인

배포가 완료되면:

1. Azure Portal에서 App Service 상태 확인
2. 배포 로그 확인: `az webapp log tail --name <app-service-name> --resource-group <resource-group-name>`
3. 애플리케이션 URL로 접속하여 동작 확인

## 문제 해결

### GitHub Actions 실패 시

1. GitHub Actions 로그 확인
2. Secrets가 올바르게 설정되었는지 확인
3. ACR 자격 증명이 유효한지 확인

### 이미지 빌드 실패 시

1. 로컬에서 Docker 빌드 테스트: `docker build -t test .`
2. Dockerfile 문법 확인
3. .dockerignore 파일 확인

### 배포 후 애플리케이션 오류

1. App Service 로그 확인
2. 환경 변수 확인
3. 데이터베이스 연결 확인
4. Prisma 마이그레이션 실행 필요 여부 확인
