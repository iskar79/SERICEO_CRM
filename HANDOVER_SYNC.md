# 다중 PC 안티그래비티(Antigravity) 실시간 작업 공유 및 인수인계서

> **🔄 양방향 PC 동기화 규칙 (필독)**
> 1. **작업 시작 시 (`PC A` 또는 `PC B`에서 안티그래비티를 열었을 때)**:
>    * 반드시 가장 먼저 **`git pull github master`**를 실행하여 상대방 PC에서 작업한 최신 코드와 본 문서(`HANDOVER_SYNC.md`), `AGENTS.md`, `CHANGELOG_KHMA.md`를 내려받습니다.
>    * 본 문서의 **[1. 현재까지 완료된 작업 요약]**과 **[3. 지금 바로 시작할 다음 작업]**을 읽고 중단된 지점부터 정확히 이어서 진행합니다.
> 2. **단일 스텝(Step) 작업 완료 또는 PC 이동 시**:
>    * 작업한 내역을 본 문서(`HANDOVER_SYNC.md`), `AGENTS.md`(7번 섹션), `CHANGELOG_KHMA.md`에 최신 상태로 업데이트합니다.
>    * 반드시 **`git add -A && git commit -m "..." && git push github master`**를 실행하여 다른 PC에서도 즉시 이어받을 수 있도록 푸시합니다.
>    * *(주의: 원격 저장소 `origin`은 사내 내부망 GitLab이므로 외부 PC 간 공유 시에는 반드시 **`github`** 리모트(`https://github.com/iskar79/SERICEO_CRM.git`)를 사용합니다.)*

---

## 1. 현재까지 완료된 작업 요약 (Step 0 완료)

1. **운영 최신 소스 100% 동기화 및 정리 완료**:
   - 운영 백업본(`sericrm_20261021`) 기준으로 `src/` 및 `WebContent/` 전체를 100% 동기화 완료했습니다.
   - 운영 DB 테이블/프로시저 쿼리 12종은 `운영쿼리정보/` 폴더로 이관 보존했고, 불필요한 대용량 설치/첨부파일 및 중복 백업 파일을 모두 정리했습니다.
2. **Step 1 & Step 2 업그레이드용 라이브러리 사전 반입 완료**:
   - `WebContent/WEB-INF/lib/Spring 4.3.30 신규 라이브러리/`: Spring `4.3.30.RELEASE` 18종 + `commons-fileupload-1.5.jar` + `commons-io-2.15.1.jar` (총 20개 JAR)
   - `WebContent/js/jquery-1.12.4.min.js`: jQuery 1.12.4
   - `WebContent/WEB-INF/lib/POI 4.1.2 신규 라이브러리/`: POI 4.1.2 및 의존성 7종
3. **VDI 최초 반입 및 베이스라인 구동 성공 (완료 - 2026.10.29)**:
   - `sericeo_crm_VDI반입용_20261029.zip`(68.90MB)을 VDI 이클립스에 반입하고, **Default output folder를 `WebContent/WEB-INF/classes`로 설정**, **Java Compiler `1.7` 설정으로 현재 운영 베이스라인 톰캣 9 서버가 정상 구동되는 것까지 확인 완료**했습니다. (로컬 `.classpath` 및 `.settings/*`도 동일하게 동기화 완료)
   - ⚠️ **VDI 오라클 DB 접속 주소 유의**: 운영 서버(`26.2.51.37:1622`)와 달리 **VDI 내부에서 오라클 DB 접속 주소는 `70.2.251.122:4034` (`jdbc:oracle:thin:@70.2.251.122:4034:MICRODB`)**이며, VDI 이클립스의 `src/properties/jdbc.properties`에 이미 반영되어 있으므로 향후 VDI 파일 복사 시 `jdbc.properties`를 덮어쓰지 않도록 주의합니다.

---

## 2. 절대 준수해야 할 작업 원칙 (필수 리마인드)

1. **완전한 Step-by-Step 진행 (한 번에 하나씩)**:
   - 여기서 수정한 내용을 VDI 이클립스로 복사·붙여넣기 해야 하므로, 여러 파일을 한꺼번에 수정하지 말고 **반드시 파일 1개(또는 블록 1개) 단위로 수정 ➡️ 로컬 이클립스 에러 확인 ➡️ VDI 복사·붙여넣기 반영 ➡️ VDI 동작 확인** 순서로 진행합니다.
2. **외부 PC ➡️ VDI 클립보드 텍스트 복사·붙여넣기(`Ctrl+C` ➡️ `Ctrl+V`) 가이드 제공**:
   - 외부에서 VDI 내부로 텍스트 복사·붙여넣기가 가능하므로, 중소형 파일은 전체 덮어쓰기(`Ctrl+A` ➡️ `Ctrl+V`), 대형 파일(`superContaner.js` 등)은 이클립스 `Ctrl+L`(라인 이동) 기준 `[시작 라인 ~ 끝 라인]`, `[기존 코드 블록]`, `[교체할 khma 주석 포함 코드 블록]`을 정확히 안내합니다.
3. **기존 코드 삭제 절대 금지 & `khma` 주석 표준 엄수**:
   - 기존 코드는 절대 지우지 않고 주석(`/* ... */`, `//`, `<!-- ... -->`)으로 보존하며, 모든 주석은 `[날짜] [khma]` 순서(`// 20261029 khma Start : ...` ~ `End`)로 작성합니다.
4. **AI 작업 흔적 절대 금지**:
   - 코드, 주석, 문서 어디에도 AI 관련 단어나 영문 태그(`Why:`, `What:` 등)를 절대 남기지 않고 사내 `khma` 개발자 스타일과 100% 일치시킵니다.

---

## 3. 지금 바로 시작할 다음 작업: [Step 1-1]

`1_TASK_SYSTEM_UPGRADE.md`에 따라 **Step 1(시스템 버전 업그레이드)**을 3단계로 나누어 진행합니다:
- 👉 **[진행 대기 - 최우선 착수 대상] Step 1-1**: `WebContent/WEB-INF/lib/` 내 Spring `3.1.1` ➡️ `4.3.30.RELEASE` (18종) 및 `commons-fileupload-1.5.jar`, `commons-io-2.15.1.jar` 교체 (기존 구형 JAR는 삭제하지 않고 뒤에 `_20261029`를 붙여 백업 보존)
- **[대기] Step 1-2**: `WebContent/WEB-INF/Monarch820-servlet.xml` 상단 Spring XML 스키마(`xsd`) `3.0` ➡️ `4.3` 상향
- **[대기] Step 1-3**: `WebContent/ui/monform.jsp` 내 jQuery `1.10.2` ➡️ `1.12.4` 전환
