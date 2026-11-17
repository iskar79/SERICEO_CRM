# SERICEO CRM 마이그레이션 통합 실행 계획서 (Master Execution Plan)

> **2026-11-17 khma 현행화**: Step 0 ~ Step 2, Step 4 ~ Step 11 구현 및 VDI 검증이 완료되었으며, Step 3(KSign SecureDB Agentless Java API V2) 코어 연동 및 개발서버(`112.106.119.13`) 구축·1차 암복호화 검증이 완료되어 현재 나머지 컬럼 쿼리 반영 및 통합 테스트를 진행 중입니다. (전체 완료 요약은 [PROJECT_WORK_REPORT.md](PROJECT_WORK_REPORT.md), 인프라/DB/암호화 기준은 [INFRA_AND_SECUREDB_REFERENCE.md](INFRA_AND_SECUREDB_REFERENCE.md) 참조)

---

## 1. 필수 작업 원칙
1. **Step-by-Step 진행 & VDI 2단계 검증 게이트**: 파일 단위로 수정 ➡️ 로컬 컴파일 확인 ➡️ VDI 반영(`Ctrl+C` ➡️ `Ctrl+V`) ➡️ 동작 검증 순서로 진행합니다.
2. **표준 주석 및 코드 보존**: 모든 수정 코드에는 `[YYYYMMDD] [khma]` 표준 주석을 작성하며, 운영 핵심 로직 변경 시 기존 코드를 주석으로 보존합니다.
3. **환경별 설정 분리**: `src/monarch.properties_*` 및 `src/properties/jdbc.properties_*`(`개발VDI`, `개발서버`, `운영서버`)를 기준으로 WAR 배포 대상 환경에 맞춰 적용합니다.

---

## 2. 전체 단계별 진행 현황

### 📖 Step 0: 아키텍처 구조 파악 및 베이스라인 검증 (완료)
* **관련 문서**: `ARCHITECTURE.md`, `AGENTS.md`, `INFRA_AND_SECUREDB_REFERENCE.md`
* **상태**: **완료** — 운영 소스(`sericrm_20261021`) 100% 동기화, 이클립스 빌드 경로 정비 및 VDI Tomcat 9 베이스라인 정상 기동 확인

### 🥇 Step 1: 시스템 버전 업그레이드 (완료)
* **관련 문서**: `1_TASK_SYSTEM_UPGRADE.md`
* **상태**: **완료** — Spring `4.3.30.RELEASE`, Commons(`fileupload 1.5`, `io 2.15.1`), jQuery `1.12.4`, `MappingJacksonJsonViewEx` 전환, `MonArchDaoImpl` 제네릭/로그인 쿼리 보정

### 🥈 Step 2: 엑셀 다운로드 보안 및 대용량 스트리밍 (완료)
* **관련 문서**: `2_TASK_EXCEL_DOWNLOAD_PWD.md`
* **상태**: **완료** — Apache POI `4.1.2` 교체, `DownXlsNew` 2단계 사유/암호 팝업, `CRM.M_EXCEL_DOWN_LOG` 감사 이력, 10만건 이상 스트리밍(`SXSSFWorkbook`/OpenCSV) 및 연타 방지 UX 적용

### 🥉 Step 3: 개인정보 암호화 — KSign SecureDB Agentless Java API V2 (진행 중)
* **관련 문서**: `3_TASK_SECUREDB_API.md`, `SECUREDB_GUIDE.md`, `INFRA_AND_SECUREDB_REFERENCE.md`
* **상태**: **코어 연동 및 개발서버 1차 검증 완료 / 나머지 컬럼 통합 테스트 중**
  - `SDBAgentlessAPIforJava-V3.7.3-2.0.4.jar` 및 `CryptoService`(싱글턴, `securedb.fail.closed=true`) 구축 완료
  - `MonArchDaoImpl`, `FilterGenerator`, `ExcelDownload`에서 `*_ENC` / `*_HASH` 컨벤션 기반 자동 암복호화·NTS 검색·엑셀 복호화 연동 완료
  - 개발서버(`112.106.119.13`, `D:\CRM\ROOT.war`) 구축 및 `NAME`/`NAME_ENC`/`NAME_HASH` 1차 검증 완료
  - 잔여: 나머지 개인정보 컬럼(`A_USER`, `A_FAMILY`, `US_USER` 등) 서비스 쿼리/화면 반영 및 통합 테스트 후 운영서버(`112.106.119.183`) 배포

### ✅ Step 4: 비밀번호 복잡도 및 아이디 저장 통합 (완료)
* **관련 문서**: `4_TASK_PASSWORD_VALIDATION_UNIFICATION.md`
* **상태**: **완료** — `MonArch800.js` `validatePassword` 통합 검증 및 `SAVE_ID` 쿠키 연동

### ✅ Step 5 ~ Step 11: 차세대 파일 시스템, 예외/통신 표준화, UI/성능 고도화 (완료)
* **관련 문서**: `5_TASK_FILE_SYSTEM_DRAG_DROP.md`, `PROJECT_WORK_REPORT.md`
* **상태**: **완료** — `CRM.M_FILE_MGMT` Drag&Drop 파일 시스템, `ResultInfo` JSON 예외/통신 통일, Core 모듈 5종 `js/core/` 분리, 그리드 `masking` 지원, `textarea` 디코딩 UX 개선 및 렌더링 최적화
