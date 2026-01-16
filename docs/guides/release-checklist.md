# 릴리즈 체크리스트

> 배포 전 확인 사항

## 빌드

- [ ] `npm run build:all` 성공
- [ ] `npm run typecheck` 성공
- [ ] 콘솔 에러 없음

## 테스트

### Figma 플러그인

- [ ] 플러그인 리로드 (`Plugins` > `Development` > `Reload`)
- [ ] Naming 기능 테스트
- [ ] Auto Layout 기능 테스트
- [ ] Cleanup 기능 테스트

### Agent Server

- [ ] 서버 재시작
- [ ] Health check: `curl http://localhost:3001/health`
- [ ] 각 엔드포인트 테스트

## 문서

- [ ] CHANGELOG.md 업데이트
- [ ] 버전 번호 업데이트 (`package.json`)
- [ ] 새 기능 문서화

## 커밋

```bash
# 버전 태그
git tag -a v2.x.x -m "Release v2.x.x"

# 푸시
git push origin main --tags
```

## 롤백 절차

문제 발생 시:

```bash
# 이전 버전으로 체크아웃
git checkout v2.x.x

# 빌드
npm run build:all

# 플러그인 리로드
```

## 관련 문서

- [Quickstart](../tutorials/quickstart.md)
- [CONTRIBUTING](../../CONTRIBUTING.md)
