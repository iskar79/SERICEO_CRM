# khma 소스 변경 및 VDI 동기화 관리대장

본 문서는 로컬 환경에서 수행된 모든 소스 코드의 **추가 / 수정 / 삭제(주석처리)** 내역을 한곳에서 파악하고, VDI 내부망으로 누락 없이 반영(복사-붙여넣기)하기 위한 단일 관리 문서입니다.

---

## 📌 1. VDI 반영 대상 파일 체크리스트 (최신 상태)

VDI 내부망으로 복사 및 덮어쓰기가 필요한 파일 목록입니다. 반영 완료 시 `[x]`로 체크하여 관리합니다.

* [ ] `0_MASTER_EXECUTION_PLAN.md` (20261001 khma 작업 순서 마스터 플랜 생성)
* [ ] `AGENTS.md` (20261001 khma 작업 가이드 및 시스템 아키텍처 수립)
* [ ] `ARCHITECTURE.md` (20261001 khma 시스템 아키텍처 상세 정의서 생성)
* [ ] `SECUREDB_PLAN1_UDF.md` (20261001 khma SecureDB 적용 1안 가이드 생성)
* [ ] `SECUREDB_PLAN2_API.md` (20261001 khma SecureDB 적용 2안 가이드 생성)
* [ ] `TASK2_EXCEL_DOWNLOAD_PWD.md` (20261001 khma 엑셀 암호화 가이드 생성)
* [ ] `TASK3_SYSTEM_UPGRADE.md` (20261001 khma 시스템 업그레이드 전략 생성)
* [ ] `.project` (20261001 khma 최신 이클립스 호환성을 위한 구형 VJET 찌꺼기 제거)

---

## 📋 2. 소스 변경 이력 상세 요약

| 일자 | 작업자 | 대상 파일 경로 | 구분 | 위치 (메서드/라인) | 변경 내용 요약 |
| :---: | :---: | :--- | :---: | :--- | :--- |
| 20261001 | khma | `AGENTS.md` | 수정 | 전체 | 프론트엔드 4대 핵심 기둥(Resource, MonArch800, superContaner, soap) 및 아키텍처 반영 |
| 20261001 | khma | `ARCHITECTURE.md` | 수정 | 전체 | 프론트엔드 4대 핵심 엔진 상세 명세 및 상속/호출 계층 다이어그램 보강 |
| 20261001 | khma | `ARCHITECTURE.md` | 수정 | 2, 4장 | DB 메타데이터 테이블 (M_SERVICE, M_STRUCTURE) 정보 추가 반영 |
| 20261001 | khma | `SECUREDB_PLAN1_UDF.md` | 추가 | 전체 | SecureDB 적용 방안 1 (DB UDF 기반) 액션 플랜 문서화 |
| 20261001 | khma | `SECUREDB_PLAN2_API.md` | 추가 | 전체 | SecureDB 적용 방안 2 (Java API + NTS 기반) 액션 플랜 문서화 |
| 20261001 | khma | `TASK2_EXCEL_DOWNLOAD_PWD.md` | 추가 | 전체 | 엑셀 다운로드 암호화 기능 개발 가이드 문서화 |
| 20261001 | khma | `TASK3_SYSTEM_UPGRADE.md` | 추가 | 전체 | 시스템 버전 업그레이드 전략 지침 문서화 |
| 20261001 | khma | `0_MASTER_EXECUTION_PLAN.md` | 추가 | 전체 | 마이그레이션 통합 실행 계획서 (작업 순서 강제) 가이드 신규 작성 |
| 20261001 | khma | `TASK2_EXCEL_DOWNLOAD_PWD.md` | 수정 | 전체 | prompt 평문 노출 버그 방지용 HTML 동적 팝업 레이어 로직 및 POI 문법 마이그레이션 1:1 매핑 추가 |
| 20261001 | khma | `TASK3_SYSTEM_UPGRADE.md` | 수정 | 전체 | VDI 폐쇄망 수동 반입 절차 명시, 17개 jar 다운로드 체크리스트 및 URL 추가, 보안 취약점 3종 패치 권고 추가 |
| 20261001 | khma | `SECUREDB_PLAN2_API.md` | 수정 | 4번 항목 | 기존 M_SERVICE 원문 무수정 원칙(Java 정규식 런타임 치환 기법) 적용 및 비전문적 용어(개조) 순화 |
| 20261001 | khma | `.project` | 수정 | 전체 | 최신 이클립스(2024버전 이상) 호환성을 위해 구형 VJET 및 JSDT 찌꺼기 플러그인 설정 제거 |

---

## 🔍 3. 작업 건별 세부 변경 내역 (Diff 요약)

### [20261001] khma - VDI 작업 가이드 및 시스템 아키텍처 체계 수립
* **대상 파일**: `AGENTS.md`, `ARCHITECTURE.md`, `CHANGELOG_KHMA.md`
* **작업 구분**: 아키텍처 상세 정의서 생성 및 가이드 문서 갱신
* **상세 내용**:
  * 기존 코드 무단 삭제 금지 및 주석 보존 원칙 수립
  * 주석 기본 순서(`날짜` > `khma` > `내용`) 표준화
  * AI 흔적 배제 및 VDI 사진 비교 교차 검증 원칙 수립
  * 프론트엔드 4대 핵심 파일 계층 구조(`Resource.js` ➡️ `MonArch800.js` ➡️ `superContaner.js` ➡️ `soap.2.0.js`) 및 백엔드 `SvcCRUD.java` 간의 상세 연계 메커니즘을 `ARCHITECTURE.md` 및 `AGENTS.md`에 완벽히 명문화
